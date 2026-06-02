import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";

const moduleCards = [
  { moduleKey: "gl", iconName: "BookOpen", names: { en: "General Ledger", ar: "دفتر الأستاذ العام" }, description: "Comprehensive general ledger with multi-currency and multi-entity support for financial transactions, journal entries, and account reconciliation.", gradientFrom: "#6366f1", gradientTo: "#8b5cf6", featureCount: 14 },
  { moduleKey: "ap", iconName: "ArrowDownToLine", names: { en: "Accounts Payable", ar: "الحسابات الدائنة" }, description: "Manage vendor invoices, payment runs, purchase order matching, and aging reports with automated approval workflows.", gradientFrom: "#ef4444", gradientTo: "#f97316", featureCount: 11 },
  { moduleKey: "ar", iconName: "ArrowUpFromLine", names: { en: "Accounts Receivable", ar: "الحسابات المدينة" }, description: "Track customer invoices, receipts, credit notes, and collections with automated dunning and reconciliation.", gradientFrom: "#22c55e", gradientTo: "#10b981", featureCount: 11 },
  { moduleKey: "cash", iconName: "Wallet", names: { en: "Cash Management", ar: "إدارة النقدية" }, description: "Bank reconciliation, petty cash management, cash flow forecasting, and multi-bank account consolidation.", gradientFrom: "#0ea5e9", gradientTo: "#06b6d4", featureCount: 9 },
  { moduleKey: "fixed-assets", iconName: "Building2", names: { en: "Fixed Assets", ar: "الأصول الثابتة" }, description: "Track asset lifecycle from acquisition to disposal with depreciation schedules, revaluation, and impairment testing.", gradientFrom: "#a855f7", gradientTo: "#d946ef", featureCount: 10 },
  { moduleKey: "tax", iconName: "ReceiptPercent", names: { en: "Tax Management", ar: "إدارة الضرائب" }, description: "Automated VAT/GST calculation, tax return preparation, ZATCA integration, and multi-jurisdiction compliance.", gradientFrom: "#eab308", gradientTo: "#f59e0b", featureCount: 8 },
  { moduleKey: "budgeting", iconName: "ChartPie", names: { en: "Budgeting & Forecasting", ar: "الميزانية والتوقعات" }, description: "Create budgets, perform variance analysis, scenario planning, and rolling forecasts with what-if simulations.", gradientFrom: "#14b8a6", gradientTo: "#2dd4bf", featureCount: 9 },
  { moduleKey: "consolidation", iconName: "Layers", names: { en: "Consolidation", ar: "التوحيد المالي" }, description: "Multi-entity consolidation with intercompany eliminations, minority interest, and multi-currency translation.", gradientFrom: "#64748b", gradientTo: "#94a3b8", featureCount: 6 },
  { moduleKey: "revenue", iconName: "TrendingUp", names: { en: "Revenue Recognition", ar: "الاعتراف بالإيرادات" }, description: "ASC 606 / IFRS 15 compliant revenue recognition with contract-based scheduling and performance obligations.", gradientFrom: "#3b82f6", gradientTo: "#2563eb", featureCount: 8 },
  { moduleKey: "cost-accounting", iconName: "Calculator", names: { en: "Cost Accounting", ar: "محاسبة التكاليف" }, description: "Job costing, activity-based costing, overhead allocation, and cost center analysis for profitability insights.", gradientFrom: "#7c3aed", gradientTo: "#a78bfa", featureCount: 10 },
  { moduleKey: "procurement", iconName: "ShoppingCart", names: { en: "Procurement", ar: "المشتريات" }, description: "End-to-end procurement with RFQs, purchase orders, goods receipt, supplier evaluation, and contract management.", gradientFrom: "#f97316", gradientTo: "#fb923c", featureCount: 13 },
  { moduleKey: "inventory", iconName: "Package", names: { en: "Inventory Management", ar: "إدارة المخزون" }, description: "Multi-warehouse inventory with serial/lot tracking, cycle counting, bin management, and real-time stock valuation.", gradientFrom: "#10b981", gradientTo: "#34d399", featureCount: 16 },
  { moduleKey: "warehouse", iconName: "Warehouse", names: { en: "Warehouse Management", ar: "إدارة المستودعات" }, description: "Advanced WMS with pick-pack-ship workflows, wave planning, cross-docking, and RFID/barcode integration.", gradientFrom: "#0d9488", gradientTo: "#14b8a6", featureCount: 12 },
  { moduleKey: "supplier-portal", iconName: "Handshake", names: { en: "Supplier Portal", ar: "بوابة الموردين" }, description: "Self-service portal for suppliers to submit invoices, track PO status, and manage their profile and documents.", gradientFrom: "#059669", gradientTo: "#10b981", featureCount: 7 },
  { moduleKey: "sales", iconName: "Percent", names: { en: "Sales Management", ar: "إدارة المبيعات" }, description: "Quotes, sales orders, contracts, pricing matrices, and sales commission tracking with approval workflows.", gradientFrom: "#2563eb", gradientTo: "#3b82f6", featureCount: 14 },
  { moduleKey: "pos", iconName: "CreditCard", names: { en: "Point of Sale", ar: "نقطة البيع" }, description: "Omnichannel POS with offline mode, multiple payment methods, receipt printing, and customer display support.", gradientFrom: "#dc2626", gradientTo: "#ef4444", featureCount: 10 },
  { moduleKey: "ecommerce", iconName: "Globe", names: { en: "E-Commerce", ar: "التجارة الإلكترونية" }, description: "Unified commerce platform with product catalog, cart, checkout, order sync, and marketplace integrations.", gradientFrom: "#7c3aed", gradientTo: "#8b5cf6", featureCount: 11 },
  { moduleKey: "subscriptions", iconName: "Repeat", names: { en: "Subscriptions & Billing", ar: "الاشتراكات والفواتير" }, description: "Recurring billing with subscription plans, metered usage, dunning, and proration support.", gradientFrom: "#0891b2", gradientTo: "#06b6d4", featureCount: 9 },
  { moduleKey: "crm", iconName: "Users", names: { en: "CRM", ar: "إدارة علاقات العملاء" }, description: "Lead management, opportunity tracking, pipeline analytics, customer segmentation, and marketing automation.", gradientFrom: "#f43f5e", gradientTo: "#e11d48", featureCount: 16 },
  { moduleKey: "marketing", iconName: "Megaphone", names: { en: "Marketing Automation", ar: "أتمتة التسويق" }, description: "Multi-channel campaigns, email marketing, landing pages, lead scoring, and ROI analytics.", gradientFrom: "#d946ef", gradientTo: "#ec4899", featureCount: 11 },
  { moduleKey: "customer-portal", iconName: "CircleUser", names: { en: "Customer Portal", ar: "بوابة العملاء" }, description: "Self-service portal for ticket submission, invoice viewing, payment history, and knowledge base access.", gradientFrom: "#0ea5e9", gradientTo: "#38bdf8", featureCount: 8 },
  { moduleKey: "hrm", iconName: "Briefcase", names: { en: "HR Management", ar: "إدارة الموارد البشرية" }, description: "Employee records, organizational chart, document management, and HR workflow automation.", gradientFrom: "#8b5cf6", gradientTo: "#a78bfa", featureCount: 13 },
  { moduleKey: "payroll", iconName: "DollarSign", names: { en: "Payroll", ar: "الرواتب" }, description: "Automated payroll with tax calculations, social insurance, bonuses, deductions, and direct deposit integration.", gradientFrom: "#16a34a", gradientTo: "#22c55e", featureCount: 11 },
  { moduleKey: "attendance", iconName: "Clock", names: { en: "Attendance & Time", ar: "الحضور والوقت" }, description: "Biometric integration, shift scheduling, overtime calculation, leave management, and timesheet tracking.", gradientFrom: "#ca8a04", gradientTo: "#eab308", featureCount: 9 },
  { moduleKey: "recruitment", iconName: "UserPlus", names: { en: "Recruitment", ar: "التوظيف" }, description: "Applicant tracking, job board integration, interview scheduling, offer management, and onboarding workflows.", gradientFrom: "#ea580c", gradientTo: "#f97316", featureCount: 10 },
  { moduleKey: "performance", iconName: "Award", names: { en: "Performance Management", ar: "إدارة الأداء" }, description: "OKRs, KPIs, performance reviews, 360-degree feedback, and goal tracking with analytics dashboards.", gradientFrom: "#dc2626", gradientTo: "#ef4444", featureCount: 8 },
  { moduleKey: "manufacturing", iconName: "Factory", names: { en: "Manufacturing", ar: "التصنيع" }, description: "BOM management, MRP, production orders, shop floor control, quality inspection, and OEE tracking.", gradientFrom: "#4f46e5", gradientTo: "#6366f1", featureCount: 15 },
  { moduleKey: "quality", iconName: "ShieldCheck", names: { en: "Quality Management", ar: "إدارة الجودة" }, description: "Non-conformance tracking, CAPA, audit management, inspection plans, and quality metrics dashboards.", gradientFrom: "#059669", gradientTo: "#10b981", featureCount: 8 },
  { moduleKey: "maintenance", iconName: "Wrench", names: { en: "Maintenance Management", ar: "إدارة الصيانة" }, description: "Preventive maintenance schedules, work orders, asset uptime tracking, and spare parts inventory integration.", gradientFrom: "#b45309", gradientTo: "#d97706", featureCount: 9 },
  { moduleKey: "project", iconName: "Kanban", names: { en: "Project Management", ar: "إدارة المشاريع" }, description: "Project planning, Gantt charts, resource allocation, timesheets, budget tracking, and milestone management.", gradientFrom: "#0369a1", gradientTo: "#0284c7", featureCount: 14 },
  { moduleKey: "tasks", iconName: "CheckSquare", names: { en: "Task Management", ar: "إدارة المهام" }, description: "Kanban boards, task dependencies, priorities, notifications, and team collaboration with real-time updates.", gradientFrom: "#4338ca", gradientTo: "#4f46e5", featureCount: 8 },
  { moduleKey: "timesheets", iconName: "Timer", names: { en: "Timesheets", ar: "سجلات الوقت" }, description: "Time tracking with project/activity tagging, approval workflows, billing rates, and utilization reports.", gradientFrom: "#0e7490", gradientTo: "#0891b2", featureCount: 7 },
  { moduleKey: "helpdesk", iconName: "Headphones", names: { en: "Help Desk", ar: "خدمة العملاء" }, description: "Ticket management with SLA tracking, automated routing, knowledge base, and customer satisfaction surveys.", gradientFrom: "#6d28d9", gradientTo: "#7c3aed", featureCount: 11 },
  { moduleKey: "knowledge-base", iconName: "Library", names: { en: "Knowledge Base", ar: "قاعدة المعرفة" }, description: "Centralized documentation with article categorization, versioning, search, and role-based access control.", gradientFrom: "#1e40af", gradientTo: "#1d4ed8", featureCount: 6 },
  { moduleKey: "field-service", iconName: "MapPin", names: { en: "Field Service", ar: "الخدمة الميدانية" }, description: "Dispatch management, mobile workforce tracking, service appointments, and inventory for field technicians.", gradientFrom: "#15803d", gradientTo: "#16a34a", featureCount: 9 },
  { moduleKey: "rental", iconName: "CalendarClock", names: { en: "Rental Management", ar: "إدارة التأجير" }, description: "Equipment/vehicle rental with availability calendar, contracts, billing cycles, and maintenance scheduling.", gradientFrom: "#a21caf", gradientTo: "#c026d3", featureCount: 8 },
  { moduleKey: "real-estate", iconName: "Home", names: { en: "Real Estate", ar: "العقارات" }, description: "Property management with lease contracts, rent collection, maintenance requests, and tenant portal.", gradientFrom: "#b91c1c", gradientTo: "#dc2626", featureCount: 10 },
  { moduleKey: "hospitality", iconName: "Hotel", names: { en: "Hospitality", ar: "الضيافة" }, description: "Hotel PMS with booking engine, channel manager, housekeeping, restaurant POS, and guest experience.", gradientFrom: "#c2410c", gradientTo: "#ea580c", featureCount: 12 },
  { moduleKey: "healthcare", iconName: "Stethoscope", names: { en: "Healthcare", ar: "الرعاية الصحية" }, description: "EHR/EMR, appointment scheduling, billing, insurance claims, and patient portal with HIPAA compliance.", gradientFrom: "#0f766e", gradientTo: "#0d9488", featureCount: 13 },
  { moduleKey: "education", iconName: "GraduationCap", names: { en: "Education", ar: "التعليم" }, description: "Student management, course scheduling, grade books, attendance, LMS integration, and parent portal.", gradientFrom: "#1d4ed8", gradientTo: "#2563eb", featureCount: 10 },
  { moduleKey: "nonprofit", iconName: "HeartHandshake", names: { en: "Nonprofit", ar: "المنظمات غير الربحية" }, description: "Donor management, grant tracking, volunteer coordination, fundraising campaigns, and impact reporting.", gradientFrom: "#db2777", gradientTo: "#ec4899", featureCount: 8 },
  { moduleKey: "bi", iconName: "BarChart3", names: { en: "Business Intelligence", ar: "ذكاء الأعمال" }, description: "Interactive dashboards, ad-hoc reports, drill-down analytics, data visualization, and scheduled report delivery.", gradientFrom: "#0891b2", gradientTo: "#06b6d4", featureCount: 11 },
  { moduleKey: "analytics", iconName: "LineChart", names: { en: "Advanced Analytics", ar: "التحليلات المتقدمة" }, description: "Predictive analytics, trend forecasting, cohort analysis, and machine learning-powered insights.", gradientFrom: "#6b21a8", gradientTo: "#7c3aed", featureCount: 7 },
  { moduleKey: "reporting", iconName: "FileText", names: { en: "Reporting", ar: "التقارير" }, description: "Custom report builder with drag-and-drop designer, parameterized reports, and export to PDF/Excel.", gradientFrom: "#374151", gradientTo: "#4b5563", featureCount: 8 },
  { moduleKey: "approvals", iconName: "Stamp", names: { en: "Approval Workflows", ar: "سير عمل الموافقات" }, description: "Configurable multi-level approval chains with delegation, escalation, and mobile approval capabilities.", gradientFrom: "#a16207", gradientTo: "#ca8a04", featureCount: 7 },
  { moduleKey: "document", iconName: "FolderOpen", names: { en: "Document Management", ar: "إدارة المستندات" }, description: "Centralized document repository with version control, metadata tagging, OCR search, and access permissions.", gradientFrom: "#0f172a", gradientTo: "#1e293b", featureCount: 9 },
  { moduleKey: "contracts", iconName: "FileSignature", names: { en: "Contract Management", ar: "إدارة العقود" }, description: "Contract lifecycle management with templates, e-signatures, renewal alerts, and obligation tracking.", gradientFrom: "#78350f", gradientTo: "#92400e", featureCount: 8 },
  { moduleKey: "compliance", iconName: "Shield", names: { en: "Compliance", ar: "الامتثال" }, description: "Regulatory compliance tracking, audit trails, policy management, and compliance reporting across frameworks.", gradientFrom: "#1e3a5f", gradientTo: "#1e40af", featureCount: 8 },
  { moduleKey: "risk", iconName: "TriangleAlert", names: { en: "Risk Management", ar: "إدارة المخاطر" }, description: "Risk register, assessment matrices, mitigation tracking, heat maps, and risk reporting dashboards.", gradientFrom: "#7f1d1d", gradientTo: "#991b1b", featureCount: 7 },
  { moduleKey: "audit", iconName: "SearchCheck", names: { en: "Audit Management", ar: "إدارة التدقيق" }, description: "Internal audit planning, execution, findings tracking, remediation workflows, and audit committee reporting.", gradientFrom: "#292524", gradientTo: "#44403c", featureCount: 6 },
  { moduleKey: "dms", iconName: "FileSpreadsheet", names: { en: "Data Management", ar: "إدارة البيانات" }, description: "Data import/export, master data management, data quality rules, deduplication, and bulk update tools.", gradientFrom: "#52525b", gradientTo: "#71717a", featureCount: 7 },
  { moduleKey: "edi", iconName: "ArrowLeftRight", names: { en: "EDI & Integration", ar: "EDI والتكامل" }, description: "Electronic data interchange with trading partners, EDI document mapping, and automated data transformation.", gradientFrom: "#0c4a6e", gradientTo: "#075985", featureCount: 6 },
  { moduleKey: "api", iconName: "Cable", names: { en: "API & Webhooks", ar: "API وخطافات الويب" }, description: "RESTful API gateway, webhook subscriptions, event-driven architecture, and developer portal with docs.", gradientFrom: "#020617", gradientTo: "#0f172a", featureCount: 8 },
  { moduleKey: "workflow", iconName: "GitBranch", names: { en: "Workflow Engine", ar: "محرك سير العمل" }, description: "Visual workflow designer, BPMN 2.0 support, conditional branching, timers, and integration with all modules.", gradientFrom: "#312e81", gradientTo: "#3730a3", featureCount: 9 },
  { moduleKey: "forms", iconName: "ClipboardList", names: { en: "Forms & Surveys", ar: "النماذج والاستبيانات" }, description: "Drag-and-drop form builder with conditional logic, file uploads, e-signatures, and response analytics.", gradientFrom: "#166534", gradientTo: "#15803d", featureCount: 7 },
  { moduleKey: "branding", iconName: "Palette", names: { en: "Branding & Themes", ar: "العلامة التجارية والثيمات" }, description: "White-label capabilities, custom themes, logo management, email templates, and brand consistency tools.", gradientFrom: "#6b21a8", gradientTo: "#7c3aed", featureCount: 6 },
  { moduleKey: "multi-tenant", iconName: "Building", names: { en: "Multi-Tenant", ar: "متعدد المستأجرين" }, description: "Multi-tenancy with data isolation, tenant provisioning, and tenant-specific branding and configurations.", gradientFrom: "#1e3a5f", gradientTo: "#1e40af", featureCount: 7 },
  { moduleKey: "localization", iconName: "Languages", names: { en: "Localization", ar: "التعريب" }, description: "Full RTL support, multi-language translations, regional date/number formats, and locale-specific regulations.", gradientFrom: "#047857", gradientTo: "#059669", featureCount: 6 },
  { moduleKey: "currency", iconName: "CircleDollarSign", names: { en: "Multi-Currency", ar: "متعدد العملات" }, description: "Multi-currency support with real-time exchange rates, revaluation, and automatic currency gain/loss recognition.", gradientFrom: "#b45309", gradientTo: "#d97706", featureCount: 6 },
  { moduleKey: "mobile", iconName: "Smartphone", names: { en: "Mobile App", ar: "التطبيق المحمول" }, description: "Native mobile apps for iOS and Android with offline access, push notifications, and barcode scanning.", gradientFrom: "#4f46e5", gradientTo: "#6366f1", featureCount: 10 },
  { moduleKey: "notifications", iconName: "Bell", names: { en: "Notifications", ar: "الإشعارات" }, description: "Multi-channel notifications via email, SMS, push, and in-app with templates and delivery analytics.", gradientFrom: "#b91c1c", gradientTo: "#dc2626", featureCount: 6 },
  { moduleKey: "email", iconName: "Mail", names: { en: "Email", ar: "البريد الإلكتروني" }, description: "Integrated email system with SMTP/IMAP, templates, bulk email campaigns, and email-to-case processing.", gradientFrom: "#0369a1", gradientTo: "#0284c7", featureCount: 7 },
  { moduleKey: "sms", iconName: "MessageSquare", names: { en: "SMS & WhatsApp", ar: "SMS وواتساب" }, description: "SMS and WhatsApp Business API integration for alerts, notifications, marketing, and two-way conversations.", gradientFrom: "#0f766e", gradientTo: "#0d9488", featureCount: 5 },
  { moduleKey: "portal", iconName: "Monitor", names: { en: "Employee Portal", ar: "بوابة الموظفين" }, description: "Self-service portal for leave requests, payslips, expense claims, personal info updates, and company announcements.", gradientFrom: "#4338ca", gradientTo: "#4f46e5", featureCount: 8 },
  { moduleKey: "expense", iconName: "Receipt", names: { en: "Expense Management", ar: "إدارة المصروفات" }, description: "Employee expense submission, policy enforcement, approval routing, corporate card integration, and reimbursement.", gradientFrom: "#a16207", gradientTo: "#ca8a04", featureCount: 8 },
  { moduleKey: "travel", iconName: "Plane", names: { en: "Travel Management", ar: "إدارة السفر" }, description: "Travel booking, expense tracking, itinerary management, approval workflows, and travel policy compliance.", gradientFrom: "#075985", gradientTo: "#0284c7", featureCount: 6 },
  { moduleKey: "assets", iconName: "Cpu", names: { en: "Asset Management", ar: "إدارة الأصول" }, description: "Track company assets including IT equipment, furniture, and vehicles with check-in/check-out and lifecycle management.", gradientFrom: "#52525b", gradientTo: "#71717a", featureCount: 8 },
  { moduleKey: "licenses", iconName: "KeyRound", names: { en: "License Management", ar: "إدارة التراخيص" }, description: "Software license tracking, renewal alerts, compliance monitoring, and usage analytics.", gradientFrom: "#6b21a8", gradientTo: "#7c3aed", featureCount: 5 },
  { moduleKey: "vendor", iconName: "Truck", names: { en: "Vendor Management", ar: "إدارة الموردين" }, description: "Vendor onboarding, performance scorecards, contract management, RFx processes, and relationship management.", gradientFrom: "#a21caf", gradientTo: "#c026d3", featureCount: 9 },
  { moduleKey: "customer", iconName: "Contact", names: { en: "Customer Management", ar: "إدارة العملاء" }, description: "360-degree customer view with contact history, communication log, preferences, and loyalty program integration.", gradientFrom: "#be185d", gradientTo: "#db2777", featureCount: 9 },
  { moduleKey: "loyalty", iconName: "Star", names: { en: "Loyalty Programs", ar: "برامج الولاء" }, description: "Points-based loyalty, tier management, reward catalogs, promotion rules, and customer engagement analytics.", gradientFrom: "#eab308", gradientTo: "#f59e0b", featureCount: 7 },
  { moduleKey: "reviews", iconName: "StarHalf", names: { en: "Reviews & Feedback", ar: "التقييمات والملاحظات" }, description: "Customer review collection, sentiment analysis, NPS surveys, and feedback management with response templates.", gradientFrom: "#f97316", gradientTo: "#fb923c", featureCount: 5 },
  { moduleKey: "scheduling", iconName: "Calendar", names: { en: "Scheduling", ar: "الجدولة" }, description: "Appointment booking, resource scheduling, calendar sync, availability management, and automated reminders.", gradientFrom: "#0d9488", gradientTo: "#14b8a6", featureCount: 8 },
  { moduleKey: "workforce", iconName: "UsersRound", names: { en: "Workforce Planning", ar: "تخطيط القوى العاملة" }, description: "Headcount planning, skills matrix, succession planning, shift optimization, and labor cost forecasting.", gradientFrom: "#7c3aed", gradientTo: "#8b5cf6", featureCount: 7 },
  { moduleKey: "onboarding", iconName: "UserCheck", names: { en: "Employee Onboarding", ar: "إدماج الموظفين" }, description: "Digital onboarding checklists, task assignments, document collection, training plans, and probation tracking.", gradientFrom: "#16a34a", gradientTo: "#22c55e", featureCount: 6 },
  { moduleKey: "training", iconName: "Book", names: { en: "Training & Development", ar: "التدريب والتطوير" }, description: "Course catalog, enrollment management, LMS integration, certification tracking, and training needs analysis.", gradientFrom: "#0369a1", gradientTo: "#0284c7", featureCount: 7 },
  { moduleKey: "eforms", iconName: "FileDigit", names: { en: "e-Forms", ar: "النماذج الإلكترونية" }, description: "Digital forms with e-signature, auto-population, validation rules, and direct integration into ERP workflows.", gradientFrom: "#374151", gradientTo: "#4b5563", featureCount: 5 },
  { moduleKey: "digital-signature", iconName: "PenTool", names: { en: "Digital Signatures", ar: "التوقيع الرقمي" }, description: "Legally binding e-signatures with audit trail, identity verification, and compliance with global e-signature laws.", gradientFrom: "#78350f", gradientTo: "#92400e", featureCount: 5 },
  { moduleKey: "time-off", iconName: "Umbrella", names: { en: "Time Off / Leave", ar: "الإجازات" }, description: "Leave policy engine, accrual rules, balance tracking, team calendar, and multi-level approval workflows.", gradientFrom: "#15803d", gradientTo: "#16a34a", featureCount: 7 },
  { moduleKey: "shifts", iconName: "RotateCcw", names: { en: "Shift Management", ar: "إدارة المناوبات" }, description: "Shift pattern creation, swap requests, shift differentials, and compliance with labor law regulations.", gradientFrom: "#b45309", gradientTo: "#d97706", featureCount: 6 },
  { moduleKey: "overtime", iconName: "ClockArrowUp", names: { en: "Overtime", ar: "ساعات العمل الإضافية" }, description: "Overtime request, approval, rate calculation, and integration with payroll for accurate compensation.", gradientFrom: "#dc2626", gradientTo: "#ef4444", featureCount: 5 },
  { moduleKey: "indemnity", iconName: "HandCoins", names: { en: "End of Service", ar: "مكافأة نهاية الخدمة" }, description: "End-of-service benefit calculation per local labor law, accrual tracking, and payout processing.", gradientFrom: "#a855f7", gradientTo: "#d946ef", featureCount: 5 },
  { moduleKey: "social-insurance", iconName: "Heart", names: { en: "Social Insurance", ar: "التأمينات الاجتماعية" }, description: "Social insurance enrollment, contribution calculation, return filing, and government portal integration.", gradientFrom: "#be123c", gradientTo: "#e11d48", featureCount: 6 },
  { moduleKey: "wps", iconName: "Banknote", names: { en: "WPS / Salary", ar: "نظام حماية الأجور" }, description: "Wage protection system file generation, salary bulk processing, bank file formats, and compliance reporting.", gradientFrom: "#059669", gradientTo: "#10b981", featureCount: 5 },
  { moduleKey: "gosi", iconName: "IdCard", names: { en: "GOSI Integration", ar: "التكامل مع التأمينات" }, description: "Direct integration with GOSI for salary submissions, employee records, and contribution queries.", gradientFrom: "#075985", gradientTo: "#0ea5e9", featureCount: 4 },
  { moduleKey: "zatca", iconName: "ScrollText", names: { en: "ZATCA Compliance", ar: "الامتثال لهيئة الزكاة" }, description: "ZATCA e-invoicing with QR codes, invoice signing, portal submission, and compliance dashboard.", gradientFrom: "#166534", gradientTo: "#15803d", featureCount: 6 },
  { moduleKey: "e-invoice", iconName: "FileCheck", names: { en: "e-Invoicing", ar: "الفواتير الإلكترونية" }, description: "Electronic invoice generation, XML/PDF generation, government portal submission, and digital stamping.", gradientFrom: "#0f766e", gradientTo: "#0d9488", featureCount: 7 },
  { moduleKey: "tender", iconName: "Gavel", names: { en: "Tender Management", ar: "إدارة المناقصات" }, description: "Tender creation, bid evaluation, vendor responses, award management, and contract finalization.", gradientFrom: "#292524", gradientTo: "#44403c", featureCount: 7 },
  { moduleKey: "fleet", iconName: "Car", names: { en: "Fleet Management", ar: "إدارة الأسطول" }, description: "Vehicle tracking, fuel management, maintenance scheduling, driver management, and fleet analytics.", gradientFrom: "#0c4a6e", gradientTo: "#075985", featureCount: 9 },
  { moduleKey: "job-cost", iconName: "Hammer", names: { en: "Job Costing", ar: "تكاليف الوظائف" }, description: "Track labor, materials, equipment, and overhead costs per job with profitability analysis and variance reports.", gradientFrom: "#78350f", gradientTo: "#92400e", featureCount: 7 },
  { moduleKey: "service", iconName: "ConciergeBell", names: { en: "Service Management", ar: "إدارة الخدمات" }, description: "Service contract management, SLA tracking, recurring service billing, and technician dispatching.", gradientFrom: "#6d28d9", gradientTo: "#7c3aed", featureCount: 8 },
  { moduleKey: "warranty", iconName: "ShieldHalf", names: { en: "Warranty Management", ar: "إدارة الضمان" }, description: "Warranty registration, claims processing, approval workflows, and supplier recovery tracking.", gradientFrom: "#a16207", gradientTo: "#ca8a04", featureCount: 5 },
  { moduleKey: "returns", iconName: "RotateCcwSquare", names: { en: "Returns & RMA", ar: "المرتجعات" }, description: "Return merchandise authorization, inspection workflow, refund processing, and reverse logistics management.", gradientFrom: "#b91c1c", gradientTo: "#dc2626", featureCount: 6 },
  { moduleKey: "shipping", iconName: "PackageOpen", names: { en: "Shipping & Logistics", ar: "الشحن واللوجستيات" }, description: "Multi-carrier shipping, label printing, tracking integration, freight management, and delivery confirmation.", gradientFrom: "#0369a1", gradientTo: "#0ea5e9", featureCount: 8 },
  { moduleKey: "planning", iconName: "ClipboardPen", names: { en: "Planning & Scheduling", ar: "التخطيط والجدولة" }, description: "Advanced planning and scheduling with constraint-based optimization, what-if scenarios, and Gantt visualization.", gradientFrom: "#4f46e5", gradientTo: "#6366f1", featureCount: 8 },
  { moduleKey: "forecast", iconName: "CrystalBall", names: { en: "Demand Forecasting", ar: "توقعات الطلب" }, description: "Statistical demand forecasting with ML models, seasonal adjustments, and integrated inventory replenishment.", gradientFrom: "#6b21a8", gradientTo: "#7c3aed", featureCount: 6 },
  { moduleKey: "iot", iconName: "Cpu", names: { en: "IoT Integration", ar: "تكامل إنترنت الأشياء" }, description: "IoT device management, sensor data ingestion, real-time monitoring, and automated alerts and triggers.", gradientFrom: "#020617", gradientTo: "#1e293b", featureCount: 6 },
  { moduleKey: "blockchain", iconName: "Link", names: { en: "Blockchain", ar: "سلسلة الكتل" }, description: "Blockchain-based document verification, supply chain traceability, smart contracts, and immutable audit logs.", gradientFrom: "#292524", gradientTo: "#44403c", featureCount: 5 },
  { moduleKey: "ai", iconName: "Brain", names: { en: "AI Assistant", ar: "المساعد الذكي" }, description: "AI-powered chatbot, document intelligence, anomaly detection, predictive analytics, and natural language queries.", gradientFrom: "#6b21a8", gradientTo: "#a855f7", featureCount: 8 },
  { moduleKey: "ocr", iconName: "Scan", names: { en: "OCR & Document AI", ar: "التعرف البصري" }, description: "Intelligent document processing with OCR, invoice/PO/receipt data extraction, and automated classification.", gradientFrom: "#0f766e", gradientTo: "#14b8a6", featureCount: 6 },
  { moduleKey: "chat", iconName: "MessageCircle", names: { en: "Internal Chat", ar: "الدردشة الداخلية" }, description: "Team messaging, channels, file sharing, video calls, and integration with all ERP modules for contextual discussions.", gradientFrom: "#4f46e5", gradientTo: "#818cf8", featureCount: 8 },
  { moduleKey: "collaboration", iconName: "Share2", names: { en: "Collaboration", ar: "التعاون" }, description: "Shared workspaces, document co-editing, annotations, @mentions, and activity feeds across the organization.", gradientFrom: "#0891b2", gradientTo: "#22d3ee", featureCount: 7 },
  { moduleKey: "backup", iconName: "Cloud", names: { en: "Backup & Recovery", ar: "النسخ الاحتياطي" }, description: "Automated backups, point-in-time recovery, disaster recovery planning, and backup verification with SLAs.", gradientFrom: "#334155", gradientTo: "#475569", featureCount: 5 },
  { moduleKey: "security", iconName: "Lock", names: { en: "Security & RBAC", ar: "الأمان والصلاحيات" }, description: "Role-based access control, SSO/SAML, MFA, IP whitelisting, session management, and security audit logs.", gradientFrom: "#1e3a5f", gradientTo: "#1e40af", featureCount: 9 },
  { moduleKey: "logs", iconName: "Scroll", names: { en: "Audit Logs", ar: "سجلات التدقيق" }, description: "Comprehensive audit trail of all system activities with search, filter, export, and retention policy support.", gradientFrom: "#292524", gradientTo: "#44403c", featureCount: 5 },
];

