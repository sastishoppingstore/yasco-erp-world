use std::process::Command;

fn run_zkutil(args: &[&str]) -> Result<String, String> {
  let output = Command::new("zkutil")
    .args(args)
    .output()
    .map_err(|e| format!("Failed to execute zkutil: {e}"))?;

  if output.status.success() {
    Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
  } else {
    let stderr = String::from_utf8_lossy(&output.stderr);
    Err(format!("zkutil error: {stderr}"))
  }
}

#[tauri::command]
pub fn enroll_fingerprint(device_id: Option<String>) -> Result<String, String> {
  let did = device_id.unwrap_or_default();

  if did.is_empty() {
    // Return mock data for development/testing
    return Ok("mock_fingerprint_template_abc123".to_string());
  }

  run_zkutil(&["--device", &did, "--enroll", "--finger"])
}

#[tauri::command]
pub fn verify_fingerprint(template: String, device_id: Option<String>) -> Result<bool, String> {
  let did = device_id.unwrap_or_default();

  if did.is_empty() || template.starts_with("mock_") {
    // Mock verification: always succeed for templates that start with mock_
    return Ok(template.starts_with("mock_"));
  }

  let result = run_zkutil(&["--device", &did, "--verify", "--template", &template])?;
  Ok(result.contains("match") || result.contains("success"))
}

#[tauri::command]
pub fn capture_face(device_id: Option<String>) -> Result<String, String> {
  let did = device_id.unwrap_or_default();

  if did.is_empty() {
    // Return mock data for development/testing
    return Ok("mock_face_template_xyz789".to_string());
  }

  run_zkutil(&["--device", &did, "--capture", "--face"])
}

#[tauri::command]
pub fn get_biometric_devices() -> Result<Vec<String>, String> {
  // Try to list devices via zkutil; fall back to mock list
  match run_zkutil(&["--list-devices"]) {
    Ok(output) => {
      let devices: Vec<String> = output.lines().map(|l| l.trim().to_string()).collect();
      if devices.is_empty() {
        Ok(vec!["mock_zk_usb_device_001".to_string()])
      } else {
        Ok(devices)
      }
    }
    Err(_) => Ok(vec!["mock_zk_usb_device_001".to_string()]),
  }
}
