import { useMemo } from "react";

export type BusinessCategory =
  | "hospital" | "workshop" | "construction" | "retail" | "restaurant"
  | "hotel" | "manufacturing" | "education" | "transport" | "real_estate"
  | "services" | "all";

export interface ModuleConfig {
  key: string;
  label: string;
  labelAr: string;
  path: string;
  icon: string;
}

const CATEGORY_STORAGE_KEY = "yasco-company-profile";

function getStoredCategory(): BusinessCategory {
  try {
    const raw = localStorage.getItem(CATEGORY_STORAGE_KEY);
    if (!raw) return "all";
    const data = JSON.parse(raw);
    return (data.businessCategory as BusinessCategory) || "all";
  } catch {
    return "all";
  }
}

const coreModules: ModuleConfig[] = [
  { key: "dashboard", label: "Dashboard", labelAr: "لوحة التحكم", path: "/app", icon: "LayoutDashboard" },
  { key: "accounting", label: "Accounting", labelAr: "المحاسبة", path: "/app/accounting", icon: "BookOpen" },
  { key: "inventory", label: "Inventory", labelAr: "المخزون", path: "/app/inventory", icon: "Package" },
  { key: "sales", label: "Sales", labelAr: "المبيعات", path: "/app/sales", icon: "ShoppingCart" },
  { key: "purchase", label: "Purchase", labelAr: "المشتريات", path: "/app/purchase", icon: "ShoppingBag" },
  { key: "hrm", label: "HRM", labelAr: "الموارد البشرية", path: "/app/hrm", icon: "Users" },
  { key: "reports", label: "Reports", labelAr: "التقارير", path: "/app/reports", icon: "BarChart3" },
  { key: "settings", label: "Settings", labelAr: "الإعدادات", path: "/app/settings", icon: "Settings" },
];