const websiteSections = [
  {
    id: "hero",
    order: 1,
    visible: true,
    title: { en: "All-in-One ERP for Modern Businesses", ar: "نظام ERP متكامل للشركات الحديثة" },
    subtitle: { en: "From accounting to AI — everything you need to run your business in one platform.", ar: "من المحاسبة إلى الذكاء الاصطناعي — كل ما تحتاجه لإدارة أعمالك في منصة واحدة." },
  },
  {
    id: "modules",
    order: 2,
    visible: true,
    title: { en: "100+ Integrated Modules", ar: "أكثر من 100 وحدة متكاملة" },
    subtitle: { en: "Every module works seamlessly together. No more juggling between disconnected tools.", ar: "جميع الوحدات تعمل معًا بسلاسة. لا مزيد من التنقل بين الأدوات المنفصلة." },
  },
  {
    id: "comparison",
    order: 3,
    visible: true,
    title: { en: "Why YASCO?", ar: "لماذا ياسكو؟" },
    subtitle: { en: "See how we compare to the competition across 30+ critical features.", ar: "تعرف على مقارنتنا مع المنافسين عبر أكثر من 30 ميزة حاسمة." },
  },
  {
    id: "pricing",
    order: 4,
    visible: true,
    title: { en: "Simple, Transparent Pricing", ar: "أسعار بسيطة وشفافة" },
    subtitle: { en: "No hidden fees. No surprise charges. Scale as you grow.", ar: "لا رسوم مخفية. لا تكاليف مفاجئة. توسع مع نموك." },
  },
  {
    id: "testimonials",
    order: 5,
    visible: true,
    title: { en: "Trusted by Thousands", ar: "موثوق به من قبل الآلاف" },
    subtitle: { en: "Hear from business leaders who transformed their operations with YASCO.", ar: "استمع من قادة الأعمال الذين طوروا عملياتهم مع ياسكو." },
  },
  {
    id: "faq",
    order: 6,
    visible: true,
    title: { en: "Frequently Asked Questions", ar: "الأسئلة الشائعة" },
    subtitle: { en: "Everything you need to know about YASCO ERP.", ar: "كل ما تحتاج معرفته عن ياسكو ERP." },
  },
  {
    id: "cta",
    order: 7,
    visible: true,
    title: { en: "Ready to Get Started?", ar: "هل أنت مستعد للبدء؟" },
    subtitle: { en: "Start your free trial today. No credit card required.", ar: "ابدأ نسختك التجريبية المجانية اليوم. لا حاجة لبطاقة ائتمان." },
  },
];

