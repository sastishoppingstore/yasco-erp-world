# COMPREHENSIVE SECTION IMPROVEMENT PROMPT

## Saudi ERP Market Research Summary

### Construction Management ERP - Key Features (Saudi Market)
| Module | Features |
|--------|----------|
| **Project Accounting** | Project-wise P&L, cost center accounting, IFRS revenue recognition, WIP management |
| **BOQ Management** | Bill of quantities aligned to cost-breakdown structure, variation orders |
| **Subcontractor Management** | Retention tracking, ZATCA B2B invoicing, performance evaluation |
| **Progress Billing** | Automated against actual completion, milestone tracking, payment certificates |
| **Equipment & Fleet** | Maintenance scheduling, fuel logs, cost allocation to projects, OEE analysis |
| **Saudi HR & Payroll** | GOSI, Mudad wage protection, WPS, gratuity, overtime, shift management |
| **Quality & HSE** | QA/QC checklists, NCR, safety logs, risk assessments, incident registers |
| **ZATCA Phase 2** | E-invoicing integration, TLV QR codes, clearance, reporting |
| **BIM Integration** | Quantity takeoffs from 3D models, clash detection, asset handover |
| **Tendering** | Pre-qualification, bid management, contract award |
| **Material Management** | Procurement, logistics, site delivery tracking, wastage control |
| **Multi-Branch** | Multi-entity, multi-currency, centralized control |

### Workshop Management ERP - Key Features (Saudi Market)
| Module | Features |
|--------|----------|
| **Job Card Management** | Digital job cards, status tracking (Pending→In Progress→QC→Completed→Delivered) |
| **Vehicle Registry** | Customer vehicles, service history, mileage tracking, next service due |
| **Parts Inventory** | Part numbers, OEM compatibility, supersession, stock alerts, multi-brand |
| **Technician Management** | Skills, bay scheduling, time tracking, productivity analytics |
| **Estimates & Quotations** | Parts + Labor breakdown, customer approval via WhatsApp, convert to job |
| **Warranty Tracking** | Parts/labor warranty, claims processing, supplier warranty management |
| **ZATCA Invoicing** | Service invoices with TLV QR codes, VAT 15%, insurance billing |
| **CRM & Reminders** | Service reminders, appointment booking, customer communication (WhatsApp/SMS) |
| **Bay Management** | Bay utilization, scheduling, conflict resolution |
| **Analytics Dashboard** | Workshop performance, revenue by service type, technician KPI |

---

## IMPROVEMENT TASKS

### TASK 1: Improve Category Selection System
**Problem:** Category selection (hospital/workshop/construction etc.) affects sidebar but modules aren't fully dynamic. Category selection should drive ALL features visible to user.

**Requirements:**
- `useCategoryModules.ts` - Add ALL missing categories with complete module lists
- When user selects "hospital" → show ONLY hospital modules + accounting/inventory/sales/hrm
- When user selects "workshop" → show workshop modules + core modules
- When user selects "construction" → show construction modules + core modules
- When user selects "all" → show all available modules
- Store selected category in company settings (database field `businessCategory`)
- API endpoint: `settings.setBusinessCategory`, `settings.getBusinessCategory`
- Loading screen: "Loading modules for {category}..." on first load
- Admin can override category per-user

### TASK 2: Improve Workshop Management Section (Complete Overhaul)

#### 2.1 Workshop Dashboard (`src/pages/verticals/workshop/index.tsx`)
- Real KPI cards: Active Jobs, Pending Jobs, Completed Today, Revenue Today, Technicians Free/Busy
- Charts: Revenue by service type (pie), Jobs by day (bar), Technician productivity
- Quick links: New Job Card, New Estimate, Vehicle Lookup
- Recent job cards table with status indicators
- Bay utilization visualization (which bays are occupied/free)
- Alerts: Overdue jobs, low stock parts, pending customer approvals

#### 2.2 Job Cards Page (New - `src/pages/verticals/workshop/JobCards.tsx`)
**Full-Featured Job Card Management:**
- Filter by status (Pending, In Progress, Quality Check, Completed, Delivered, Cancelled)
- Search by job number, customer name, vehicle plate
- Create job card form: Vehicle (select with search), Service Type, Description, Customer Approval Required
- Job detail dialog/view: Full timeline, assigned technician, parts used, labor hours, photos
- Status progression with animated step indicator (like a progress bar with icons)
- Actions per status:
  - Pending → "Start Job" (set In Progress, assign technician)
  - In Progress → "Quality Check" (QC checklist), "Add Parts", "Add Labor Hours"
  - Quality Check → "Complete" (mark completed), "Request Rework"
  - Completed → "Deliver" (collect payment, print invoice)
  - Delivered → "Closed" (archive)
