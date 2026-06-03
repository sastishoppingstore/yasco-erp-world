#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_process::init())
    .plugin(tauri_plugin_store::Builder::default().build())
    .plugin(
      tauri_plugin_sql::Builder::default()
        .add_migrations("sqlite:erp.db", migrations)
        .build(),
    )
    .setup(|app| {
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

fn migrations(ver: &str) -> Result<Vec<&'static str>, Box<dyn std::error::Error>> {
  match ver {
    "0.1.0" => Ok(vec![
      "CREATE TABLE IF NOT EXISTS products (
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
      );
    "]),
    _ => Err("Migration version not supported".into()),
  }
}