const heroSlides = [
  { id: 1, title: { en: "The ERP That Grows With You", ar: "نظام ERP ينمو معك" }, subtitle: { en: "Start with what you need, add more as you scale. YASCO modular ERP adapts to your business.", ar: "ابدأ بما تحتاجه، وأضف المزيد مع توسعك. يتكيف ياسكو مع أعمالك." }, cta: { en: "Explore Modules", ar: "استكشاف الوحدات" }, ctaLink: "/modules", image: "/images/hero-scale.jpg", active: true },
  { id: 2, title: { en: "AI-Powered Business Intelligence", ar: "ذكاء الأعمال المدعوم بالذكاء الاصطناعي" }, subtitle: { en: "Turn data into decisions with AI-driven insights, predictive analytics, and smart automation.", ar: "حوّل البيانات إلى قرارات مع رؤى مدعومة بالذكاء الاصطناعي وتحليلات تنبؤية." }, cta: { en: "See How It Works", ar: "شاهد كيف يعمل" }, ctaLink: "/ai-features", image: "/images/hero-ai.jpg", active: true },
  { id: 3, title: { en: "Local Compliance, Global Reach", ar: "امتثال محلي، وصول عالمي" }, subtitle: { en: "Fully compliant with ZATCA, GOSI, WPS, and international standards. Operate anywhere with confidence.", ar: "متوافق تمامًا مع هيئة الزكاة والضريبة والجمارك والتأمينات الاجتماعية ونظام حماية الأجور." }, cta: { en: "Learn More", ar: "اعرف المزيد" }, ctaLink: "/compliance", image: "/images/hero-global.jpg", active: true },
];