- Print job card PDF button
- WhatsApp notification to customer on status change
- Job timer: Track actual time spent vs estimated

#### 2.3 Vehicles Page (Rename from old, new `Vehicles.tsx`)
- Vehicle registration form: Make, Model, Year, Plate (Saudi format), VIN, Color, Mileage, Insurance Company, Policy Number, Insurance Expiry
- Vehicle detail: Full service history timeline, all job cards linked, total spent, last visit date
- Search by plate number, VIN, customer name
- Service reminders: Next oil change due, next inspection due, insurance expiry alerts
- Import/Export vehicle data (CSV)
- Multiple vehicles per customer display

#### 2.4 Technicians Page (New `Technicians.tsx`)
- Technician list: Name, Phone, Specialty, Hourly Rate, Jobs Completed, Avg Time, Rating
- Create/Edit technician form
- Current assignments: Active job cards per technician
- Schedule view: Calendar/board showing technician availability by day
- Performance metrics: Jobs per day/week/month, avg completion time, revenue generated

#### 2.5 Estimates Page (New `Estimates.tsx`)
- Estimate creation: Select vehicle, add parts (with prices from inventory), add labor (with hours + rate), add sublet (outsourced work)
- Auto-calculate: Parts total, Labor total, Subtotal, Tax (VAT 15%), Grand Total
- Send to customer via WhatsApp/Email/SMS
- Customer approval workflow: Pending → Approved → Convert to Job
- Convert estimate to job card with one click
- Estimate vs Actual comparison after job completion

#### 2.6 Parts Inventory
- Link with existing inventory module
- Show only "auto parts" / spare parts (filtered category)
- Part compatibility lookup: part fits which vehicles?
- Low stock alerts
- Supplier management for parts
- Parts usage per job card
- OEM part numbers cross-reference

#### 2.7 Inspections Page (New `Inspections.tsx`)
- Vehicle inspection checklist: AC, Lights, Tires, Brakes, Engine, Transmission, etc.
- Photo upload for each inspection item (before/after)
- Digital signature capture (customer acknowledgement)
- Arabic + English report
- Print inspection report
- Inspection history per vehicle

#### 2.8 Workshop API Router (`api/workshopRouter.ts`)
Extend with:
- `jobCardCreate` - Full job card with vehicle, customer, service type
- `jobCardUpdate` - Status change, technician assignment, parts, labor
- `jobCardGet` - Single job card with all relations
- `jobCardList` - Filtered list with pagination
- `vehicleLookup` - Search by plate/VIN
- `estimateCreate` - Full estimate with items
- `estimateApprove` - Customer approval
- `estimateConvertToJob` - One-click job creation
- `technicianSchedule` - Get technician schedule for date range
- `workshopStats` - Dashboard stats with revenue, counts
- `inspectionCreate` - Inspection with checklist + photos
- `notificationSend` - WhatsApp/SMS notification

#### 2.9 Database Schema (`db/schema-workshop.ts`)
Add/improve tables:
- `workshopJobCards` - Full fields: status, priority (urgent/normal), customerApproval, estimatedHours, actualHours
- `workshopJobParts` - Parts used per job (partId, quantity, price)
- `workshopJobLabor` - Labor entries (technicianId, hours, rate, description)
- `workshopVehicles` - Enhanced with insurance, registration, nextService fields
- `workshopEstimates` - Converted fields, approval fields, sentMethod
- `workshopEstimateItems` - Parts/labor/sublet items
- `workshopTechnicians` - Performance metrics fields
- `workshopInspections` - Full checklist JSON schema, photo URLs
- `workshopServiceTypes` - Predefined service types with default hours/price
- `workshopBaySchedule` - Bay number, date/time, jobCardId

#### 2.10 Routes in App.tsx
- `/app/verticals/workshop` → Dashboard
- `/app/verticals/workshop/job-cards` → Job Cards List
- `/app/verticals/workshop/job-cards/:id` → Job Card Detail
- `/app/verticals/workshop/job-cards/new` → Create Job Card
- `/app/verticals/workshop/vehicles` → Vehicle List
- `/app/verticals/workshop/vehicles/:id` → Vehicle Detail
- `/app/verticals/workshop/estimates` → Estimates List
- `/app/verticals/workshop/estimates/new` → Create Estimate
- `/app/verticals/workshop/technicians` → Technician List
- `/app/verticals/workshop/inspections` → Inspections
- `/app/verticals/workshop/inspections/new` → New Inspection

