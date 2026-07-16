import { useMemo } from "react";
import { getStoredCategory } from "@/config/businessCatalog";
import type { BusinessCategory } from "@/config/businessCatalog";

export interface ModuleConfig {
  key: string;
  label: string;
  labelAr: string;
  path: string;
  icon: string;
  // New additions for widgets and actions
  widget?: boolean;
  action?: boolean;
  badgeContent?: string;
  badgeColor?: "default" | "primary" | "secondary" | "destructive" | "warning";
}

const coreModules: ModuleConfig[] = [
  { key: "dashboard", label: "Dashboard", labelAr: "لوحة التحكم", path: "/app", icon: "LayoutDashboard" },
  { key: "accounting", label: "Accounting", labelAr: "المحاسبة", path: "/app/accounting", icon: "BookOpen" },
  { key: "inventory", label: "Inventory", labelAr: "المخزون", path: "/app/inventory", icon: "Package" },
  { key: "sales", label: "Sales", labelAr: "المبيعات", path: "/app/sales", icon: "ShoppingCart" },
  { key: "purchase", label: "Purchase", labelAr: "المشتريات", path: "/app/purchase", icon: "ShoppingBag" },
  { key: "hrm", label: "HRM & Payroll", labelAr: "الموارد البشرية", path: "/app/hrm", icon: "Users" },
  { key: "reports", label: "Reports", labelAr: "التقارير", path: "/app/reports", icon: "BarChart3" },
  { key: "settings", label: "Settings", labelAr: "الإعدادات", path: "/app/settings", icon: "Settings" },
];

// Widget-enabled modules (appear in dashboard)
const widgetModules: Record<string, boolean> = {
  dashboard: true,
  accounting: true,
  sales: true,
  reports: true,
  inventory: true,
  workshop: true,
  medical_clinic: true,
  restaurant: true,
  pharmacy: true,
  construction: true,
  retail: true,
  wholesale: true,
  salon: true
};