const pricingPlans = [
  {
    id: "starter",
    name: { en: "Starter", ar: "مبتدئ" },
    description: { en: "For small businesses getting started with ERP.", ar: "للشركات الصغيرة التي تبدأ مع ERP." },
    monthlyPrice: 29,
    annualPrice: 290,
    currency: "USD",
    features: ["Up to 5 users", "Core accounting", "Basic inventory", "1 company", "Email support", "Mobile app access"],
    highlighted: false,
    cta: { en: "Start Free Trial", ar: "ابدأ النسخة التجريبية" },
  },
  {
    id: "growing",
    name: { en: "Growing Business", ar: "الأعمال المتنامية" },
    description: { en: "For growing teams that need more power and flexibility.", ar: "للفرق المتنامية التي تحتاج المزيد من القوة والمرونة." },
    monthlyPrice: 79,
    annualPrice: 790,
    currency: "USD",
    features: ["Up to 25 users", "Full accounting suite", "Advanced inventory", "CRM & sales", "Multi-currency", "API access", "Priority support", "Custom reports"],
    highlighted: true,
    cta: { en: "Start Free Trial", ar: "ابدأ النسخة التجريبية" },
  },
  {
    id: "enterprise",
    name: { en: "Enterprise", ar: "مؤسسة" },
    description: { en: "For large organizations with complex requirements.", ar: "للمؤسسات الكبيرة ذات المتطلبات المعقدة." },
    monthlyPrice: 199,
    annualPrice: 1990,
    currency: "USD",
    features: ["Unlimited users", "All modules", "Manufacturing & projects", "AI & BI analytics", "Dedicated server", "SSO & SAML", "Custom integrations", "24/7 support", "SLA guarantee", "On-premise option"],
    highlighted: false,
    cta: { en: "Contact Sales", ar: "اتصل بالمبيعات" },
  },
];

