# YASCO ERP - Comprehensive Enhancement Task List / Prompt

## Project Overview
**Project Name:** YASCO ERP (Enterprise Resource Planning)
**Technology Stack:** React + TypeScript + Vite + Tailwind CSS + tRPC + Drizzle ORM + SQLite/MySQL
**Architecture:** Modular vertical-based ERP with support for multiple industries
**Current Verticals:** Healthcare, Education, Hotel, Construction, Transport, Real-Estate, Travel, Aviation
**Languages:** English + Arabic (RTL supported)
**Compliance:** ZATCA Phase 2 (Saudi), VAT 15%, FBR (Pakistan), FTA (UAE)

## VPS Access
- **IP:** 203.161.63.59
- **User:** root
- **Password:** hEFZX17Y9rN7wiki34
- **Project Paths:** `./erp/`, `./yasco-erp/`, `./erp-backup-1782872602/`

---

## TASK 1: Language Change Button in Top Header
### Current State
- Language switch (EN/AR) is only at the bottom of the sidebar
- Top header has: Collapse toggle, Page title, Search bar, Country badge, AI Assistant, Voice Command, Notifications, User Profile

### Required Changes
- Add a **Language Toggle Button** in the top header, right next to the Notifications bell icon
- Use a `Globe` or `Languages` icon from lucide-react
- Show current language as a small label (e.g., "EN" or "AR") on the button
- On click, toggle between English and Arabic just like the sidebar button does
- Ensure RTL layout updates immediately
- Make it visible on all screen sizes (mobile + desktop)
- Style: `border-white/20 bg-white/10 text-white hover:bg-white/20` to match the AI Assistant button

### Files to Modify
- `src/components/AppLayout.tsx`

---

## TASK 2: License Key System on First Launch
### Current State
- SplashScreen exists but only sets `yasco-splash-shown` in sessionStorage
- SetupWizard has a license step but it's optional and appears AFTER registration
- `api/licenseRouter.ts` exists with `status` and `activate` endpoints
- `api/lib/license.ts` handles desktop license verification
- `DESKTOP_LICENSE_COOKIE` is used for license storage

### Required Changes
1. **Create a First-Run License Gate:**
   - Before showing the SplashScreen or any routes, check if a valid license is stored in `localStorage` (key: `yasco-license-key`)
   - If no valid license, show a full-screen **License Activation Page** instead of the app
   - License page design: Dark gradient background (matching existing theme), centered card with YASCO logo
   - Input field for license key (format: XXXX-XXXX-XXXX-XXXX or free-form)
   - "Activate" button that validates the key
   - Show validation status (success/error) with toast notifications
   - Add "Start Free Trial" option (14 days) that generates a trial license locally
   - Store activated license in `localStorage` with expiry date

2. **License Validation Logic:**
   - Use existing `verifyDesktopLicense` from `api/lib/license.ts` if available
   - For web mode, implement a simple local validation (format check + checksum) + expiry check
   - If license expired, show re-activation screen with a warning

3. **Backend Integration:**
   - Extend `licenseRouter.ts` with a `validate` endpoint that checks key format and returns license info
   - Add trial license generation endpoint

### Files to Create/Modify
- `src/pages/LicenseActivation.tsx` (new)
- `src/App.tsx` (add license check before splash)
- `src/hooks/useLicense.ts` (new - hook for license state)
- `api/licenseRouter.ts` (extend)
- `api/lib/license.ts` (extend for trial licenses)

---

## TASK 3: Company Details Entry After License Validation
### Current State
- SetupWizard exists with company info steps, but it's inside the authenticated app
- Company settings are stored in the database via `settings.companySettingsUpdate`

### Required Changes
1. **Post-License Setup Wizard:**
   - After license activation, show a multi-step **Company Onboarding** wizard
   - Steps:
     1. **Company Profile** - Company Name (EN+AR), Email, Phone, Website
     2. **Address** - Building, Street, District, City, Country, Zip
     3. **Tax & Legal** - CR Number, VAT Number (for SA), Tax Number
     4. **Business Category** - Select industry vertical (see Task 4)
     5. **Branding** - Logo upload, primary color, invoice header/footer
     6. **Complete**
   - Store all data in `localStorage` initially (before DB registration)
   - Allow user to proceed to registration/login with pre-filled company data
   - Show a summary card at the end with all entered details

