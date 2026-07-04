# Offline Sync Architecture Plan

## Architecture Overview
```
[Browser PWA / Tauri Desktop]
        │
        ├── Dexie IndexedDB (Local Database)
        │   ├── Customers, Products, Inventory (cached)
        │   ├── Invoices, POS Sales (created offline)
        │   ├── Sync Queue (pending changes)
        │   └── ZATCA Queue (pending e-invoicing)
        │
        ├── Sync Engine
        │   ├── Online → Auto-sync
        │   ├── Offline → Queue and retry
        │   ├── Conflict Resolution
        │   └── Manual Sync Button
        │
        └── Status Indicator
            ├── Online (green)
            ├── Offline (red)
            └── Syncing (yellow)
```

## Current Implementation
- ✅ Dexie IndexedDB for local storage
- ✅ Sync queue with CRUD operations
- ✅ Sync engine with retry
- ✅ Conflict detection and resolution UI
- ✅ Device management
- ✅ Offline settings page
- ✅ Local database status page
- ✅ Background sync when online

## Enhancement Plan

### 1. Invoice Numbering Safety
**Problem:** Two devices offline could generate same invoice number
**Solution:**
- Per-branch, per-device invoice prefix
- Device registration with unique ID
- Local counter per device (e.g., BR001-DEV001-0001)
- On sync, server assigns official number
- Display local number and official number
- Synced invoice gets final server number

### 2. ZATCA Offline Queue Enhancement
**Problem:** ZATCA submission requires online API
**Solution:**
- Offline invoices marked as "pending_zatca"
- On online, submit to ZATCA in order
- Track ZATCA status per invoice (cleared/reported/failed)
- Retry failed submissions with exponential backoff
- ZATCA queue log with full request/response
- Notification on ZATCA status change

### 3. Conflict Resolution Enhancement
**Problem:** Same record edited offline on two devices
**Solution:**
- Last-write-wins by default
- Field-level conflict detection
- Conflict resolution UI (keep local, keep server, merge)
- Audit log of conflict resolution
- Automatic resolution for non-critical fields

### 4. Offline Status Indicator
- Global status bar component
- Shows connection status (online/offline/syncing)
- Shows pending sync count
- Shows last sync time
- Quick sync button in status bar
- Toast notification on connection change

### 5. Data Freshness
- Cache invalidation strategy per entity
- Re-fetch on online after threshold
- Stale-while-revalidate pattern
- Push notifications for critical updates

### 6. Background Sync
- Service Worker sync event
- Periodic sync (when supported)
- Sync on connectivity change
- Manual sync button with progress
- Sync log for troubleshooting

### 7. Critical Data Flow

#### Invoice Creation Offline
1. User creates invoice offline
2. Local invoice created with temp ID and local number
3. Items saved locally
4. ZATCA QR generated locally (from local data)
5. Invoice added to sync queue
6. When online: sync invoice → server assigns official number → generate UBL XML → submit to ZATCA → update local record
7. ZATCA status updated on local

#### POS Sale Offline
1. Sale created offline (products, prices, payments)
2. Local receipt generated with QR
3. Inventory deducted locally
4. Sale added to sync queue
5. When online: sync → update inventory on server → generate ZATCA simplified invoice → report to ZATCA

### 8. Sync Priority
1. High priority: Invoices, Payments (need ZATCA submission within 24h)
2. Medium priority: Customers, Products, Inventory
3. Low priority: Settings, Reports, Audit logs

### 9. Data Integrity
- Checksums on critical records
- Validation before sync
- Rollback on failure
- Audit trail for all sync operations
- No data loss guaranteed (queue persists in IndexedDB)