const comparisonData = [
  { feature: { en: "General Ledger", ar: "دفتر الأستاذ العام" }, yasco: true, zoho: true, odoo: true, sap: true, netsuite: true, dynamics: true, erpnext: true },
  { feature: { en: "Multi-Currency", ar: "متعدد العملات" }, yasco: true, zoho: true, odoo: true, sap: true, netsuite: true, dynamics: true, erpnext: true },
  { feature: { en: "AR/AP Management", ar: "إدارة الحسابات المدينة والدائنة" }, yasco: true, zoho: true, odoo: true, sap: true, netsuite: true, dynamics: true, erpnext: true },
  { feature: { en: "Fixed Assets", ar: "الأصول الثابتة" }, yasco: true, zoho: false, odoo: true, sap: true, netsuite: true, dynamics: true, erpnext: true },
  { feature: { en: "Revenue Recognition", ar: "الاعتراف بالإيرادات" }, yasco: true, zoho: false, odoo: true, sap: true, netsuite: true, dynamics: true, erpnext: true },
  { feature: { en: "Cost Accounting", ar: "محاسبة التكاليف" }, yasco: true, zoho: false, odoo: true, sap: true, netsuite: true, dynamics: true, erpnext: true },
  { feature: { en: "Budgeting & Forecasting", ar: "الميزانية والتوقعات" }, yasco: true, zoho: true, odoo: true, sap: true, netsuite: true, dynamics: true, erpnext: false },
  { feature: { en: "Consolidation", ar: "التوحيد المالي" }, yasco: true, zoho: false, odoo: false, sap: true, netsuite: true, dynamics: true, erpnext: false },
  { feature: { en: "Multi-Entity", ar: "متعدد الكيانات" }, yasco: true, zoho: false, odoo: false, sap: true, netsuite: true, dynamics: true, erpnext: false },
  { feature: { en: "ZATCA Compliance", ar: "الامتثال لهيئة الزكاة" }, yasco: true, zoho: false, odoo: false, sap: false, netsuite: false, dynamics: false, erpnext: false },
  { feature: { en: "GOSI Integration", ar: "التكامل مع التأمينات" }, yasco: true, zoho: false, odoo: false, sap: false, netsuite: false, dynamics: false, erpnext: false },
  { feature: { en: "WPS Support", ar: "نظام حماية الأجور" }, yasco: true, zoho: false, odoo: false, sap: false, netsuite: false, dynamics: false, erpnext: false },
  { feature: { en: "e-Invoicing", ar: "الفواتير الإلكترونية" }, yasco: true, zoho: true, odoo: true, sap: true, netsuite: true, dynamics: true, erpnext: true },
  { feature: { en: "Inventory Management", ar: "إدارة المخزون" }, yasco: true, zoho: true, odoo: true, sap: true, netsuite: true, dynamics: true, erpnext: true },
  { feature: { en: "Warehouse Management", ar: "إدارة المستودعات" }, yasco: true, zoho: false, odoo: true, sap: true, netsuite: true, dynamics: true, erpnext: true },
  { feature: { en: "Manufacturing MRP", ar: "تخطيط موارد التصنيع" }, yasco: true, zoho: false, odoo: true, sap: true, netsuite: true, dynamics: true, erpnext: true },
  { feature: { en: "Quality Management", ar: "إدارة الجودة" }, yasco: true, zoho: false, odoo: true, sap: true, netsuite: true, dynamics: true, erpnext: true },
  { feature: { en: "CRM", ar: "إدارة علاقات العملاء" }, yasco: true, zoho: true, odoo: true, sap: true, netsuite: true, dynamics: true, erpnext: true },
  { feature: { en: "HR & Payroll", ar: "الموارد البشرية والرواتب" }, yasco: true, zoho: true, odoo: true, sap: true, netsuite: true, dynamics: true, erpnext: true },
  { feature: { en: "Attendance & Time", ar: "الحضور والوقت" }, yasco: true, zoho: true, odoo: true, sap: true, netsuite: true, dynamics: true, erpnext: true },
  { feature: { en: "Recruitment", ar: "التوظيف" }, yasco: true, zoho: true, odoo: true, sap: true, netsuite: true, dynamics: true, erpnext: true },
  { feature: { en: "Performance Management", ar: "إدارة الأداء" }, yasco: true, zoho: false, odoo: true, sap: true, netsuite: false, dynamics: true, erpnext: true },
  { feature: { en: "Project Management", ar: "إدارة المشاريع" }, yasco: true, zoho: true, odoo: true, sap: true, netsuite: true, dynamics: true, erpnext: true },
  { feature: { en: "Help Desk", ar: "خدمة العملاء" }, yasco: true, zoho: true, odoo: true, sap: true, netsuite: false, dynamics: true, erpnext: true },
  { feature: { en: "Field Service", ar: "الخدمة الميدانية" }, yasco: true, zoho: false, odoo: true, sap: true, netsuite: false, dynamics: true, erpnext: false },
  { feature: { en: "E-Commerce", ar: "التجارة الإلكترونية" }, yasco: true, zoho: true, odoo: true, sap: false, netsuite: true, dynamics: false, erpnext: true },
  { feature: { en: "Business Intelligence", ar: "ذكاء الأعمال" }, yasco: true, zoho: true, odoo: true, sap: true, netsuite: true, dynamics: true, erpnext: true },
  { feature: { en: "AI-Powered Insights", ar: "رؤى الذكاء الاصطناعي" }, yasco: true, zoho: false, odoo: false, sap: true, netsuite: false, dynamics: true, erpnext: false },
  { feature: { en: "Mobile App", ar: "التطبيق المحمول" }, yasco: true, zoho: true, odoo: true, sap: true, netsuite: true, dynamics: true, erpnext: true },
  { feature: { en: "RTL / Arabic Support", ar: "دعم اللغة العربية / RTL" }, yasco: true, zoho: true, odoo: true, sap: true, netsuite: true, dynamics: false, erpnext: true },
  { feature: { en: "Offline Mode", ar: "وضع عدم الاتصال" }, yasco: true, zoho: false, odoo: false, sap: false, netsuite: false, dynamics: false, erpnext: false },
  { feature: { en: "API & Webhooks", ar: "API وخطافات الويب" }, yasco: true, zoho: true, odoo: true, sap: true, netsuite: true, dynamics: true, erpnext: true },
  { feature: { en: "On-Premise Option", ar: "خيار التثبيت المحلي" }, yasco: true, zoho: false, odoo: true, sap: true, netsuite: false, dynamics: false, erpnext: true },
  { feature: { en: "Open Source", ar: "مفتوح المصدر" }, yasco: false, zoho: false, odoo: true, sap: false, netsuite: false, dynamics: false, erpnext: true },
];