### TASK 3: Improve Construction Management Section (Complete Overhaul)

#### 3.1 Construction Dashboard (improve existing)
- KPI: Active Projects, Total Contract Value, Progress %, Subcontractors Active, Pending Payments, HSE Incidents
- Charts: Revenue by project, Cost vs Budget, Actual vs Planned timeline
- Quick actions: New Project, New BOQ, New Contract, New Variation
- Alerts: Overdue milestones, expired insurance, pending invoices
- Project list with progress bars per project
- Cash flow forecast chart

#### 3.2 Project Management Enhancement
- Project creation: Name, Client, Location, Contract Value, Start/End Date, Status
- Project phases/milestones with percentage completion
- Document attachment per project (contract PDF, drawings, permits)
- Budget tracking: Planned vs Actual costs
- Change order management within project
- Progress photo timeline
- Project team assignment (project manager, engineers, supervisors)

#### 3.3 WBS (Work Breakdown Structure) Enhancement
- Tree-like hierarchical WBS display
- Each WBS item: code, description, quantity, unit, budget cost, actual cost
- Progress tracking per WBS item (%)
- Material requirements per WBS item
- Labor requirements per WBS item
- Link WBS to BOQ items
- Gantt chart visualization for WBS schedule

#### 3.4 BOQ (Bill of Quantities) Enhancement
- Import BOQ from Excel/CSV
- BOQ items with: Item Code, Description, Unit, Quantity, Unit Price, Total
- Rate analysis per item (materials + labor + equipment + overhead)
- Variation order management: Original BOQ vs Revised BOQ
- Comparison view: Original vs Current vs Actual quantities
- Payment certificate generation based on completed BOQ items
- ZATCA-compliant progress billing invoices

#### 3.5 Subcontractor Management Enhancement
- Subcontractor registration: Company info, CR, VAT, Classification (Saudi SCA grade)
- Contracts: Scope, Value, Duration, Payment terms
- Subcontractor agreements/contracts document management
- Work progress tracking per subcontractor
- Payment certificates: Work done, retention (5-10%), deductions
- Performance evaluation: Quality, Safety, Timeliness rating
- NCR (Non-Conformance Reports) against subcontractors
- SCA compliance (Saudi Contractor Classification)

#### 3.6 HSE (Health, Safety, Environment) Enhancement
- Safety checklist templates per project type
- Daily/weekly safety inspections
- Incident reporting: Type, Description, Root Cause, Corrective Action
- Near-miss reporting
- Safety training records and certifications
- PPE issuance tracking
- Heat stress monitoring (summer months in KSA)
- HSE statistics dashboard: TRIFR, LTIFR, Safety Index
- Toolbox talk records with attendance
- Saudi-specific: Ministry of Labor HSE compliance

#### 3.7 Equipment & Fleet Enhancement
- Equipment register: ID, Type, Model, Year, Plate (if vehicle), Ownership
- Maintenance scheduling: Preventive maintenance calendar
- Fuel consumption tracking
- Operator assignment
- Equipment cost allocation to projects
- Rental/purchase tracking
- Downtime tracking with reasons
- OEE (Overall Equipment Effectiveness) metrics
- Insurance and registration expiry alerts

#### 3.8 Quality Management Enhancement
- QA/QC checklists per work type
- Inspection and test plans (ITP)
- NCR (Non-Conformance Report) workflow: Issue → Review → Correct → Close
- Material testing records
- Site handover documentation
- Punch list management (snagging)
- Commissioning records
- As-built documentation management

#### 3.9 Saudi Compliance Enhancement
- SBC (Saudi Building Code) compliance checking
- SCA classification management (update/certification tracking)
- GOSI compliance for workers
- ZATCA e-invoicing for progress billing
- Saudization / Nitaqat tracking
- Mudad wage protection compliance
- Ministry of Civil Defense approvals for fire safety
- Baladiya permits and approvals tracking

#### 3.10 Construction API Router (`api/constructionRouter.ts`) - Extend
- Add: `projectCreate`, `projectUpdate`, `projectList`, `projectGet`, `projectStats`
- Add: `wbsCreate`, `wbsUpdate`, `wbsList`, `wbsGet`
- Add: `boqImport`, `boqItemCreate`, `boqItemUpdate`, `boqCompare`
- Add: `subcontractorCreate`, `subcontractorEvaluate`
- Add: `variationCreate`, `variationList`, `variationApprove`
- Add: `hseIncidentReport`, `hseChecklistComplete`, `hseStats`
- Add: `progressBillingCreate`, `paymentCertificateCreate`
- Add: `qualityNcrCreate`, `qualityNcrClose`, `qualityChecklist`
- Add: `equipmentSchedule`, `equipmentCostAllocation`
- Add: `constructionStats` - Full dashboard data