// Action-enabled modules (quick actions in header)
const actionModules: Record<string, boolean> = {
  pos_retail: true,
  pos_restaurant: true,
  pos_pharmacy: true,
  pos_wholesale: true,
  workshop: true,
  healthcare: true,
  pharmacy: true,
  construction: true,
  salon: true,
  fieldservice: true,
  events: true,
  agency: true,
  === true;

const verticalModules: Partial<Record<BusinessCategory, ModuleConfig[]>> = {
  hospital: [
    { key: "healthcare", label: "Patients", labelAr: "المرضى", path: "/app/verticals/healthcare", icon: "Stethoscope", widget: true, action: true },
    { key: "healthcare-appointments", label: "Appointments", labelAr: "المواعيد", path: "/app/verticals/healthcare/appointments", icon: "Calendar", widget: true },
    { key: "healthcare-roster", label: "Doctor Roster", labelAr: "جدول الأطباء", path: "/app/verticals/healthcare/roster", icon: "Users" },
    { key: "healthcare-insurance", label: "Insurance Claims", labelAr: "مطالبات التأمين", path: "/app/verticals/healthcare/insurance-claims", icon: "Shield", widget: true, badgeContent: "New", badgeColor: "warning" },
    { key: "healthcare-pharmacy", label: "Pharmacy", labelAr: "الصيدلية", path: "/app/pos/pharmacy", icon: "Pill", action: true },
    { key: "healthcare-lab", label: "Lab", labelAr: "المختبر", path: "/app/verticals/healthcare/lab", icon: "Flask" },
    { key: "healthcare-billing", label: "Billing", labelAr: "الفواتير", path: "/app/verticals/healthcare/billing", icon: "Receipt", widget: true }
  ],
  workshop: [
    { key: "workshop", label: "Workshop Dashboard", labelAr: "لوحة الورشة", path: "/app/verticals/workshop", icon: "Wrench", widget: true, action: true },
    { key: "workshop-jobcards", label: "Job Cards", labelAr: "بطاقات العمل", path: "/app/verticals/workshop/job-cards", icon: "ClipboardList", widget: true },
    { key: "workshop-vehicles", label: "Vehicles", labelAr: "المركبات", path: "/app/verticals/workshop/vehicles", icon: "Car" },
    { key: "workshop-estimates", label: "Estimates", labelAr: "التقديرات", path: "/app/verticals/workshop/estimates", icon: "FileText" },
    { key: "workshop-technicians", label: "Technicians", labelAr: "الفنيين", path: "/app/verticals/workshop/technicians", icon: "Users" },
    { key: "workshop-inspections", label: "Inspections", labelAr: "الفحوصات", path: "/app/verticals/workshop/inspections", icon: "Search" },
    { key: "workshop-parts", label: "Parts Inventory", labelAr: "قطع الغيار", path: "/app/verticals/workshop/parts", icon: "Package", widget: true },
    { key: "workshop-bays", label: "Bay Schedule", labelAr: "جدول الرافعات", path: "/app/verticals/workshop/bays", icon: "ParkingCircle", widget: true, badgeContent: "3/8", badgeColor: "secondary" },
    { key: "workshop-payments", label: "Payments", labelAr: "المدفوعات", path: "/app/verticals/workshop/payments", icon: "Wallet" }
  ],
  construction: [
    { key: "construction", label: "Projects", labelAr: "المشاريع", path: "/app/construction", icon: "FolderKanban", widget: true, action: true },
    { key: "construction-wbs", label: "WBS", labelAr: "هيكل العمل", path: "/app/construction/wbs", icon: "GitBranch" },
    { key: "construction-boq", label: "BOQ", labelAr: "جدول الكميات", path: "/app/construction/boq", icon: "List" },
    { key: "construction-contracts", label: "Contracts", labelAr: "العقود", path: "/app/construction/contracts", icon: "FileText" },
    { key: "construction-hse", label: "HSE", labelAr: "السلامة", path: "/app/construction/hse", icon: "Shield" },
    { key: "construction-subcontractors", label: "Subcontractors", labelAr: "المقاولون", path: "/app/construction/subcontractors", icon: "Building2" },
    { key: "construction-equipment", label: "Equipment", labelAr: "المعدات", path: "/app/construction/equipment-schedule", icon: "Tractor", widget: true },
    { key: "construction-materials", label: "Materials", labelAr: "المواد", path: "/app/construction/materials", icon: "Package", widget: true },
    { key: "construction-variations", label: "Variations", labelAr: "التغييرات", path: "/app/construction/variations", icon: "GitCompare" },
    { key: "construction-advance", label: "Advance Payments", labelAr: "الدفعات المقدمة", path: "/app/construction/advance-payments", icon: "Wallet" },
    { key: "construction-daily", label: "Daily Reports", labelAr: "التقارير اليومية", path: "/app/construction/daily-reports", icon: "FileText", widget: true },
    { key: "construction-quality": label: "Quality", labelAr: "الجودة", path: "/app/verticals/construction/quality", icon: "CheckCircle" },
    { key: "construction-saudization", label: "Saudization", labelAr: "السعودة", path: "/app/construction/saudization", icon: "Users" },
    { key: "construction-compliance", label: "Compliance", labelAr: "الامتثال", path: "/app/construction/compliance/sbc", icon: "ShieldCheck" }
  ],
  retail: [
    { key: "pos", label: "POS", labelAr: "نقطة البيع", path: "/app/pos", icon: "Store", action: true },
    { key: "crm", label: "CRM", labelAr: "إدارة العملاء", path: "/app/crm", icon: "Briefcase", widget: true },
    { key: "retail-products", label: "Products", labelAr: "المنتجات", path: "/app/inventory/products", icon: "Package", widget: true },
    { key: "retail-pos-wholesale", label: "Wholesale POS", labelAr: "بيع الجملة", path: "/app/pos/wholesale", icon: "ShoppingCart", action: true },
    { key: "retail-loyalty", label: "Loyalty", labelAr: "ولاء العملاء", path: "/app/verticals/retail/loyalty", icon: "Heart" }
  ],
  restaurant: [
    { key: "pos-restaurant", label: "Restaurant POS", labelAr: "نقطة بيع المطعم", path: "/app/pos/restaurant", icon: "UtensilsCrossed", action: true },
    { key: "restaurant-menu", label: "Menu", labelAr: "قائمة الطعام", path: "/app/verticals/restaurant/menu", icon: "BookOpen", widget: true },
    { key: "restaurant-tables", label: "Tables", labelAr: "الطاولات", path: "/app/verticals/restaurant/tables", icon: "Grid", widget: true, badgeContent: "12/20", badgeColor: "secondary" },
    { key: "restaurant-delivery", label: "Delivery", labelAr: "التوصيل", path: "/app/verticals/restaurant/delivery", icon: "Truck" },
    { key: "restaurant-kitchen", label: "Kitchen Display", labelAr: "شاشة المطبخ", path: "/app/verticals/restaurant/kitchen", icon: "ChefHat", widget: true },
    { key: "restaurant-reservations", label: "Reservations", labelAr: "الحجوزات", path: "/app/verticals/restaurant/reservations", icon: "Calendar" }
  ],
  hotel: [
    { key: "hotel", label: "Hotel", labelAr: "الفندق", path: "/app/verticals/hotel", icon: "Hotel", widget: true, action: true },
    { key: "hotel-rooms", label: "Rooms", labelAr: "الغرف", path: "/app/verticals/hotel/rooms", icon: "BedDouble" },
    { key: "hotel-bookings", label: "Bookings", labelAr: "الحجوزات", path: "/app/verticals/hotel/bookings", icon: "Calendar", widget: true },
    { key: "hotel-housekeeping", label: "Housekeeping", labelAr: "التدبير المنزلي", path: "/app/verticals/hotel/housekeeping", icon: "SprayCan" },
    { key: "hotel-folio", label: "Folio Billing", labelAr: "فوترة الحساب", path: "/app/verticals/hotel/folio-billing", icon: "Receipt", widget: true },
    { key: "hotel-restaurant", label: "Restaurant", labelAr: "المطعم", path: "/app/pos/restaurant", icon: "UtensilsCrossed", action: true },
    { key: "hotel-events", label: "Events", labelAr: "الفعاليات", path: "/app/verticals/hotel/events", icon: "PartyPopper" }
  ],
  hostel: [
    { key: "hotel", label: "Rooms", labelAr: "الغرف", path: "/app/verticals/hotel", icon: "Hotel" },
    { key: "hotel-rooms", label: "Room Registry", labelAr: "سجل الغرف", path: "/app/verticals/hotel/rooms", icon: "BedDouble" },
    { key: "hotel-bookings", label: "Bookings", labelAr: "الحجوزات", path: "/app/verticals/hotel/bookings", icon: "Calendar" },
    { key: "realestate-rent", label: "Rent Invoicing", labelAr: "فوترة الإيجار", path: "/app/verticals/real-estate/rent-invoicing", icon: "Receipt" },
    { key: "realestate-maintenance", label: "Maintenance", labelAr: "الصيانة", path: "/app/verticals/real-estate/maintenance", icon: "Wrench" },
    { key: "hotel-housekeeping", label: "Housekeeping", labelAr: "التدبير المنزلي", path: "/app/verticals/hotel/housekeeping", icon: "SprayCan" }
  ],
  manufacturing: [
    { key: "manufacturing", label: "Manufacturing", labelAr: "التصنيع", path: "/app/manufacturing", icon: "Factory", widget: true, action: true },
    { key: "manufacturing-bom", label: "BOM", labelAr: "قائمة المواد", path: "/app/manufacturing/bom", icon: "List" },
    { key: "manufacturing-work-orders", label: "Work Orders", labelAr: "أوامر العمل", path: "/app/manufacturing/work-orders", icon: "ClipboardList" },
    { key: "manufacturing-production", label: "Production", labelAr: "الإنتاج", path: "/app/manufacturing/production", icon: "Cog" },
    { key: "manufacturing-mrp", label: "MRP", labelAr: "تخطيط المواد", path: "/app/mrp", icon: "GitBranch" },
    { key: "manufacturing-quality", label: "Quality Control", labelAr: "مراقبة الجودة", path: "/app/verticals/manufacturing/quality", icon: "CheckCircle" }
  ],
  education: [
    { key: "education", label: "Students", labelAr: "الطلاب", path: "/app/verticals/education", icon: "GraduationCap", widget: true },
    { key: "education-admissions", label: "Admissions", labelAr: "التسجيل", path: "/app/verticals/education/admissions", icon: "UserPlus" },
    { key: "education-fees", label: "Fee Invoicing", labelAr: "الرسوم الدراسية", path: "/app/verticals/education/fee-invoicing", icon: "Receipt", widget: true },
    { key: "education-schedule", label: "Class Schedule", labelAr: "الجدول الدراسي", path: "/app/verticals/education/schedule", icon: "Calendar", widget: true },
    { key: "education-report-cards", label: "Report Cards", labelAr: "بطاقات التقارير", path: "/app/verticals/education/report-cards", icon: "FileText" },
    { key: "education-exams", label: "Exams", labelAr: "الامتحانات", path: "/app/verticals/education/exams", icon: "ClipboardCheck" },
    { key: "education-library", label: "Library", labelAr: "المكتبة", path: "/app/verticals/education/library", icon: "Book" }
  ],
  transport: [
    { key: "fleet", label: "Fleet", labelAr: "الأسطول", path: "/app/verticals/transport", icon: "Truck", widget: true, action: true },
    { key: "transport-routes", label: "Routes", labelAr: "المسارات", path: "/app/verticals/transport/routes", icon: "MapPin" },
    { key: "transport-drivers", label: "Drivers", labelAr: "السائقين", path: "/app/verticals/transport/drivers", icon: "Users" },
    { key: "transport-maintenance", label: "Maintenance", labelAr: "الصيانة", path: "/app/verticals/transport/maintenance", icon: "Wrench" },
    { key: "transport-shipments", label: "Shipments", labelAr: "الشحنات", path: "/app/verticals/transport/shipments", icon: "Package", widget: true },
    { key: "transport-tracking", label: "Live Tracking", labelAr: "التتبع المباشر", path: "/app/verticals/transport/tracking", icon: "Navigation" },
    { key: "transport-fuel", label: "Fuel Management", labelAr: "إدارة الوقود", path: "/app/verticals/transport/fuel", icon: "Fuel", widget: true }
  ],
  tourism_travel: [
    { key: "travel", label: "Travel Bookings", labelAr: "حجوزات السفر", path: "/app/verticals/travel", icon: "Globe", widget: true },
    { key: "travel-suppliers", label: "Suppliers", labelAr: "الموردون", path: "/app/verticals/travel/supplers", icon: "Building2" },
    { key: "travel-itineraries", label: "Itineraries", labelAr: "برامج الرحلات", path: "/app/verticals/travel/itineraries", icon: "MapPin" },
    { key: "travel-reconciliation", label: "Reconciliation", labelAr: "المطابقة", path: "/app/verticals/travel/reconciliation", icon: "Receipt" }
  ],
  real_estate: [
    { key: "realestate", label: "Properties", labelAr: "العقارات", path: "/app/verticals/real-estate", icon: "Home", widget: true },
    { key: "realestate-leases", label: "Leases", labelAr: "الإيجارات", path: "/app/verticals/real-estate/leases", icon: "FileText" },
    { key: "realestate-rent", label: "Rent Invoicing", labelAr: "فوترة الإيجار", path: "/app/verticals/real-estate/rent-invoicing", icon: "Receipt", widget: true },
    { key: "realestate-maintenance", label: "Maintenance", labelAr: "الصيانة", path: "/app/verticals/real-estate/maintenance", icon: "Wrench" },
    { key: "realestate-commissions", label: "Commissions", labelAr: "العمولات", path: "/app/verticals/real-estate/commissions", icon: "Percent" },
    { key: "realestate-tenants", label: "Tenants", labelAr: "المستأجرين", path: "/app/verticals/real-estate/tenants", icon: "Users" }
  ],
  services: [
    { key: "projects", label: "Projects", labelAr: "المشاريع", path: "/app/projects/list", icon: "FolderKanban", widget: true },
    { key: "helpdesk", label: "Help Desk", labelAr: "الدعم الفني", path: "/app/helpdesk/tickets", icon: "HeadphonesIcon" },
    { key: "services-timesheets", label: "Timesheets", labelAr: "سجلات الوقت", path: "/app/projects/timesheets", icon: "Clock" },
    { key: "services-tasks", label: "Tasks", labelAr: "المهام", path: "/app/projects/tasks", icon: "CheckSquare" },
    { key: "services-contracts", label: "Service Contracts", labelAr: "عقود الخدمة", path: "/app/verticals/services/contracts", icon: "FileSignature" }
  ],
  laundry: [
    { key: "pos", label: "Laundry POS", labelAr: "نقطة بيع المغسلة", path: "/app/pos", icon: "Store", action: true },
    { key: "crm", label: "Customers", labelAr: "العملاء", path: "/app/crm", icon: "Briefcase", widget: true },
    { key: "retail-products", label: "Items & Services", labelAr: "الأصناف والخدمات", path: "/app/inventory/products", icon: "Package", widget: true }
  ],
  salon: [
    { key: "crm", label: "Customers", labelAr: "العملاء", path: "/app/crm", icon: "Briefcase", widget: true },
    { key: "pos", label: "Salon POS", labelAr: "نقطة بيع الصالون", path: "/app/pos", icon: "Scissors", action: true },
    { key: "services-tasks", label: "Appointments", labelAr: "المواعيد", path: "/app/projects/tasks", icon: "Calendar", widget: true }
  ],
  gym: [
    { key: "crm", label: "Members", labelAr: "الأعضاء", path: "/app/crm", icon: "Briefcase", widget: true },
    { key: "sales", label: "Membership Billing", labelAr: "فوترة الاشتراكات", path: "/app/sales", icon: "Receipt", action: true }
  ],
  pharmacy: [
    { key: "healthcare-pharmacy", label: "Pharmacy POS", labelAr: "نقطة بيع الصيدلية", path: "/app/pos/pharmacy", icon: "Pill", action: true },
    { key: "retail-products", label: "Medicines", labelAr: "الأدوية", path: "/app/inventory/products", icon: "Package", widget: true }
  ],
  ecommerce: [
    { key: "retail-products", label: "Products", labelAr: "المنتجات", path: "/app/inventory/products", icon: "Package", widget: true },
    { key: "sales", label: "Online Orders", labelAr: "طلبات المتجر", path: "/app/sales/orders", icon: "ShoppingCart", action: true },
    { key: "transport-shipments", label: "Shipments", labelAr: "الشحنات", path: "/app/verticals/transport/shipments", icon: "Package", action: true }
  ],
  all: []
};

// Add Saudi-market vertical workspaces (config-driven — see src/config/verticalWorkspaces.ts)
const ws = (key: string, label: string, labelAr: string, icon: string, widget: boolean = false, action: boolean = false): ModuleConfig => ({
  key,
  label,
  labelAr,
  path: `/app/verticals/ws/${key}`,
  icon,
  widget,
  action
});

const wsFieldservice = ws("fieldservice", "Facility & AMC", "المرافق وعقود الصيانة", "Wrench", true, true);
const wsEvents = ws("events", "Events & Bookings", "الفعاليات والحجوزات", "PartyPopper", true, false);
const wsAgency = ws("agency", "Campaigns", "الحملات", "Megaphone", true, true);
const wsProfessional = ws("professional", "Matters & Engagements", "القضايا والارتباطات", "Scale", true, true);
const wsAgriculture = ws("agriculture", "Farm Operations", "عمليات المزرعة", "Sprout", true, false);
const wsEnergy = ws("energy", "Energy Projects", "مشاريع الطاقة", "SunMedium", true, false);
const wsMining = ws("mining", "Weighbridge & Dispatch", "الميزان والإرسال", "Mountain", true, false);
const wsMarine = ws("marine", "Shipment Files", "ملفات الشحن", "Ship", true, false);
const wsVeterinary = ws("veterinary", "Vet Visits", "الزيارات البيطرية", "PawPrint", true, false);
const wsNonprofit = ws("nonprofit", "Cases & Campaigns", "الحالات والحملات", "HeartHandshake", true, false);
const wsTailoring = ws("tailoring", "Tailoring Orders", "طلبات الخياطة", "Shirt", true, false);
const wsJewelry = ws("jewelry", "Gold & Jewelry Desk", "مكتب الذهب", "Gem", true, false);
const wsRepair = ws("repair", "Repair Tickets", "تذاكر الصيانة", "Smartphone", true, false);
const wsFurniture = ws("furniture", "Custom Orders", "الطلبات المخصصة", "Armchair", true, false);
const wsPrinting = ws("printing", "Print Jobs", "أوامر الطباعة", "Printer", true, false);
const wsWatersvc = ws("watersvc", "Routes & Subscriptions", "المسارات والاشتراكات", "Droplets", true, false);
const wsFinserv = ws("finserv", "Policies & Commissions", "الوثائق والعمولات", "ShieldCheck", true, true);
const wsImportexport = ws("importexport", "Import Files", "ملفات الاستيراد", "Container", true, false);

Object.assign(verticalModules, {
  // Group categories → reuse existing vertical menus (+ new workspaces)
  healthcare_medical: [...(verticalModules.hospital || [])],
  construction_engineering: [...(verticalModules.construction || [])],
  real_estate_property: [...(verticalModules.real_estate || [])],
  hospitality_accommodation: [...(verticalModules.hotel || [])],
  food_beverage: [...(verticalModules.restaurant || [])],
  education_edtech: [...(verticalModules.education || [])],
  offline_retail_consumer: [...(verticalModules.retail || [])],
  manufacturing_industrial: [...(verticalModules.manufacturing || [])],
  ecommerce_online_retail: [...(verticalModules.ecommerce || []), wsImportexport],
  logistics_supply_chain: [...(verticalModules.transport || []), wsMarine, wsImportexport],
  automotive_transportation: [...(verticalModules.workshop || []), ...(verticalModules.transport || [])],
  tourism_travel: [...(verticalModules.tourism_travel || [])],

  // New Saudi-market vertical workspaces
  digital_marketing_media: [wsAgency, ...(verticalModules.services || [])],
  professional_consulting: [wsProfessional, ...(verticalModules.services || [])],
  events_entertainment: [wsEvents],
  financial_fintech: [wsFinserv],
  agriculture_agritech: [wsAgriculture],
  clean_energy_environment: [wsEnergy, wsWatersvc],
  wholesale_import_export: [wsImportexport, { key: "pos_wholesale", label: "Wholesale POS", labelAr: "بيع الجملة", path: "/app/pos/wholesale", icon: "Store", action: true }],
  mining_quarrying: [wsMining],
  marine_port_shipping: [wsMarine, { key: "transport-shipments", label: "Shipments", labelAr: "الشحنات", path: "/app/verticals/transport/shipments", icon: "Package", action: true }],
  veterinary_pet: [wsVeterinary],
  nonprofit_charity: [wsNonprofit],
  tailoring_fashion: [wsTailoring],
  gold_jewelry_watches: [wsJewelry],
  electronics_repair: [wsRepair],
  furniture_carpentry: [wsFurniture],
  printing_signage: [wsPrinting],
  water_sanitation_waste: [wsWatersvc]
}) satisfies Partial<Record<BusinessCategory, ModuleConfig[]>>;

// Enhance existing "services" category with the new Field Service workspace (add-only)
verticalModules.services = [wsFieldservice, ...(verticalModules.services || [])];

export function useCategoryModules(category?: BusinessCategory) {
  return useMemo(() => {
    const cat = category || getStoredCategory();
    const verticals = cat === "all"
      ? Object.values(verticalModules).flat()
      : verticalModules[cat] || [];
    const enabledModuleIds = new Set(getEnabledModuleIds(cat));
    const modules = [...coreModules, ...verticals];
    if (cat === "all") return modules;
    return modules.filter((module) => {
      if (enabledModuleIds.has(module.key)) return true;
      const paths = MODULE_PATH_PREFIXES[module.key] || [];
      return paths.some((prefix) => module.path === prefix || (prefix !== "/app" && module.path.startsWith(`${prefix}/`)));
    });
  }, [category]);
}

export function useCategoryWidgets(category?: BusinessCategory): DashboardWidget[] {
  return useMemo(() => {
    const widgets = getDashboardWidgets(category || getStoredCategory());
    return widgets;
  }, [category]);
}

export function useCategoryActions(category?: BusinessCategory): ModuleConfig[] {
  return useMemo(() => {
    const modules = useCategoryModules(category);
    return modules.filter(module => module.action === true);
  }, [category]);
}

export { getStoredCategory, type BusinessCategory };