const testimonials = [
  {
    id: 1,
    name: "Ahmed Al-Rashid",
    title: { en: "CFO, Saudi Manufacturing Co.", ar: "المدير المالي، شركة التصنيع السعودية" },
    content: { en: "YASCO transformed our financial operations. The ZATCA compliance and multi-currency features alone saved us months of manual work.", ar: "ياسكو غير عملياتنا المالية. ميزات الامتثال لهيئة الزكاة وتعدد العملات وحدها وفرت لنا شهورًا من العمل اليدوي." },
    rating: 5,
    avatar: "/images/avatars/ahmed.jpg",
  },
  {
    id: 2,
    name: "Lina Khoury",
    title: { en: "CEO, TechSolutions Dubai", ar: "الرئيس التنفيذي، تكسولوشنز دبي" },
    content: { en: "We evaluated 6 different ERPs before choosing YASCO. The modular approach meant we could start small and scale without pain.", ar: "قمنا بتقييم 6 أنظمة ERP مختلفة قبل اختيار ياسكو. المنهج المعياري يعني أننا نبدأ صغيرًا ونتوسع دون ألم." },
    rating: 5,
    avatar: "/images/avatars/lina.jpg",
  },
  {
    id: 3,
    name: "Omar Hassan",
    title: { en: "Operations Director, Retail Group Qatar", ar: "مدير العمليات، مجموعة التجزئة قطر" },
    content: { en: "The AI-powered insights have given us a competitive edge. YASCO's predictive analytics help us forecast demand with 95% accuracy.", ar: "الرؤى المدعومة بالذكاء الاصطناعي أعطتنا ميزة تنافسية. التحليلات التنبؤية لياسكو تساعدنا على توقع الطلب بدقة 95٪." },
    rating: 5,
    avatar: "/images/avatars/omar.jpg",
  },
  {
    id: 4,
    name: "Nora Al-Saud",
    title: { en: "HR Director, National Bank", ar: "مديرة الموارد البشرية، البنك الوطني" },
    content: { en: "The HR and payroll modules are incredibly comprehensive. GOSI and WPS integration made compliance effortless.", ar: "وحدات الموارد البشرية والرواتب شاملة بشكل لا يصدق. جعل التكامل مع التأمينات ونظام حماية الأجور الامتثال سلسًا." },
    rating: 4,
    avatar: "/images/avatars/nora.jpg",
  },
  {
    id: 5,
    name: "Khaled Ibrahim",
    title: { en: "IT Manager, Logistics Pro", ar: "مدير تقنية المعلومات، لوجستيكس برو" },
    content: { en: "YASCO's API-first approach allowed us to integrate seamlessly with our existing systems. The webhook support is a game-changer.", ar: "سمح لنا نهج ياسكو القائم على API بالتكامل بسلاسة مع أنظمتنا الحالية. دعم خطافات الويب هو نقلة نوعية." },
    rating: 5,
    avatar: "/images/avatars/khaled.jpg",
  },
  {
    id: 6,
    name: "Sara Mansour",
    title: { en: "Owner, Boutique Chain", ar: "مالكة، سلسلة بوتيك" },
    content: { en: "As a small business owner, I was intimidated by ERP systems. YASCO made it simple and affordable. The POS integration with inventory is perfect.", ar: "كمالكة شركة صغيرة، كنت أشعر بالرهبة من أنظمة ERP. ياسكو جعلها بسيطة وبأسعار معقولة. تكامل POS مع المخزون مثالي." },
    rating: 5,
    avatar: "/images/avatars/sara.jpg",
  },
];