2. **Persistence:**
   - Save company profile to `localStorage` key: `yasco-company-profile`
   - Load this data during actual registration to pre-fill fields
   - After successful registration, push to database via existing tRPC mutations

### Files to Create/Modify
- `src/pages/CompanyOnboarding.tsx` (new)
- `src/App.tsx` (routing after license)
- `src/pages/RegisterBusiness.tsx` (pre-fill from localStorage)

---

## TASK 4: Category Selection (Hospital, Workshop, etc.) with Dynamic Features
### Current State
- SetupWizard has a "Business Type" step with: construction, retail, restaurant, manufacturing, services, all
- Vertical pages exist but are hardcoded in routes
- No dynamic module enabling/disabling based on category

### Required Changes
1. **Expand Category Options:**
   - Replace/extend business type options with a comprehensive category selector:
     - `hospital` - Hospitals & Clinics
     - `workshop` - Automotive Workshop / Service Center
     - `construction` - Construction & Contracting
     - `retail` - Retail & Trading
     - `restaurant` - Restaurant & Food
     - `hotel` - Hotel & Hospitality
     - `manufacturing` - Manufacturing
     - `education` - Schools & Institutes
     - `transport` - Transport & Logistics
     - `real_estate` - Real Estate
     - `services` - General Services
     - `all` - Multi-Business (All Modules)

2. **Category-Based Module Enabling:**
   - Store selected category in company settings (`businessCategory`)
   - Create a `useCategoryModules()` hook that returns available modules based on category
   - Dynamically filter sidebar menu items based on selected category
   - Each category shows ONLY relevant menu items:
     - **Hospital:** Patients, Appointments, Doctor Roster, Insurance Claims + Accounting, Inventory, Sales, HRM
     - **Workshop:** Job Cards, Vehicles, Technicians, Estimates, Parts, Service History, Warranty + Accounting, Inventory, Sales, HRM
     - **Construction:** Projects, BOQ, WBS, Subcontractors, HSE, Equipment + Accounting, Inventory, Sales, HRM
     - etc.

3. **Backend Support:**
   - Add `businessCategory` field to company settings schema
   - Create a `getCategoryModules` endpoint that returns the module list

### Files to Create/Modify
- `src/hooks/useCategoryModules.ts` (new)
- `src/components/AppLayout.tsx` (dynamic menu filtering)
- `src/pages/SetupWizard.tsx` (update business type step)
- `src/pages/CompanyOnboarding.tsx` (category selection)
- `api/settingsRouter.ts` (add category field)
- `db/schema.ts` (add businessCategory to companySettings)

---

## TASK 5: Workshop Section for Saudi Automotive Workshops
### Research Summary - Saudi Workshop ERP Features
Based on leading Saudi workshop management systems, the module must include:

#### Core Modules:
1. **Job Card Management**
   - Create job cards per vehicle
   - Track job status: Pending -> In Progress -> Quality Check -> Completed -> Delivered
   - Assign technicians to jobs
   - Estimated vs actual labor hours
   - Service types: Maintenance, Repair, Body Work, Electrical, AC Service, Oil Change, etc.

2. **Customer & Vehicle Database**
   - Customer profile with multiple vehicles
   - Vehicle details: Make, Model, Year, Plate Number, VIN/Chassis, Color, Mileage
   - Service history per vehicle
   - Insurance info (Tameeni, etc.)
   - Najm / traffic accident report linkage

3. **Service Estimates & Quotations**
   - Create estimates before work begins
   - Parts + Labor breakdown
   - Customer approval workflow
   - Convert estimate to job card

4. **Technician Management**
   - Technician profiles and skills (Mechanic, Electrician, Painter, etc.)
   - Work assignments and schedules
   - Labor rate per technician/skill type
   - Performance tracking (jobs completed, efficiency)

5. **Parts & Inventory**
   - Spare parts catalog with Saudi OEM compatibility
   - Stock levels and reorder alerts
   - Parts consumption linked to job cards
   - Vendor/supplier management for parts

6. **Invoicing & Billing**
   - Workshop-specific invoice: Parts, Labor, Sublet (outsourced work), VAT 15%
   - ZATCA-compliant invoices with QR code
   - Payment tracking (Cash, Card, Bank Transfer, SADAD)
   - Insurance company billing (for accident repairs)

