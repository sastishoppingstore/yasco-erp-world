use sha2::{Digest, Sha256};
use std::net::NetworkInterface;
use sysinfo::{Disks, Networks, System};

#[tauri::command]
pub fn get_hardware_id() -> Result<String, String> {
  let cpu_id = get_cpu_id().unwrap_or_else(|_| "unknown_cpu".into());
  let disk_serial = get_disk_serial().unwrap_or_else(|_| "unknown_disk".into());
  let mac = get_mac_address().unwrap_or_else(|_| "unknown_mac".into());

  let combined = format!("{cpu_id}:{disk_serial}:{mac}");
  let mut hasher = Sha256::new();
  hasher.update(combined.as_bytes());
  let hash = hex::encode(hasher.finalize());

  Ok(hash)
}

#[tauri::command]
pub fn get_cpu_id() -> Result<String, String> {
  let s = System::new_all();
  let cpus = s.cpus();

  if let Some(cpu) = cpus.first() {
    // On Linux, try reading /proc/cpuinfo for the serial number
    #[cfg(target_os = "linux")]
    {
      let cpuinfo = std::fs::read_to_string("/proc/cpuinfo")
        .map_err(|e| format!("Failed to read /proc/cpuinfo: {e}"))?;
      for line in cpuinfo.lines() {
        if line.starts_with("Serial") {
          if let Some(serial) = line.split(':').nth(1) {
            return Ok(serial.trim().to_string());
          }
        }
      }
    }

    Ok(format!(
      "{} {} {}",
      cpu.vendor_id(),
      cpu.brand(),
      cpu.frequency()
    ))
  } else {
    Err("No CPU information available".into())
  }
}

#[tauri::command]
pub fn get_disk_serial() -> Result<String, String> {
  #[cfg(target_os = "linux")]
  {
    // Try reading disk serial from /dev/disk/by-id/
    if let Ok(entries) = std::fs::read_dir("/dev/disk/by-id/") {
      for entry in entries.flatten() {
        let path = entry.path();
        if let Some(name) = path.file_name() {
          let name_str = name.to_string_lossy();
          if !name_str.starts_with("usb-") && !name_str.starts_with("part-") {
            if let Ok(target) = std::fs::read_link(&path) {
              if target.to_string_lossy().contains("sda") {
                return Ok(name_str.to_string());
              }
            }
          }
        }
      }
    }

    // Fallback to sysinfo
    let disks = Disks::new_with_refreshed_list();
    for disk in &disks {
      let name = disk.name().to_string_lossy().to_string();
      if !name.is_empty() {
        return Ok(name);
      }
    }
  }

  #[cfg(target_os = "windows")]
  {
    let disks = Disks::new_with_refreshed_list();
    if let Some(disk) = disks.first() {
      return Ok(disk.name().to_string_lossy().to_string());
    }
  }

  #[cfg(target_os = "macos")]
  {
    let disks = Disks::new_with_refreshed_list();
    if let Some(disk) = disks.first() {
      return Ok(disk.name().to_string_lossy().to_string());
    }
  }

  Err("No disk information available".into())
}

#[tauri::command]
pub fn get_mac_address() -> Result<String, String> {
  let networks = Networks::new_with_refreshed_list();

  // Prefer non-loopback, non-virtual interfaces
  for (name, data) in &networks {
    if name != "lo"
      && name != "loopback"
      && !name.starts_with("docker")
      && !name.starts_with("veth")
      && !name.starts_with("br-")
    {
      let mac = data.mac_address();
      if mac != [0u8; 6] {
        let hex: Vec<String> = mac.iter().map(|b| format!("{b:02x}")).collect();
        return Ok(hex.join(":"));
      }
    }
  }

  // Fallback to any interface
  for (_name, data) in &networks {
    let mac = data.mac_address();
    if mac != [0u8; 6] {
      let hex: Vec<String> = mac.iter().map(|b| format!("{b:02x}")).collect();
      return Ok(hex.join(":"));
    }
  }

  Err("No MAC address found".into())
}