### TASK 4: Improve Category-Specific Module Filtering
**Goal:** When user selects a category, ONLY relevant modules should be visible throughout the app.

**Implementation:**
1. `useCategoryModules.ts` - Refactor to include ALL categories with FULL module lists:
   - hospital: 15+ modules (Patients, Appointments, Roster, Insurance, Pharmacy, Lab, etc.)
   - workshop: 12+ modules (Job Cards, Vehicles, Technicians, Estimates, Parts, etc.)
   - construction: 12+ modules (Projects, WBS, BOQ, Subcontractors, HSE, etc.)
   - retail: 8+ modules (POS, Products, Customers, Sales, Inventory, etc.)
   - restaurant: 8+ modules (Restaurant POS, Menu, Tables, Delivery, etc.)
   - hotel: 10+ modules (Rooms, Bookings, Housekeeping, Folio, etc.)
   - manufacturing: 10+ modules (BOM, Work Orders, Production, Quality, etc.)
   - education: 8+ modules (Students, Admissions, Classes, Exams, etc.)
   - transport: 8+ modules (Fleet, Routes, Drivers, Shipments, etc.)
   - real_estate: 8+ modules (Properties, Leases, Maintenance, etc.)
   - services: 8+ modules (Projects, Tasks, Timesheets, etc.)
   - all: ALL modules enabled

2. **Dynamic Route Filtering:**
   - Create a `ModuleGuard` component that wraps routes
   - If user's category doesn't include the module, redirect or hide
   - Show "Module not available for your business category" message

3. **Sidebar Integration:**
   - Only show menu items for enabled modules
   - Group by main/core vs vertical
   - Show category badge in sidebar header (e.g., "Workshop Mode")

### TASK 5: Global UI/UX Improvements
- All vertical pages to follow consistent design pattern:
  - Header with title + action buttons (3D styled)
  - Filter/search bar
  - KPI cards row (gradient backgrounds)
  - Main content table/list
  - Create/Edit dialogs with proper forms
- All buttons to use ActionButton3D component
- All tables to have sortable headers
- All pages to support Arabic RTL
- All pages to show loading skeletons
- All pages to show empty states with helpful messages

### TASK 6: Database Migrations
- Create migration files for all new schemas
- Run migrations on VPS after deployment
- Ensure backward compatibility with existing data

---

## Implementation Order

```
Phase 1: Foundation
  → Task 4: Category Module Filtering (refactor useCategoryModules)
  → Task 6: Database Migrations

Phase 2: Workshop (Biggest)
  → Task 2.9: Database Schema
  → Task 2.8: API Router
  → Task 2.1-2.7: All Workshop Pages

Phase 3: Construction (Biggest)
  → Task 3.1-3.10: All Construction Improvements

Phase 4: Polish
  → Task 5: Global UI/UX Improvements
```

---

## File Changes Summary

| File | Action |
|------|--------|
| `src/hooks/useCategoryModules.ts` | **Refactor** - Add all categories with complete module lists |
| `src/components/AppLayout.tsx` | **Modify** - Dynamic sidebar filtering by category |
| `src/pages/verticals/workshop/index.tsx` | **Rewrite** - Full dashboard with stats, charts, alerts |
| `src/pages/verticals/workshop/JobCards.tsx` | **New** - Full job card management |
| `src/pages/verticals/workshop/JobCardDetail.tsx` | **New** - Job card timeline/detail view |
| `src/pages/verticals/workshop/Vehicles.tsx` | **New/Rewrite** - Vehicle registry with history |
| `src/pages/verticals/workshop/Technicians.tsx` | **New** - Tech management, schedule, performance |
| `src/pages/verticals/workshop/Estimates.tsx` | **New** - Estimate creation, approval, convert |
| `src/pages/verticals/workshop/Inspections.tsx` | **New** - Inspection checklist with photos |
| `src/pages/verticals/workshop/Parts.tsx` | **New** - Parts inventory integration |
| `api/workshopRouter.ts` | **Rewrite** - Add all endpoints |
| `db/schema-workshop.ts` | **Rewrite** - All tables with full fields |
| `src/pages/verticals/construction/*.tsx` | **Rewrite/Improve** - All construction pages |
| `api/constructionRouter.ts` | **Extend** - All new endpoints |
| `db/schema-construction-new.ts` | **Extend** - Additional tables |
| `src/App.tsx` | **Modify** - Add all new routes |
| `api/router.ts` | **Modify** - Register new endpoints |