7. **Warranty Management**
   - Parts warranty tracking
   - Labor warranty (e.g., 3 months)
   - Warranty claims to suppliers

8. **Inspection Reports**
   - Vehicle inspection checklist
   - Photo upload for damage/condition
   - Digital signature from customer
   - Arabic + English report support

9. **Dashboard & Reports**
   - Daily jobs overview
   - Technician utilization
   - Parts profit margin
   - Revenue by service type
   - Outstanding invoices

### Implementation Plan
1. **Backend - tRPC Router:**
   - Create `api/workshopRouter.ts`
   - Endpoints:
     - `jobCardList`, `jobCardCreate`, `jobCardUpdate`, `jobCardGet`
     - `customerVehicleList`, `customerVehicleCreate`
     - `estimateList`, `estimateCreate`, `estimateApprove`
     - `technicianList`, `technicianCreate`
     - `workshopStats`
     - `serviceTypeList`

2. **Database Schema:**
   - `workshopCustomers` (extends base customers)
   - `workshopVehicles` (id, customerId, make, model, year, plateNumber, vin, color, mileage, insuranceCompany, policyNumber)
   - `workshopJobCards` (id, vehicleId, customerId, jobNumber, status, serviceType, description, estimatedCost, actualCost, technicianId, startDate, completionDate, warrantyMonths)
   - `workshopEstimates` (id, vehicleId, customerId, estimateNumber, status, partsTotal, laborTotal, subletTotal, taxAmount, totalAmount, approvedAt)
   - `workshopEstimateItems` (id, estimateId, type [part/labor/sublet], description, quantity, unitPrice, total)
   - `workshopTechnicians` (id, name, phone, specialty, hourlyRate, isActive)
   - `workshopInspections` (id, jobCardId, checklistJson, photos, customerSignature, notes)

3. **Frontend Pages:**
   - `src/pages/verticals/workshop/WorkshopLayout.tsx`
   - `src/pages/verticals/workshop/index.tsx` (Dashboard)
   - `src/pages/verticals/workshop/jobCards/JobCardList.tsx`
   - `src/pages/verticals/workshop/jobCards/JobCardCreate.tsx`
   - `src/pages/verticals/workshop/vehicles/VehicleList.tsx`
   - `src/pages/verticals/workshop/estimates/EstimateList.tsx`
   - `src/pages/verticals/workshop/technicians/TechnicianList.tsx`
   - `src/pages/verticals/workshop/inspections/InspectionForm.tsx`

4. **Route Registration:**
   - Add routes in `src/App.tsx`:
     - `/app/verticals/workshop` -> Workshop Dashboard
     - `/app/verticals/workshop/job-cards` -> Job Cards
     - `/app/verticals/workshop/vehicles` -> Vehicles
     - `/app/verticals/workshop/estimates` -> Estimates
     - `/app/verticals/workshop/technicians` -> Technicians
     - `/app/verticals/workshop/inspections` -> Inspections

5. **Sidebar Integration:**
   - Add WORKSHOP menu group (only when category === "workshop" or "all")

### Files to Create
- `api/workshopRouter.ts`
- `db/schema-workshop.ts`
- `src/pages/verticals/workshop/index.tsx`
- `src/pages/verticals/workshop/JobCards.tsx`
- `src/pages/verticals/workshop/Vehicles.tsx`
- `src/pages/verticals/workshop/Estimates.tsx`
- `src/pages/verticals/workshop/Technicians.tsx`
- `src/pages/verticals/workshop/Inspections.tsx`

---

## TASK 6: Dashboard Customization Option
### Current State
- Dashboard is hardcoded with specific KPIs, charts, and quick actions
- All users see the same layout regardless of their role or business category

### Required Changes
1. **Dashboard Widget System:**
   - Create modular dashboard widgets:
     - `KPIWidget` - Configurable KPI cards
     - `ChartWidget` - Revenue, sales charts
     - `QuickActionsWidget` - Category-specific quick actions
     - `AlertsWidget` - Notifications and alerts
     - `RecentActivityWidget` - Recent invoices, orders
     - `CalendarWidget` - Upcoming appointments/deadlines
   - Each widget can be shown/hidden and reordered

