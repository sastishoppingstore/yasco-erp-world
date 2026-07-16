use std::{
  fs::{self, OpenOptions},
  io::Write,
  net::{TcpStream, ToSocketAddrs},
  path::Path,
  time::{Duration, Instant},
};

use commands::{
  biometric::{capture_face, enroll_fingerprint, get_biometric_devices, verify_fingerprint},
  hardware_fingerprint::{get_cpu_id, get_disk_serial, get_hardware_id, get_mac_address},
  pos_printer::{get_printer_list, open_cash_drawer, print_barcode, print_receipt},
};
use tauri::Manager;
use tauri_plugin_shell::{
  process::{CommandChild, CommandEvent},
  ShellExt,
};
use tauri_plugin_sql::{Migration, MigrationKind};

mod commands;

struct BackendChild(Option<CommandChild>);

impl Drop for BackendChild {
  fn drop(&mut self) {
    if let Some(child) = self.0.take() {
      let _ = child.kill();
    }
  }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_process::init())
    .plugin(tauri_plugin_store::Builder::default().build())
    .plugin(
      tauri_plugin_sql::Builder::default()
        .add_migrations("sqlite:erp.db", get_migrations())
        .build(),
    )
    .invoke_handler(tauri::generate_handler![
      print_receipt,
      print_barcode,
      open_cash_drawer,
      get_printer_list,
      enroll_fingerprint,
      verify_fingerprint,
      capture_face,
      get_biometric_devices,
      get_hardware_id,
      get_cpu_id,
      get_disk_serial,
      get_mac_address,
    ])
    .setup(|app| {
      start_local_backend(app)?;

      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

fn start_local_backend(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
  let resource_dir = normalize_node_path(&app.path().resource_dir()?);
  let boot_script = resource_dir.join("dist").join("boot.js");
  let static_dir = resource_dir.join("dist").join("public");
  let backend_log = std::env::temp_dir().join("erp-system-backend.log");
  let backend_port = "32145";

  write_backend_log(
    &backend_log,
    &format!(
      "Starting backend\nresource_dir={}\nboot_script={}\nstatic_dir={}\n",
      resource_dir.display(),
      boot_script.display(),
      static_dir.display(),
    ),
  );

  let (mut rx, child) = app
    .shell()
    .sidecar("node")?
    .arg(boot_script)
    .current_dir(&resource_dir)
    .env("NODE_ENV", "production")
    .env("ERP_DESKTOP_MODE", "true")
    .env("HOST", "127.0.0.1")
    .env("PORT", backend_port)
    .env("ERP_BACKEND_LOG", &backend_log)
    .env("ERP_STATIC_DIR", static_dir)
    .env("APP_ID", std::env::var("APP_ID").unwrap_or_else(|_| "desktop_app".into()))
    .env(
      "APP_SECRET",
      std::env::var("APP_SECRET").unwrap_or_else(|_| "desktop_local_secret".into()),
    )
    .env(
      "DATABASE_URL",
      std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "mysql://erp:erp123@localhost:3306/erp".into()),
    )
    .spawn()?;

  let backend_log_for_task = backend_log.clone();
  tauri::async_runtime::spawn(async move {
    while let Some(event) = rx.recv().await {
      let line = match event {
        CommandEvent::Stdout(bytes) => {
          format!("[stdout] {}", String::from_utf8_lossy(&bytes))
        }
        CommandEvent::Stderr(bytes) => {
          format!("[stderr] {}", String::from_utf8_lossy(&bytes))
        }
        CommandEvent::Error(error) => format!("[error] {error}\n"),
        CommandEvent::Terminated(payload) => {
          format!("[terminated] code={:?} signal={:?}\n", payload.code, payload.signal)
        }
        _ => continue,
      };
      write_backend_log(&backend_log_for_task, &line);
    }
  });

  app.manage(BackendChild(Some(child)));
  wait_for_backend("127.0.0.1:32145", Duration::from_secs(15))?;
  Ok(())
}

fn normalize_node_path(path: &Path) -> std::path::PathBuf {
  let path_string = path.to_string_lossy();

  #[cfg(windows)]
  {
    if let Some(stripped) = path_string.strip_prefix(r"\\?\UNC\") {
      return std::path::PathBuf::from(format!(r"\\{stripped}"));
    }

    if let Some(stripped) = path_string.strip_prefix(r"\\?\") {
      return std::path::PathBuf::from(stripped);
    }
  }

  std::path::PathBuf::from(path_string.as_ref())
}

fn write_backend_log(path: &Path, message: &str) {
  if let Some(parent) = path.parent() {
    let _ = fs::create_dir_all(parent);
  }

  if let Ok(mut file) = OpenOptions::new().create(true).append(true).open(path) {
    let _ = file.write_all(message.as_bytes());
  }
}

fn wait_for_backend(addr: &str, timeout: Duration) -> Result<(), Box<dyn std::error::Error>> {
  let socket_addr = addr
    .to_socket_addrs()?
    .next()
    .ok_or_else(|| format!("Could not resolve backend address {addr}"))?;
  let started_at = Instant::now();

  while started_at.elapsed() < timeout {
    if TcpStream::connect_timeout(&socket_addr, Duration::from_millis(250)).is_ok() {
      return Ok(());
    }
    std::thread::sleep(Duration::from_millis(250));
  }

  Err(format!("Local backend did not start on {addr}").into())
}

fn get_migrations() -> Vec<Migration> {
  vec![
    Migration {
      version: 1,
      description: "create initial tables",
      sql: "CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_id INTEGER,
        tenant_id INTEGER,
        local_uuid TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        sku TEXT,
        barcode TEXT,
        description TEXT,
        price REAL DEFAULT 0,
        cost REAL DEFAULT 0,
        stock REAL DEFAULT 0,
        category_id INTEGER,
        unit TEXT DEFAULT 'pcs',
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        deleted_at TEXT,
        sync_status TEXT DEFAULT 'pending',
        last_synced_at TEXT,
        version INTEGER DEFAULT 1,
        device_id TEXT,
        created_by INTEGER,
        updated_by INTEGER
      );
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_id INTEGER,
        tenant_id INTEGER,
        local_uuid TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        city TEXT,
        country TEXT,
        tax_number TEXT,
        credit_limit REAL DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        deleted_at TEXT,
        sync_status TEXT DEFAULT 'pending',
        last_synced_at TEXT,
        version INTEGER DEFAULT 1,
        device_id TEXT,
        created_by INTEGER,
        updated_by INTEGER
      );
      CREATE TABLE IF NOT EXISTS suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_id INTEGER,
        tenant_id INTEGER,
        local_uuid TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        city TEXT,
        country TEXT,
        tax_number TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        deleted_at TEXT,
        sync_status TEXT DEFAULT 'pending',
        last_synced_at TEXT,
        version INTEGER DEFAULT 1,
        device_id TEXT,
        created_by INTEGER,
        updated_by INTEGER
      );
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_id INTEGER,
        tenant_id INTEGER,
        local_uuid TEXT UNIQUE NOT NULL,
        invoice_number TEXT,
        customer_id INTEGER,
        customer_name TEXT,
        invoice_date TEXT,
        due_date TEXT,
        subtotal REAL DEFAULT 0,
        tax_amount REAL DEFAULT 0,
        discount REAL DEFAULT 0,
        total REAL DEFAULT 0,
        status TEXT DEFAULT 'draft',
        notes TEXT,
        tax_status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        deleted_at TEXT,
        sync_status TEXT DEFAULT 'pending',
        last_synced_at TEXT,
        version INTEGER DEFAULT 1,
        device_id TEXT,
        created_by INTEGER,
        updated_by INTEGER,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      );
      CREATE TABLE IF NOT EXISTS invoice_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_id INTEGER,
        tenant_id INTEGER,
        local_uuid TEXT UNIQUE NOT NULL,
        invoice_id INTEGER,
        product_id INTEGER,
        product_name TEXT,
        quantity REAL DEFAULT 1,
        price REAL DEFAULT 0,
        total REAL DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        sync_status TEXT DEFAULT 'pending',
        FOREIGN KEY (invoice_id) REFERENCES invoices(id)
      );
      CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_id INTEGER,
        tenant_id INTEGER,
        local_uuid TEXT UNIQUE NOT NULL,
        sale_number TEXT,
        customer_id INTEGER,
        customer_name TEXT,
        sale_date TEXT,
        subtotal REAL DEFAULT 0,
        tax_amount REAL DEFAULT 0,
        discount REAL DEFAULT 0,
        total REAL DEFAULT 0,
        status TEXT DEFAULT 'draft',
        payment_method TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        deleted_at TEXT,
        sync_status TEXT DEFAULT 'pending',
        last_synced_at TEXT,
        version INTEGER DEFAULT 1,
        device_id TEXT,
        created_by INTEGER,
        updated_by INTEGER
      );
      CREATE TABLE IF NOT EXISTS sale_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_id INTEGER,
        tenant_id INTEGER,
        local_uuid TEXT UNIQUE NOT NULL,
        sale_id INTEGER,
        product_id INTEGER,
        product_name TEXT,
        quantity REAL DEFAULT 1,
        price REAL DEFAULT 0,
        total REAL DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        sync_status TEXT DEFAULT 'pending',
        FOREIGN KEY (sale_id) REFERENCES sales(id)
      );
      CREATE TABLE IF NOT EXISTS purchases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_id INTEGER,
        tenant_id INTEGER,
        local_uuid TEXT UNIQUE NOT NULL,
        purchase_number TEXT,
        supplier_id INTEGER,
        supplier_name TEXT,
        purchase_date TEXT,
        subtotal REAL DEFAULT 0,
        tax_amount REAL DEFAULT 0,
        total REAL DEFAULT 0,
        status TEXT DEFAULT 'draft',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        deleted_at TEXT,
        sync_status TEXT DEFAULT 'pending',
        last_synced_at TEXT,
        version INTEGER DEFAULT 1,
        device_id TEXT,
        created_by INTEGER,
        updated_by INTEGER
      );
      CREATE TABLE IF NOT EXISTS purchase_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_id INTEGER,
        tenant_id INTEGER,
        local_uuid TEXT UNIQUE NOT NULL,
        purchase_id INTEGER,
        product_id INTEGER,
        product_name TEXT,
        quantity REAL DEFAULT 1,
        price REAL DEFAULT 0,
        total REAL DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        sync_status TEXT DEFAULT 'pending',
        FOREIGN KEY (purchase_id) REFERENCES purchases(id)
      );
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_id INTEGER,
        tenant_id INTEGER,
        local_uuid TEXT UNIQUE NOT NULL,
        payment_number TEXT,
        customer_id INTEGER,
        supplier_id INTEGER,
        amount REAL DEFAULT 0,
        payment_date TEXT,
        payment_method TEXT,
        reference TEXT,
        notes TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        deleted_at TEXT,
        sync_status TEXT DEFAULT 'pending',
        last_synced_at TEXT,
        version INTEGER DEFAULT 1,
        device_id TEXT,
        created_by INTEGER,
        updated_by INTEGER
      );
      CREATE TABLE IF NOT EXISTS receipts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_id INTEGER,
        tenant_id INTEGER,
        local_uuid TEXT UNIQUE NOT NULL,
        receipt_number TEXT,
        invoice_id INTEGER,
        amount REAL DEFAULT 0,
        receipt_date TEXT,
        payment_method TEXT,
        notes TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        deleted_at TEXT,
        sync_status TEXT DEFAULT 'pending',
        last_synced_at TEXT,
        device_id TEXT,
        created_by INTEGER,
        updated_by INTEGER
      );
      CREATE TABLE IF NOT EXISTS stock_movements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_id INTEGER,
        tenant_id INTEGER,
        local_uuid TEXT UNIQUE NOT NULL,
        product_id INTEGER,
        quantity REAL DEFAULT 0,
        movement_type TEXT,
        reference_type TEXT,
        reference_id INTEGER,
        notes TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        sync_status TEXT DEFAULT 'pending',
        device_id TEXT,
        created_by INTEGER
      );
      CREATE TABLE IF NOT EXISTS cashbox_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_id INTEGER,
        tenant_id INTEGER,
        local_uuid TEXT UNIQUE NOT NULL,
        amount REAL DEFAULT 0,
        transaction_type TEXT,
        description TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        deleted_at TEXT,
        sync_status TEXT DEFAULT 'pending',
        last_synced_at TEXT,
        device_id TEXT,
        created_by INTEGER
      );
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_id INTEGER,
        tenant_id INTEGER,
        local_uuid TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        priority TEXT DEFAULT 'medium',
        assigned_to INTEGER,
        due_date TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        deleted_at TEXT,
        sync_status TEXT DEFAULT 'pending',
        last_synced_at TEXT,
        version INTEGER DEFAULT 1,
        device_id TEXT,
        created_by INTEGER,
        updated_by INTEGER
      );
      CREATE TABLE IF NOT EXISTS meetings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_id INTEGER,
        tenant_id INTEGER,
        local_uuid TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        meeting_date TEXT,
        start_time TEXT,
        end_time TEXT,
        participants TEXT,
        status TEXT DEFAULT 'scheduled',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        deleted_at TEXT,
        sync_status TEXT DEFAULT 'pending',
        last_synced_at TEXT,
        version INTEGER DEFAULT 1,
        device_id TEXT,
        created_by INTEGER,
        updated_by INTEGER
      );
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        action TEXT NOT NULL CHECK(action IN ('create','update','delete')),
        payload_json TEXT,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending','syncing','synced','failed','conflict')),
        retry_count INTEGER DEFAULT 0,
        error_message TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        synced_at TEXT
      );
      CREATE TABLE IF NOT EXISTS sync_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        direction TEXT NOT NULL CHECK(direction IN ('push','pull')),
        entity_type TEXT,
        entity_id TEXT,
        action TEXT,
        status TEXT NOT NULL,
        message TEXT,
        details_json TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS device_registration (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device_id TEXT UNIQUE NOT NULL,
        device_name TEXT,
        platform TEXT,
        user_id INTEGER,
        tenant_id INTEGER,
        last_seen TEXT,
        last_sync_at TEXT,
        app_version TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS deleted_records_tombstone (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        server_id INTEGER,
        deleted_at TEXT DEFAULT (datetime('now')),
        synced INTEGER DEFAULT 0
      );",
      kind: MigrationKind::Up,
    },
  ]
}
