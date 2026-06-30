use escpos::driver::FileDriver;
use escpos::printer::Printer;
use escpos::utils::*;
use serialport::available_ports;
use std::path::Path;

fn open_printer(printer_name: Option<&str>) -> Result<Printer<FileDriver>, String> {
  let port_name = printer_name.unwrap_or("usb");
  let ports = available_ports().map_err(|e| format!("Failed to enumerate ports: {e}"))?;

  let path = if port_name == "usb" {
    let usb_port = ports.iter().find(|p| {
      matches!(p.port_type, serialport::SerialPortType::UsbPort(_))
    });
    match usb_port {
      Some(p) => p.port_name.clone(),
      None => return Err("No USB printer found".into()),
    }
  } else {
    if ports.iter().any(|p| p.port_name == port_name) {
      port_name.to_string()
    } else {
      return Err(format!("Printer port '{port_name}' not found"));
    }
  };

  let driver = FileDriver::open(Path::new(&path))
    .map_err(|e| format!("Failed to open printer port: {e}"))?;

  Printer::new(driver, Protocol::default())
    .map_err(|e| format!("Failed to create printer instance: {e}"))
}

#[tauri::command]
pub fn print_receipt(text: String, printer_name: Option<String>) -> Result<(), String> {
  let mut printer = open_printer(printer_name.as_deref())?;

  printer
    .init()
    .map_err(|e| format!("Printer init failed: {e}"))?;

  for line in text.lines() {
    printer
      .writeln(line)
      .map_err(|e| format!("Write line failed: {e}"))?;
  }

  printer
    .feeds(3)
    .map_err(|e| format!("Feed failed: {e}"))?;

  printer
    .cut()
    .map_err(|e| format!("Cut failed: {e}"))?;

  Ok(())
}

#[tauri::command]
pub fn print_barcode(data: String, printer_name: Option<String>) -> Result<(), String> {
  let mut printer = open_printer(printer_name.as_deref())?;

  printer
    .init()
    .map_err(|e| format!("Printer init failed: {e}"))?;

  printer
    .code39(&data)
    .map_err(|e| format!("Barcode print failed: {e}"))?;

  printer
    .feeds(3)
    .map_err(|e| format!("Feed failed: {e}"))?;

  printer
    .cut()
    .map_err(|e| format!("Cut failed: {e}"))?;

  Ok(())
}

#[tauri::command]
pub fn open_cash_drawer(printer_name: Option<String>) -> Result<(), String> {
  let mut printer = open_printer(printer_name.as_deref())?;

  printer
    .init()
    .map_err(|e| format!("Printer init failed: {e}"))?;

  printer
    .cash_drawer(CashDrawer::Pin2)
    .map_err(|e| format!("Cash drawer open failed: {e}"))?;

  Ok(())
}

#[tauri::command]
pub fn get_printer_list() -> Result<Vec<String>, String> {
  let ports = available_ports().map_err(|e| format!("Failed to enumerate ports: {e}"))?;
  let names: Vec<String> = ports.into_iter().map(|p| p.port_name).collect();
  Ok(names)
}