2. **Customization UI:**
   - Add a "Customize Dashboard" button on the Dashboard page
   - Open a panel/sheet with toggle switches for each widget
   - Allow drag-and-drop reordering (or simple up/down buttons)
   - Save layout to `localStorage` key: `yasco-dashboard-layout`
   - Support multiple preset layouts:
     - `default` - Current layout
     - `minimal` - Only KPIs + Quick Actions
     - `executive` - Charts + KPIs only
     - `operational` - Alerts + Recent Activity + Quick Actions

3. **Category-Aware Defaults:**
   - Hospital default: Show patient stats, appointment calendar, insurance claims
   - Workshop default: Show active job cards, technician utilization, parts alerts
   - Construction default: Show project progress, subcontractor payments, HSE alerts

4. **Backend:**
   - Add `dashboardLayout` field to user preferences table
   - Endpoint to save/load layout

### Files to Create/Modify
- `src/components/dashboard/DashboardWidget.tsx` (new)
- `src/components/dashboard/DashboardCustomizer.tsx` (new)
- `src/pages/Dashboard.tsx` (refactor to use widgets)
- `src/hooks/useDashboardLayout.ts` (new)
- `api/settingsRouter.ts` (add layout endpoints)
- `db/schema.ts` (add userPreferences table or extend existing)

---

## TASK 7: Improve Invoice Edit/Delete/View Buttons with 3D Styling
### Current State
- Invoices table has only an `Eye` icon button for viewing
- View dialog shows ZATCA actions but no edit/delete
- Buttons are flat and basic

### Required Changes
1. **Action Buttons in Invoice Table:**
   - Replace single Eye button with a button group:
     - **View** - 3D blue button with `Eye` icon
     - **Edit** - 3D amber/orange button with `Pencil` icon (only for draft/sent)
     - **Delete** - 3D red button with `Trash2` icon (only for draft)
     - **Print** - 3D emerald button with `Printer` icon
     - **Send** - 3D purple button with `Send` icon
   - Use CSS 3D effects:
     - `box-shadow: 0 4px 0 rgba(0,0,0,0.2)` for raised look
     - `active:translate-y-[2px] active:shadow-[0_2px_0_rgba(0,0,0,0.2)]` for press effect
     - `hover:translate-y-[-1px]` for hover lift
     - `rounded-lg` with gradient backgrounds

2. **Backend Edit/Delete Endpoints:**
   - Add `invoiceUpdate` mutation in `salesRouter.ts` (if not exists)
   - Add `invoiceDelete` mutation (soft delete or hard delete with confirmation)
   - Ensure ZATCA-cleared invoices cannot be edited (compliance rule)

3. **Styling Consistency:**
   - Apply the same 3D button style to:
     - Quotations page
     - Purchase Orders page
     - Credit Notes page
   - Create a reusable `ActionButton3D` component

4. **Edit Invoice Dialog:**
   - Reuse the invoice creation form but pre-filled with existing data
   - Show a warning banner if invoice was already sent to ZATCA
   - Track changes in an audit log

### Files to Create/Modify
- `src/components/ui/ActionButton3D.tsx` (new)
- `src/pages/sales/invoices.tsx` (update buttons + add edit/delete)
- `api/salesRouter.ts` (add update/delete mutations)
- `src/pages/sales/quotations.tsx` (apply 3D buttons)
- `src/pages/sales/orders.tsx` (apply 3D buttons)
- `src/pages/sales/credit-notes.tsx` (apply 3D buttons)

---

## Implementation Order (Recommended)
1. **Phase 1 - Foundation:**
   - Task 2: License Key System
   - Task 3: Company Onboarding
   - Task 1: Language Button in Header

2. **Phase 2 - Core Feature:**
   - Task 4: Category Selection
   - Task 6: Dashboard Customization

3. **Phase 3 - Vertical:**
   - Task 5: Workshop Section (all sub-modules)

4. **Phase 4 - Polish:**
   - Task 7: 3D Invoice Buttons

---

## Key Technical Notes
- All new pages must follow existing patterns: use `trpc` hooks, `shadcn/ui` components, `lucide-react` icons
- Maintain bilingual (EN/AR) support with `useLanguage()` hook
- For database changes, add migrations in `db/migrations/`
- For new tRPC routers, register in `api/router.ts`
- For new routes, add lazy imports and route definitions in `src/App.tsx`
- All tables must include `tenantId` for multi-tenancy
- Follow ZATCA compliance rules for invoice modifications
- 3D button CSS: `transform-style: preserve-3d; perspective: 500px;`