const verticalModules: Record<BusinessCategory, ModuleConfig[]> = {
  hospital: [
    { key: "healthcare", label: "Patients", labelAr: "المرضى", path: "/app/verticals/healthcare", icon: "Stethoscope" },
    { key: "healthcare-appointments", label: "Appointments", labelAr: "المواعيد", path: "/app/verticals/healthcare/appointments", icon: "Calendar" },
    { key: "healthcare-roster", label: "Doctor Roster", labelAr: "جدول الأطباء", path: "/app/verticals/healthcare/roster", icon: "Users" },
    { key: "healthcare-insurance", label: "Insurance Claims", labelAr: "مطالبات التأمين", path: "/app/verticals/healthcare/insurance-claims", icon: "Shield" },
    { key: "healthcare-pharmacy", label: "Pharmacy", labelAr: "الصيدلية", path: "/app/pos/pharmacy", icon: "Pill" },
    { key: "healthcare-lab", label: "Lab", labelAr: "المختبر", path: "/app/verticals/healthcare/lab", icon: "Flask" },
    { key: "healthcare-billing", label: "Billing", labelAr: "الفواتير", path: "/app/verticals/healthcare/billing", icon: "Receipt" },
    { key: "healthcare-nursing", label: "Nursing", labelAr: "التمريض", path: "/app/verticals/healthcare/nursing", icon: "Heart" },
  ],
  workshop: [
    { key: "workshop", label: "Workshop Dashboard", labelAr: "لوحة الورشة", path: "/app/verticals/workshop", icon: "Wrench" },
    { key: "workshop-jobcards", label: "Job Cards", labelAr: "بطاقات العمل", path: "/app/verticals/workshop/job-cards", icon: "ClipboardList" },
    { key: "workshop-vehicles", label: "Vehicles", labelAr: "المركبات", path: "/app/verticals/workshop/vehicles", icon: "Car" },
    { key: "workshop-estimates", label: "Estimates", labelAr: "التقديرات", path: "/app/verticals/workshop/estimates", icon: "FileText" },
    { key: "workshop-technicians", label: "Technicians", labelAr: "الفنيين", path: "/app/verticals/workshop/technicians", icon: "Users" },
    { key: "workshop-inspections", label: "Inspections", labelAr: "الفحوصات", path: "/app/verticals/workshop/inspections", icon: "Search" },
    { key: "workshop-parts", label: "Parts Inventory", labelAr: "قطع الغيار", path: "/app/verticals/workshop/parts", icon: "Package" },
    { key: "workshop-bays", label: "Bay Schedule", labelAr: "جدول الرافعات", path: "/app/verticals/workshop/bays", icon: "ParkingCircle" },
    { key: "workshop-payments", label: "Payments", labelAr: "المدفوعات", path: "/app/verticals/workshop/payments", icon: "Wallet" },
  ],
  construction: [
    { key: "construction", label: "Projects", labelAr: "المشاريع", path: "/app/construction", icon: "FolderKanban" },
    { key: "construction-wbs", label: "WBS", labelAr: "هيكل العمل", path: "/app/construction/wbs", icon: "GitBranch" },
    { key: "construction-boq", label: "BOQ", labelAr: "جدول الكميات", path: "/app/construction/boq", icon: "List" },
    { key: "construction-contracts", label: "Contracts", labelAr: "العقود", path: "/app/construction/contracts", icon: "FileText" },
    { key: "construction-hse", label: "HSE", labelAr: "السلامة", path: "/app/construction/hse", icon: "Shield" },
    { key: "construction-subcontractors", label: "Subcontractors", labelAr: "المقاولون", path: "/app/construction/subcontractors", icon: "Building2" },
    { key: "construction-equipment", label: "Equipment", labelAr: "المعدات", path: "/app/construction/equipment-schedule", icon: "Tractor" },
    { key: "construction-materials", label: "Materials", labelAr: "المواد", path: "/app/construction/materials", icon: "Package" },
    { key: "construction-variations", label: "Variations", labelAr: "التغييرات", path: "/app/construction/variations", icon: "GitCompare" },
    { key: "construction-advance", label: "Advance Payments", labelAr: "الدفعات المقدمة", path: "/app/construction/advance-payments", icon: "Wallet" },
    { key: "construction-daily", label: "Daily Reports", labelAr: "التقارير اليومية", path: "/app/construction/daily-reports", icon: "FileText" },
    { key: "construction-quality", label: "Quality", labelAr: "الجودة", path: "/app/verticals/construction/quality", icon: "CheckCircle" },
    { key: "construction-saudization", label: "Saudization", labelAr: "السعودة", path: "/app/construction/saudization", icon: "Users" },
    { key: "construction-compliance", label: "Compliance", labelAr: "الامتثال", path: "/app/construction/compliance/sbc", icon: "ShieldCheck" },
  ],
  retail: [
    { key: "pos", label: "POS", labelAr: "نقطة البيع", path: "/app/pos", icon: "Store" },
    { key: "crm", label: "CRM", labelAr: "إدارة العملاء", path: "/app/crm", icon: "Briefcase" },
    { key: "retail-products", label: "Products", labelAr: "المنتجات", path: "/app/inventory/products", icon: "Package" },
    { key: "retail-pos-wholesale", label: "Wholesale POS", labelAr: "بيع الجملة", path: "/app/pos/wholesale", icon: "ShoppingCart" },
    { key: "retail-loyalty", label: "Loyalty", labelAr: "ولاء العملاء", path: "/app/verticals/retail/loyalty", icon: "Heart" },
  ],
  restaurant: [
    { key: "pos-restaurant", label: "Restaurant POS", labelAr: "نقطة بيع المطعم", path: "/app/pos/restaurant", icon: "UtensilsCrossed" },
    { key: "restaurant-menu", label: "Menu", labelAr: "قائمة الطعام", path: "/app/verticals/restaurant/menu", icon: "BookOpen" },
    { key: "restaurant-tables", label: "Tables", labelAr: "الطاولات", path: "/app/verticals/restaurant/tables", icon: "Grid" },
    { key: "restaurant-delivery", label: "Delivery", labelAr: "التوصيل", path: "/app/verticals/restaurant/delivery", icon: "Truck" },
    { key: "restaurant-kitchen", label: "Kitchen Display", labelAr: "شاشة المطبخ", path: "/app/verticals/restaurant/kitchen", icon: "ChefHat" },
    { key: "restaurant-reservations", label: "Reservations", labelAr: "الحجوزات", path: "/app/verticals/restaurant/reservations", icon: "Calendar" },
  ],
  hotel: [
    { key: "hotel", label: "Hotel", labelAr: "الفندق", path: "/app/verticals/hotel", icon: "Hotel" },
    { key: "hotel-rooms", label: "Rooms", labelAr: "الغرف", path: "/app/verticals/hotel/rooms", icon: "BedDouble" },
    { key: "hotel-bookings", label: "Bookings", labelAr: "الحجوزات", path: "/app/verticals/hotel/bookings", icon: "Calendar" },
    { key: "hotel-housekeeping", label: "Housekeeping", labelAr: "التدبير المنزلي", path: "/app/verticals/hotel/housekeeping", icon: "SprayCan" },
    { key: "hotel-folio", label: "Folio Billing", labelAr: "فوترة الحساب", path: "/app/verticals/hotel/folio-billing", icon: "Receipt" },
    { key: "hotel-restaurant", label: "Restaurant", labelAr: "المطعم", path: "/app/pos/restaurant", icon: "UtensilsCrossed" },
    { key: "hotel-events", label: "Events", labelAr: "الفعاليات", path: "/app/verticals/hotel/events", icon: "PartyPopper" },
  ],
  manufacturing: [
    { key: "manufacturing", label: "Manufacturing", labelAr: "التصنيع", path: "/app/manufacturing", icon: "Factory" },
    { key: "manufacturing-bom", label: "BOM", labelAr: "قائمة المواد", path: "/app/manufacturing/bom", icon: "List" },
    { key: "manufacturing-work-orders", label: "Work Orders", labelAr: "أوامر العمل", path: "/app/manufacturing/work-orders", icon: "ClipboardList" },
    { key: "manufacturing-production", label: "Production", labelAr: "الإنتاج", path: "/app/manufacturing/production", icon: "Cog" },
    { key: "manufacturing-mrp", label: "MRP", labelAr: "تخطيط المواد", path: "/app/mrp", icon: "GitBranch" },
    { key: "manufacturing-quality", label: "Quality Control", labelAr: "مراقبة الجودة", path: "/app/verticals/manufacturing/quality", icon: "CheckCircle" },
  ],
  education: [
    { key: "education", label: "Students", labelAr: "الطلاب", path: "/app/verticals/education", icon: "GraduationCap" },
    { key: "education-admissions", label: "Admissions", labelAr: "التسجيل", path: "/app/verticals/education/admissions", icon: "UserPlus" },
    { key: "education-fees", label: "Fee Invoicing", labelAr: "الرسوم الدراسية", path: "/app/verticals/education/fee-invoicing", icon: "Receipt" },
    { key: "education-schedule", label: "Class Schedule", labelAr: "الجدول الدراسي", path: "/app/verticals/education/schedule", icon: "Calendar" },
    { key: "education-report-cards", label: "Report Cards", labelAr: "بطاقات التقارير", path: "/app/verticals/education/report-cards", icon: "FileText" },
    { key: "education-exams", label: "Exams", labelAr: "الامتحانات", path: "/app/verticals/education/exams", icon: "ClipboardCheck" },
    { key: "education-library", label: "Library", labelAr: "المكتبة", path: "/app/verticals/education/library", icon: "Book" },
  ],
  transport: [
    { key: "fleet", label: "Fleet", labelAr: "الأسطول", path: "/app/verticals/transport", icon: "Truck" },
    { key: "transport-routes", label: "Routes", labelAr: "المسارات", path: "/app/verticals/transport/routes", icon: "MapPin" },
    { key: "transport-drivers", label: "Drivers", labelAr: "السائقين", path: "/app/verticals/transport/drivers", icon: "Users" },
    { key: "transport-maintenance", label: "Maintenance", labelAr: "الصيانة", path: "/app/verticals/transport/maintenance", icon: "Wrench" },
    { key: "transport-shipments", label: "Shipments", labelAr: "الشحنات", path: "/app/verticals/transport/shipments", icon: "Package" },
    { key: "transport-tracking", label: "Live Tracking", labelAr: "التتبع المباشر", path: "/app/verticals/transport/tracking", icon: "Navigation" },
    { key: "transport-fuel", label: "Fuel Management", labelAr: "إدارة الوقود", path: "/app/verticals/transport/fuel", icon: "Fuel" },
  ],
  real_estate: [
    { key: "realestate", label: "Properties", labelAr: "العقارات", path: "/app/verticals/real-estate", icon: "Home" },
    { key: "realestate-leases", label: "Leases", labelAr: "الإيجارات", path: "/app/verticals/real-estate/leases", icon: "FileText" },
    { key: "realestate-rent", label: "Rent Invoicing", labelAr: "فوترة الإيجار", path: "/app/verticals/real-estate/rent-invoicing", icon: "Receipt" },
    { key: "realestate-maintenance", label: "Maintenance", labelAr: "الصيانة", path: "/app/verticals/real-estate/maintenance", icon: "Wrench" },
    { key: "realestate-commissions", label: "Commissions", labelAr: "العمولات", path: "/app/verticals/real-estate/commissions", icon: "Percent" },
    { key: "realestate-tenants", label: "Tenants", labelAr: "المستأجرين", path: "/app/verticals/real-estate/tenants", icon: "Users" },
  ],
  services: [
    { key: "projects", label: "Projects", labelAr: "المشاريع", path: "/app/projects/list", icon: "FolderKanban" },
    { key: "helpdesk", label: "Help Desk", labelAr: "الدعم الفني", path: "/app/helpdesk/tickets", icon: "HeadphonesIcon" },
    { key: "services-timesheets", label: "Timesheets", labelAr: "سجلات الوقت", path: "/app/projects/timesheets", icon: "Clock" },
    { key: "services-tasks", label: "Tasks", labelAr: "المهام", path: "/app/projects/tasks", icon: "CheckSquare" },
    { key: "services-contracts", label: "Service Contracts", labelAr: "عقود الخدمة", path: "/app/verticals/services/contracts", icon: "FileSignature" },
  ],
  all: [],
};

export function useCategoryModules(category?: BusinessCategory) {
  return useMemo(() => {
    const cat = category || getStoredCategory();
    const verticals = cat === "all"
      ? Object.values(verticalModules).flat()
      : verticalModules[cat] || [];
    return [...coreModules, ...verticals];
  }, [category]);
}

export { getStoredCategory };