const faqItems = [
  {
    id: 1,
    question: { en: "What is YASCO ERP?", ar: "ما هو ياسكو ERP؟" },
    answer: { en: "YASCO is a comprehensive, modular ERP platform designed for businesses of all sizes. It covers accounting, inventory, CRM, HR, manufacturing, and more — all in one integrated system with native Arabic support.", ar: "ياسكو هو منصة ERP شاملة ومعيارية مصممة للشركات من جميع الأحجام. يغطي المحاسبة والمخزون وCRM والموارد البشرية والتصنيع والمزيد — كل ذلك في نظام واحد متكامل مع دعم عربي أصلي." },
    order: 1,
  },
  {
    id: 2,
    question: { en: "How does pricing work?", ar: "كيف تعمل الأسعار؟" },
    answer: { en: "We offer three plans: Starter ($29/mo), Growing Business ($79/mo), and Enterprise ($199/mo). All plans include a 14-day free trial. No hidden fees, and you can upgrade or downgrade at any time.", ar: "نقدم ثلاث خطط: مبتدئ (29 دولارًا/شهريًا)، الأعمال المتنامية (79 دولارًا/شهريًا)، والمؤسسة (199 دولارًا/شهريًا). جميع الخطط تتضمن نسخة تجريبية مجانية لمدة 14 يومًا. لا رسوم مخفية." },
    order: 2,
  },
  {
    id: 3,
    question: { en: "Is YASCO compliant with Saudi regulations?", ar: "هل ياسكو متوافق مع اللوائح السعودية؟" },
    answer: { en: "Yes. YASCO is fully compliant with ZATCA e-invoicing requirements, GOSI integration, WPS (Wage Protection System), and Saudi labor law. We regularly update to stay current with regulatory changes.", ar: "نعم. ياسكو متوافق تمامًا مع متطلبات الفوترة الإلكترونية لهيئة الزكاة والضريبة والجمارك، والتكامل مع التأمينات الاجتماعية، ونظام حماية الأجور، وقانون العمل السعودي." },
    order: 3,
  },
  {
    id: 4,
    question: { en: "Can I migrate from another ERP?", ar: "هل يمكنني الترحيل من نظام ERP آخر؟" },
    answer: { en: "Absolutely. We provide dedicated migration tools and support for importing data from Odoo, Zoho, SAP, and other major ERPs. Our team handles the entire migration process to ensure zero data loss.", ar: "بالتأكيد. نقدم أدوات ترحيل مخصصة ودعمًا لاستيراد البيانات من Odoo وZoho وSAP وأنظمة ERP رئيسية أخرى." },
    order: 4,
  },
  {
    id: 5,
    question: { en: "Is there a mobile app?", ar: "هل هناك تطبيق محمول؟" },
    answer: { en: "Yes! YASCO offers native mobile apps for iOS and Android. The app supports offline mode, push notifications, barcode scanning, and most core ERP functions.", ar: "نعم! ياسكو يقدم تطبيقات محمولة أصلية لنظامي iOS وAndroid. التطبيق يدعم وضع عدم الاتصال والإشعارات الفورية ومسح الباركود." },
    order: 5,
  },
  {
    id: 6,
    question: { en: "Can I install YASCO on-premise?", ar: "هل يمكنني تثبيت ياسكو محليًا؟" },
    answer: { en: "Yes, the Enterprise plan includes an on-premise deployment option. You can install YASCO on your own servers for complete control over your data and infrastructure.", ar: "نعم، خطة المؤسسة تتضمن خيار التثبيت المحلي. يمكنك تثبيت ياسكو على خوادمك الخاصة للتحكم الكامل في بياناتك وبنيتك التحتية." },
    order: 6,
  },
  {
    id: 7,
    question: { en: "What kind of support do you offer?", ar: "ما نوع الدعم الذي تقدمونه؟" },
    answer: { en: "Starter plan includes email support. Growing Business includes priority support with 4-hour response. Enterprise includes 24/7 dedicated support with a 99.9% uptime SLA.", ar: "خطة المبتدئ تتضمن دعمًا عبر البريد الإلكتروني. الأعمال المتنامية تتضمن دعمًا ذا أولوية مع رد خلال 4 ساعات. المؤسسة تتضمن دعمًا مخصصًا على مدار الساعة." },
    order: 7,
  },
  {
    id: 8,
    question: { en: "Is my data secure?", ar: "هل بياناتي آمنة؟" },
    answer: { en: "Security is our top priority. YASCO uses AES-256 encryption, SOC 2 compliant data centers, regular penetration testing, RBAC, SSO/SAML, MFA, and comprehensive audit logs.", ar: "الأمان هو أولويتنا القصوى. يستخدم ياسكو تشفير AES-256 ومراكز بيانات متوافقة مع SOC 2 واختبار الاختراق المنتظم والصلاحيات القائمة على الأدوار." },
    order: 8,
  },
];

const companyInfo = {
  name: "YASCO ERP",
  nameAr: "ياسكو ERP",
  logo: "/images/logo.svg",
  logoDark: "/images/logo-dark.svg",
  favicon: "/favicon.ico",
  tagline: { en: "Enterprise Resource Planning, Reimagined", ar: "تخطيط موارد المؤسسات، بشكل متجدد" },
  email: "hello@yascoerp.com",
  phone: "+966 800 123 4567",
  address: { en: "Riyadh, Saudi Arabia", ar: "الرياض، المملكة العربية السعودية" },
  social: {
    linkedin: "https://linkedin.com/company/yascoerp",
    twitter: "https://twitter.com/yascoerp",
    youtube: "https://youtube.com/@yascoerp",
    github: "https://github.com/yascoerp",
  },
  footerLinks: [
    { label: { en: "Privacy Policy", ar: "سياسة الخصوصية" }, href: "/privacy" },
    { label: { en: "Terms of Service", ar: "شروط الخدمة" }, href: "/terms" },
    { label: { en: "Cookie Policy", ar: "سياسة ملفات تعريف الارتباط" }, href: "/cookies" },
  ],
};

const seoSettings = {
  title: { en: "YASCO ERP — All-in-One Business Management Platform", ar: "ياسكو ERP — منصة إدارة الأعمال المتكاملة" },
  description: { en: "YASCO is a comprehensive ERP platform with 100+ integrated modules including accounting, inventory, CRM, HR, manufacturing, and AI-powered analytics. Fully compliant with ZATCA, GOSI, and WPS.", ar: "ياسكو هو منصة ERP شاملة مع أكثر من 100 وحدة متكاملة تشمل المحاسبة والمخزون وCRM والموارد البشرية والتصنيع والتحليلات بالذكاء الاصطناعي." },
  keywords: { en: ["ERP", "accounting software", "ZATCA compliance", "Saudi ERP", "GOSI", "WPS", "business management", "inventory management", "HR software", "CRM", "manufacturing ERP", "Arabic ERP", "Saudi business software"], ar: ["ERP", "برنامج محاسبة", "الامتثال لهيئة الزكاة", "ERP سعودي", "التأمينات الاجتماعية", "نظام حماية الأجور", "إدارة الأعمال", "إدارة المخزون", "برنامج الموارد البشرية", "CRM", "ERP التصنيع", "ERP عربي", "برامج الأعمال السعودية"] },
  ogImage: "/images/og-default.jpg",
  twitterHandle: "@yascoerp",
};

export const websiteRouter = createRouter({
  getModuleCards: publicQuery.query(async () => {
    return moduleCards;
  }),

  getModuleCard: publicQuery
    .input(z.object({ moduleKey: z.string() }))
    .query(async ({ input }) => {
      const card = moduleCards.find((c) => c.moduleKey === input.moduleKey);
      if (!card) {
        return null;
      }
      return card;
    }),

  getWebsiteSections: publicQuery.query(async () => {
    return websiteSections;
  }),

  getHeroSlides: publicQuery.query(async () => {
    return heroSlides;
  }),

  getPricingPlans: publicQuery.query(async () => {
    return pricingPlans;
  }),

  getComparisonData: publicQuery.query(async () => {
    return comparisonData;
  }),

  getCompanyInfo: publicQuery.query(async () => {
    return companyInfo;
  }),

  getFaqItems: publicQuery.query(async () => {
    return faqItems;
  }),

  getTestimonials: publicQuery.query(async () => {
    return testimonials;
  }),

  getSeoSettings: publicQuery.query(async () => {
    return seoSettings;
  }),

  updateModuleCard: adminQuery
    .input(z.object({
      moduleKey: z.string(),
      nameEn: z.string().optional(),
      nameAr: z.string().optional(),
      description: z.string().optional(),
      visible: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      return { success: true, moduleKey: input.moduleKey };
    }),

  updateWebsiteSection: adminQuery
    .input(z.object({
      id: z.string(),
      titleEn: z.string().optional(),
      titleAr: z.string().optional(),
      subtitleEn: z.string().optional(),
      subtitleAr: z.string().optional(),
      visible: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      return { success: true, id: input.id };
    }),

  updateHeroSlide: adminQuery
    .input(z.object({
      id: z.number(),
      titleEn: z.string().optional(),
      titleAr: z.string().optional(),
      subtitleEn: z.string().optional(),
      subtitleAr: z.string().optional(),
      ctaEn: z.string().optional(),
      ctaAr: z.string().optional(),
      ctaLink: z.string().optional(),
      active: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      return { success: true, id: input.id };
    }),

  toggleModuleVisibility: adminQuery
    .input(z.object({
      moduleKey: z.string(),
      visible: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      return { success: true, moduleKey: input.moduleKey, visible: input.visible };
    }),

  updatePricingPlan: adminQuery
    .input(z.object({
      id: z.string(),
      monthlyPrice: z.number().optional(),
      annualPrice: z.number().optional(),
      features: z.array(z.string()).optional(),
      highlighted: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      return { success: true, id: input.id };
    }),

  updateSeoSettings: adminQuery
    .input(z.object({
      titleEn: z.string().optional(),
      titleAr: z.string().optional(),
      descriptionEn: z.string().optional(),
      descriptionAr: z.string().optional(),
      ogImage: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return { success: true };
    }),
});
