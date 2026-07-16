import { memo, useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/providers/language";
import { useCountryDetection } from "@/providers/country-detection";
import { trpc } from "@/providers/trpc";

import {
  LayoutDashboard,
  BookOpen,
  Package,
  ShoppingCart,
  ShoppingBag,
  Users,
  Briefcase,
  Factory,
  FolderKanban,
  HeadphonesIcon,
  Truck,
  Settings,
  BarChart3,
  Receipt,
  Landmark,
  Building2,
  ChevronLeft,
  ChevronRight,
  Warehouse,
  Menu,
  Languages,
  Globe,
  Search,
  Bell,
  ShieldCheck,
  Command,
  Rocket,
  LogOut,
  Workflow,
  Store,
  Wallet,
  CalendarCheck,
  CreditCard,
  Sparkles,
  Key,
  Palette,
  FileText,
  User,
  X,
  ChevronDown,
  Wrench,
  ClipboardList,
  Car,
  ParkingCircle,
  FileWarning,
  Stethoscope,
  GraduationCap,
  Hotel,
  Home,
  Plane,
  Shirt,
  Scissors,
  Dumbbell,
  Heart,
  UtensilsCrossed,
  HardHat,
  Compass,
  GitBranch,
  Grid,
  Pill,
  Droplets,
  Gem,
  Monitor,
  Sofa,
  Printer,
  HeartHandshake,
  Ship,
  Mountain,
} from "lucide-react";

import { SyncStatusBar } from "./sync/SyncStatusBar";
import { ChatBubble } from "./ChatBubble";
import {
  getEnabledSidebarPathPrefixes,
  getStoredCategory,
  getVisibleGroupTitles,
} from "@/config/businessCatalog";

const categoryGroupVisibility: Record<string, string[]> = {
  hospital: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'HEALTHCARE', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  workshop: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'WORKSHOP', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  construction: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'CONSTRUCTION', 'PROJECTS', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  retail: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  restaurant: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'RESTAURANT', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  hotel: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'HOTEL', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  hostel: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'HOSTEL', 'REAL_ESTATE', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  manufacturing: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'MANUFACTURING', 'PROJECTS', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  education: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'EDUCATION', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  transport: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'TRANSPORT', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  real_estate: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'REAL_ESTATE', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  services: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'PROJECTS', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  travel: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'TRAVEL', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  aviation: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'AVIATION', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  laundry: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'LAUNDRY', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  salon: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'SALON', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  gym: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'GYM', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  ecommerce: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'ECOMMERCE', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  pharmacy: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'PHARMACY', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  // Extended categories - mapped to their base vertical sidebar groups
  ecommerce_online_retail: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'ECOMMERCE', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  manufacturing_industrial: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'MANUFACTURING', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  digital_marketing_media: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'PROJECTS', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  logistics_supply_chain: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'TRANSPORT', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  healthcare_medical: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'HEALTHCARE', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  real_estate_property: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'REAL_ESTATE', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  construction_engineering: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'CONSTRUCTION', 'PROJECTS', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  tourism_travel: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'TRAVEL', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  hospitality_accommodation: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'HOTEL', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  food_beverage: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'RESTAURANT', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  education_edtech: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'EDUCATION', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  professional_consulting: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'PROJECTS', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  offline_retail_consumer: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  events_entertainment: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'PROJECTS', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  financial_fintech: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'PROJECTS', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  agriculture_agritech: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'MANUFACTURING', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  automotive_transportation: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'WORKSHOP', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  clean_energy_environment: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'PROJECTS', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  wholesale_import_export: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  // Newly added categories
  mining_quarrying: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'PROJECTS', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  marine_port_shipping: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'TRANSPORT', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  veterinary_pet: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'HEALTHCARE', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  nonprofit_charity: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'PROJECTS', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  tailoring_fashion: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  gold_jewelry_watches: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  electronics_repair: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'WORKSHOP', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  furniture_carpentry: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'MANUFACTURING', 'PROJECTS', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  printing_signage: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'MANUFACTURING', 'PROJECTS', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  water_sanitation_waste: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'TRANSPORT', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  all: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'MANUFACTURING', 'PROJECTS', 'WORKSHOP', 'CONSTRUCTION', 'HEALTHCARE', 'EDUCATION', 'HOTEL', 'REAL_ESTATE', 'TRANSPORT', 'TRAVEL', 'AVIATION', 'RESTAURANT', 'LAUNDRY', 'SALON', 'GYM', 'ECOMMERCE', 'PHARMACY', 'HOSTEL', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
};

const menuGroups = [
  {
    title: "MAIN",
    titleAr: "الرئيسية",
    items: [
      { label: "Dashboard", labelAr: "لوحة التحكم", icon: LayoutDashboard, path: "/app" },
      { label: "POS", labelAr: "نقطة البيع", icon: Store, path: "/app/pos" },
      { label: "Cashbox", labelAr: "الصندوق", icon: Wallet, path: "/app/cashbox" },
      { label: "Installments", labelAr: "التقسيط", icon: CalendarCheck, path: "/app/installments" },
    ],
  },
  {
    title: "FINANCE",
    titleAr: "المالية",
    items: [
      { label: "Accounting", labelAr: "المحاسبة", icon: BookOpen, path: "/app/accounting" },
      { label: "Chart of Accounts", labelAr: "دليل الحسابات", icon: Landmark, path: "/app/accounting/coa" },
      { label: "Journal Entries", labelAr: "القيود اليومية", icon: Receipt, path: "/app/accounting/journal-entries" },
      { label: "General Ledger", labelAr: "الأستاذ العام", icon: BookOpen, path: "/app/accounting/ledger" },
      { label: "Financial Reports", labelAr: "التقارير المالية", icon: BarChart3, path: "/app/accounting/reports" },
      { label: "Accounting Settings", labelAr: "إعدادات المحاسبة", icon: Settings, path: "/app/accounting/settings" },
    ],
  },
  {
    title: "INVENTORY",
    titleAr: "المخزون",
    items: [
      { label: "Products", labelAr: "الأصناف", icon: Package, path: "/app/inventory/products" },
      { label: "Warehouses", labelAr: "المستودعات", icon: Warehouse, path: "/app/inventory/warehouses" },
      { label: "Stock Levels", labelAr: "أرصدة المخزون", icon: Package, path: "/app/inventory/stock" },
      { label: "Stock Movements", labelAr: "حركات المخزون", icon: ShoppingCart, path: "/app/inventory/movements" },
      { label: "Stock Transfers", labelAr: "تحويلات المخزون", icon: Truck, path: "/app/inventory/transfers" },
    ],
  },
  {
    title: "SALES",
    titleAr: "المبيعات",
    items: [
      { label: "Customers", labelAr: "العملاء", icon: Users, path: "/app/sales/customers" },
      { label: "Quotations", labelAr: "عروض الأسعار", icon: Receipt, path: "/app/sales/quotations" },
      { label: "Sales Orders", labelAr: "أوامر البيع", icon: ShoppingCart, path: "/app/sales/orders" },
      { label: "Invoices", labelAr: "الفواتير", icon: Receipt, path: "/app/sales/invoices" },
      { label: "Credit Notes", labelAr: "إشعارات دائنة", icon: Receipt, path: "/app/sales/credit-notes" },
      { label: "Customer Payments", labelAr: "مدفوعات العملاء", icon: Landmark, path: "/app/sales/payments" },
    ],
  },
  {
    title: "PURCHASE",
    titleAr: "المشتريات",
    items: [
      { label: "Suppliers", labelAr: "الموردون", icon: Building2, path: "/app/purchase/suppliers" },
      { label: "Purchase Orders", labelAr: "أوامر الشراء", icon: ShoppingBag, path: "/app/purchase/orders" },
      { label: "Goods Receipt", labelAr: "استلام البضاعة", icon: Package, path: "/app/purchase/grn" },
      { label: "Supplier Payments", labelAr: "مدفوعات الموردين", icon: Landmark, path: "/app/purchase/payments" },
    ],
  },
  {
    title: "CRM",
    titleAr: "إدارة العملاء",
    items: [
      { label: "Leads", labelAr: "العملاء المحتملون", icon: Users, path: "/app/crm/leads" },
      { label: "Opportunities", labelAr: "الفرص", icon: Briefcase, path: "/app/crm/opportunities" },
      { label: "Activities", labelAr: "الأنشطة", icon: BarChart3, path: "/app/crm/activities" },
    ],
  },
  {
    title: "HRM",
    titleAr: "الموارد البشرية",
    items: [
      { label: "Employees", labelAr: "الموظفون", icon: Users, path: "/app/hrm/employees" },
      { label: "Attendance", labelAr: "الحضور", icon: Briefcase, path: "/app/hrm/attendance" },
      { label: "Leave Management", labelAr: "إدارة الإجازات", icon: Briefcase, path: "/app/hrm/leave" },
      { label: "Payroll", labelAr: "الرواتب", icon: Landmark, path: "/app/hrm/payroll" },
      { label: "Saudi GOSI Payroll", labelAr: "الرواتب والتأمينات", icon: ShieldCheck, path: "/app/hrm/saudi-payroll" },
      { label: "Performance", labelAr: "الأداء", icon: BarChart3, path: "/app/hrm/performance" },
    ],
  },
  {
    title: "MANUFACTURING",
    titleAr: "التصنيع",
    items: [
      { label: "Bill of Materials", labelAr: "قائمة المواد", icon: Factory, path: "/app/manufacturing/bom" },
      { label: "Work Orders", labelAr: "أوامر العمل", icon: Factory, path: "/app/manufacturing/work-orders" },
      { label: "Production", labelAr: "الإنتاج", icon: Factory, path: "/app/manufacturing/production" },
    ],
  },
  {
    title: "PROJECTS",
    titleAr: "المشاريع",
    items: [
      { label: "Projects", labelAr: "المشاريع", icon: FolderKanban, path: "/app/projects/list" },
      { label: "Tasks", labelAr: "المهام", icon: FolderKanban, path: "/app/projects/tasks" },
      { label: "Timesheets", labelAr: "سجلات الوقت", icon: Briefcase, path: "/app/projects/timesheets" },
    ],
  },
  {
    title: "OPERATIONS",
    titleAr: "التشغيل",
    items: [
      { label: "Help Desk", labelAr: "الدعم الفني", icon: HeadphonesIcon, path: "/app/helpdesk/tickets" },
      { label: "Assets", labelAr: "الأصول", icon: Building2, path: "/app/assets/list" },
      { label: "Fleet", labelAr: "الأسطول", icon: Truck, path: "/app/assets/fleet" },
      { label: "Travel Bookings", labelAr: "حجوزات السفر", icon: Globe, path: "/app/verticals/travel" },
      { label: "Travel Suppliers", labelAr: "موردو السفر", icon: Building2, path: "/app/verticals/travel/suppliers" },
      { label: "Itineraries", labelAr: "برامج الرحلات", icon: CalendarCheck, path: "/app/verticals/travel/itineraries" },
      { label: "Travel Reconciliation", labelAr: "مطابقة السفر", icon: Landmark, path: "/app/verticals/travel/reconciliation" },
    ],
  },
  {
    title: "WORKSHOP",
    titleAr: "الورشة",
    items: [
      { label: "Workshop Dashboard", labelAr: "لوحة الورشة", icon: Wrench, path: "/app/verticals/workshop" },
      { label: "Job Cards", labelAr: "بطاقات العمل", icon: ClipboardList, path: "/app/verticals/workshop/job-cards" },
      { label: "Vehicles", labelAr: "المركبات", icon: Car, path: "/app/verticals/workshop/vehicles" },
      { label: "Estimates", labelAr: "التقديرات", icon: FileText, path: "/app/verticals/workshop/estimates" },
      { label: "Technicians", labelAr: "الفنيين", icon: Users, path: "/app/verticals/workshop/technicians" },
      { label: "Inspections", labelAr: "الفحوصات", icon: Search, path: "/app/verticals/workshop/inspections" },
      { label: "Bay Schedule", labelAr: "جدول الرافعات", icon: ParkingCircle, path: "/app/verticals/workshop/bays" },
    ],
  },
  {
    title: "CONSTRUCTION",
    titleAr: "المقاولات",
    items: [
      { label: "Construction Panel", labelAr: "لوحة المقاولات", icon: HardHat, path: "/app/construction" },
      { label: "WBS Structure", labelAr: "هيكل العمل WBS", icon: GitBranch, path: "/app/construction/wbs" },
      { label: "BOQ / Quantities", labelAr: "جدول الكميات BOQ", icon: ClipboardList, path: "/app/construction/boq" },
      { label: "Contracts", labelAr: "العقود والمشاريع", icon: FileText, path: "/app/construction/contracts" },
      { label: "Variation Orders", labelAr: "أوامر التغيير", icon: FileText, path: "/app/construction/variations" },
      { label: "Daily Reports", labelAr: "التقارير اليومية", icon: FileText, path: "/app/construction/daily-reports" },
      { label: "Subcontractors", labelAr: "مقاولين الباطن", icon: Building2, path: "/app/construction/subcontractors" },
      { label: "HSE Safety", labelAr: "الصحة والسلامة", icon: ShieldCheck, path: "/app/construction/hse" },
      { label: "Saudization", labelAr: "التوظيف الهندسي", icon: Users, path: "/app/construction/saudization" },
      { label: "Equipment Schedule", labelAr: "جدول المعدات", icon: Truck, path: "/app/construction/equipment-schedule" },
    ],
  },
  {
    title: "HEALTHCARE",
    titleAr: "الرعاية الصحية",
    items: [
      { label: "Patients", labelAr: "المرضى", icon: Stethoscope, path: "/app/verticals/healthcare/patients" },
      { label: "Appointments", labelAr: "المواعيد", icon: CalendarCheck, path: "/app/verticals/healthcare/appointments" },
      { label: "Doctor Roster", labelAr: "جدول الأطباء", icon: Users, path: "/app/verticals/healthcare/roster" },
      { label: "Insurance Claims", labelAr: "مطالبات التأمين", icon: ShieldCheck, path: "/app/verticals/healthcare/insurance-claims" },
      { label: "Pharmacy POS", labelAr: "نقطة بيع الصيدلية", icon: Package, path: "/app/pos/pharmacy" },
    ],
  },
  {
    title: "EDUCATION",
    titleAr: "التعليم",
    items: [
      { label: "Students", labelAr: "الطلاب", icon: GraduationCap, path: "/app/verticals/education/students" },
      { label: "Admissions", labelAr: "القبول والتسجيل", icon: Users, path: "/app/verticals/education/admissions" },
      { label: "Fee Invoicing", labelAr: "فاتورة الرسوم", icon: Receipt, path: "/app/verticals/education/fee-invoicing" },
      { label: "Class Schedule", labelAr: "جدول الحصص", icon: CalendarCheck, path: "/app/verticals/education/schedule" },
      { label: "Report Cards", labelAr: "الشهادات والتقارير", icon: FileText, path: "/app/verticals/education/report-cards" },
    ],
  },
  {
    title: "HOTEL",
    titleAr: "الفنادق والضيافة",
    items: [
      { label: "Room Status", labelAr: "حالة الغرف", icon: Hotel, path: "/app/verticals/hotel/rooms" },
      { label: "Bookings", labelAr: "الحجوزات", icon: CalendarCheck, path: "/app/verticals/hotel/bookings" },
      { label: "Booking Calendar", labelAr: "مخطط الحجوزات", icon: CalendarCheck, path: "/app/verticals/hotel/calendar" },
      { label: "Housekeeping", labelAr: "تنظيف الغرف", icon: Wrench, path: "/app/verticals/hotel/housekeeping" },
      { label: "Folio Billing", labelAr: "فوترة النزلاء", icon: Receipt, path: "/app/verticals/hotel/folio-billing" },
    ],
  },
  {
    title: "REAL_ESTATE",
    titleAr: "العقارات",
    items: [
      { label: "Properties", labelAr: "العقارات والوحدات", icon: Home, path: "/app/verticals/real-estate/properties" },
      { label: "Lease Contracts", labelAr: "عقود الإيجار", icon: FileText, path: "/app/verticals/real-estate/leases" },
      { label: "Rent Invoicing", labelAr: "فواتير الإيجار", icon: Receipt, path: "/app/verticals/real-estate/rent-invoicing" },
      { label: "Property Maintenance", labelAr: "صيانة العقارات", icon: Wrench, path: "/app/verticals/real-estate/maintenance" },
      { label: "Broker Commissions", labelAr: "عمولات السعاة", icon: CreditCard, path: "/app/verticals/real-estate/commissions" },
    ],
  },
  {
    title: "TRANSPORT",
    titleAr: "النقل واللوجستيات",
    items: [
      { label: "Fleet Management", labelAr: "إدارة الأسطول", icon: Truck, path: "/app/verticals/transport/fleet" },
      { label: "Routes & Schedules", labelAr: "المسارات والجداول", icon: Compass, path: "/app/verticals/transport/routes" },
      { label: "Drivers Log", labelAr: "سجلات السائقين", icon: Users, path: "/app/verticals/transport/drivers" },
      { label: "Vehicle Maintenance", labelAr: "صيانة المركبات", icon: Wrench, path: "/app/verticals/transport/maintenance" },
      { label: "Shipments & Waybills", labelAr: "الشحنات وبوليصات النقل", icon: Package, path: "/app/verticals/transport/shipments" },
    ],
  },
  {
    title: "TRAVEL",
    titleAr: "السياحة والسفر",
    items: [
      { label: "Travel Bookings", labelAr: "حجوزات السفر", icon: Compass, path: "/app/verticals/travel/bookings" },
      { label: "Travel Suppliers", labelAr: "موردي الخدمات", icon: Building2, path: "/app/verticals/travel/suppliers" },
      { label: "Tour Itineraries", labelAr: "برامج الرحلات", icon: Plane, path: "/app/verticals/travel/itineraries" },
      { label: "Settlements & Rec", labelAr: "تسوية الحسابات", icon: Receipt, path: "/app/verticals/travel/reconciliation" },
    ],
  },
  {
    title: "AVIATION",
    titleAr: "الطيران",
    items: [
      { label: "Flights Schedule", labelAr: "جدول الرحلات", icon: Plane, path: "/app/verticals/aviation/flights" },
      { label: "Crew Roster", labelAr: "طاقم الطائرة", icon: Users, path: "/app/verticals/aviation/crew" },
      { label: "Aircraft Maintenance", labelAr: "صيانة الطائرات", icon: Wrench, path: "/app/verticals/aviation/maintenance" },
      { label: "Aircraft Parts", labelAr: "قطع الغيار", icon: Package, path: "/app/verticals/aviation/parts" },
    ],
  },
  {
    title: "RESTAURANT",
    titleAr: "المطعم",
    items: [
      { label: "Restaurant POS", labelAr: "نقطة بيع المطعم", icon: UtensilsCrossed, path: "/app/pos/restaurant" },
      { label: "Menu Management", labelAr: "إدارة القائمة", icon: FileText, path: "/app/verticals/restaurant/menu" },
      { label: "Tables Floor", labelAr: "خريطة الطاولات", icon: Grid, path: "/app/verticals/restaurant/tables" },
      { label: "Kitchen KDS", labelAr: "شاشة المطبخ KDS", icon: ClipboardList, path: "/app/verticals/restaurant/kitchen" },
      { label: "Delivery Orders", labelAr: "طلبات التوصيل", icon: Truck, path: "/app/verticals/restaurant/delivery" },
    ],
  },
  {
    title: "HOSTEL",
    titleAr: "السكن",
    items: [
      { label: "Hostel Rooms", labelAr: "غرف السكن", icon: Hotel, path: "/app/verticals/hostel/rooms" },
      { label: "Hostel Bookings", labelAr: "حجوزات السكن", icon: CalendarCheck, path: "/app/verticals/hostel/bookings" },
      { label: "Rent Invoicing", labelAr: "فواتير الإيجار", icon: Receipt, path: "/app/verticals/hostel/rent-invoicing" },
      { label: "Housekeeping", labelAr: "خدمة التنظيف", icon: Wrench, path: "/app/verticals/hostel/housekeeping" },
    ],
  },
  {
    title: "PHARMACY",
    titleAr: "الصيدلية",
    items: [
      { label: "Pharmacy POS", labelAr: "نقطة بيع الصيدلية", icon: Store, path: "/app/pos/pharmacy" },
      { label: "Prescriptions", labelAr: "الوصفات الطبية", icon: ClipboardList, path: "/app/verticals/pharmacy/prescriptions" },
      { label: "Medication Stock", labelAr: "مخزون الأدوية", icon: Package, path: "/app/verticals/pharmacy/stock" },
      { label: "Supplier Orders", labelAr: "طلبات الموردين", icon: ShoppingBag, path: "/app/verticals/pharmacy/suppliers" },
      { label: "Near Expiry Alerts", labelAr: "تنبيهات انتهاء الصلاحية", icon: FileWarning, path: "/app/verticals/pharmacy/expiry" },
    ],
  },
  {
    title: "LAUNDRY",
    titleAr: "المغسلة",
    items: [
      { label: "Laundry Dashboard", labelAr: "لوحة المغسلة", icon: Shirt, path: "/app/verticals/laundry" },
      { label: "Orders", labelAr: "الطلبات", icon: ClipboardList, path: "/app/verticals/laundry/orders" },
      { label: "Delivery", labelAr: "التوصيل", icon: Truck, path: "/app/verticals/laundry/delivery" },
    ],
  },
  {
    title: "SALON",
    titleAr: "الصالون",
    items: [
      { label: "Salon Dashboard", labelAr: "لوحة الصالون", icon: Scissors, path: "/app/verticals/salon" },
      { label: "Appointments", labelAr: "المواعيد", icon: CalendarCheck, path: "/app/verticals/salon/appointments" },
      { label: "Staff & Commissions", labelAr: "الموظفين والعمولات", icon: Users, path: "/app/verticals/salon/staff" },
      { label: "Packages & Memberships", labelAr: "الباقات والعضويات", icon: CreditCard, path: "/app/verticals/salon/packages" },
    ],
  },
  {
    title: "GYM",
    titleAr: "النادي الرياضي",
    items: [
      { label: "Gym Dashboard", labelAr: "لوحة النادي", icon: Dumbbell, path: "/app/verticals/gym" },
      { label: "Memberships", labelAr: "العضويات", icon: CreditCard, path: "/app/verticals/gym/memberships" },
      { label: "Check-ins", labelAr: "تسجيل الدخول", icon: ClipboardList, path: "/app/verticals/gym/checkins" },
      { label: "Trainers & Classes", labelAr: "المدربون والحصص", icon: Users, path: "/app/verticals/gym/classes" },
    ],
  },
  {
    title: "ECOMMERCE",
    titleAr: "التجارة الإلكترونية",
    items: [
      { label: "Ecommerce Dashboard", labelAr: "لوحة التجارة الإلكترونية", icon: Globe, path: "/app/verticals/ecommerce" },
      { label: "Orders", labelAr: "الطلبات", icon: ShoppingCart, path: "/app/verticals/ecommerce/orders" },
      { label: "Channel Sync", labelAr: "مزامنة القنوات", icon: Workflow, path: "/app/verticals/ecommerce/sync" },
      { label: "Courier Bookings", labelAr: "حجوزات الشحن", icon: Truck, path: "/app/verticals/ecommerce/courier" },
    ],
  },
  {
    title: "PLATFORM",
    titleAr: "المنصة",
    items: [
      { label: "Growth Engine", labelAr: "محرك النمو", icon: Rocket, path: "/app/platform/growth-engine" },
      { label: "Solution Library", labelAr: "مكتبة الحلول", icon: Workflow, path: "/app/platform/solutions" },
    ],
  },
  {
    title: "SYSTEM",
    titleAr: "النظام",
    items: [
      { label: "Reports", labelAr: "التقارير", icon: BarChart3, path: "/app/reports" },
      { label: "Financial Statements", labelAr: "القوائم المالية", icon: Receipt, path: "/app/reports/financial" },
      { label: "ZATCA Dashboard", labelAr: "لوحة الزكاة والضريبة", icon: ShieldCheck, path: "/app/reports/zatca-dashboard" },
      { label: "ZATCA Status", labelAr: "حالة الفوترة", icon: ShieldCheck, path: "/app/reports/zatca-status" },
      { label: "Sync Status", labelAr: "حالة المزامنة", icon: Workflow, path: "/app/sync/queue" },
      { label: "Master Control", labelAr: "التحكم الرئيسي", icon: ShieldCheck, path: "/app/admin/master-control" },
      { label: "Company Profile", labelAr: "ملف الشركة", icon: Palette, path: "/app/settings/company-profile" },
      { label: "Branches", labelAr: "الفروع", icon: Building2, path: "/app/branches" },
      { label: "Settings", labelAr: "الإعدادات", icon: Settings, path: "/app/settings" },
      { label: "Company Legal Info", labelAr: "بيانات الشركة القانونية", icon: Building2, path: "/app/settings/company-legal-information" },
      { label: "ZATCA Integration", labelAr: "ربط هيئة الزكاة", icon: ShieldCheck, path: "/app/settings/zatca-integration" },
    ],
  },
];

const adminMenuItems = [
  { label: "Super Admin Dashboard", labelAr: "لوحة المشرف العام", icon: ShieldCheck, path: "/app/admin/super-dashboard", roles: ["super_admin"] },
  { label: "Platform Master Control", labelAr: "التحكم الكامل للمنصة", icon: ShieldCheck, path: "/app/admin/super-master-control", roles: ["super_admin"] },
  { label: "Companies", labelAr: "الشركات", icon: Building2, path: "/app/admin/super-companies", roles: ["super_admin"] },
  { label: "Compliance Center", labelAr: "مركز الامتثال", icon: FileWarning, path: "/app/admin/super-compliance", roles: ["super_admin"] },
  { label: "Plans", labelAr: "الخطط", icon: CreditCard, path: "/app/admin/super-plans", roles: ["super_admin"] },
  { label: "Reseller Management", labelAr: "إدارة الموزعين", icon: Users, path: "/app/admin/super-resellers", roles: ["super_admin"] },
  { label: "SMTP Settings", labelAr: "إعدادات البريد", icon: Settings, path: "/app/admin/super-smtp", roles: ["super_admin"] },
  { label: "Email Templates", labelAr: "قوالب البريد", icon: FileText, path: "/app/admin/super-email-templates", roles: ["super_admin"] },
  { label: "License Approval", labelAr: "الموافقة على الترخيص", icon: ShieldCheck, path: "/app/admin/license-approval", roles: ["admin", "super_admin"] },
  { label: "My License Keys", labelAr: "مفاتيح الترخيص", icon: Key, path: "/app/admin/reseller-keys", roles: ["reseller"] },
  { label: "Invoice Settings", labelAr: "إعدادات الفاتورة", icon: Palette, path: "/app/admin/invoice-settings", roles: ["user_admin", "admin", "super_admin"] },
];

const countryThemes: Record<string, { shell: string; badge: string; tax: string; product: string }> = {
  SA: { shell: "from-emerald-950 via-green-900 to-emerald-900", badge: "border-emerald-300/40 bg-emerald-400/15 text-emerald-50", tax: "Saudi VAT / ZATCA", product: "نسخة السعودية" },
  PK: { shell: "from-green-950 via-emerald-900 to-lime-900", badge: "border-lime-300/40 bg-lime-400/15 text-lime-50", tax: "Pakistan Sales Tax / FBR", product: "Pakistan Edition" },
  AE: { shell: "from-slate-950 via-emerald-900 to-red-950", badge: "border-red-200/40 bg-white/15 text-white", tax: "UAE VAT / FTA", product: "UAE Edition" },
  US: { shell: "from-blue-950 via-slate-900 to-emerald-900", badge: "border-blue-300/40 bg-blue-400/15 text-blue-50", tax: "US Sales Tax", product: "US Edition" },
};

const SidebarContent = memo(function SidebarContent({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const location = useLocation();
  const { language, setLang, dir } = useLanguage();
  const { user } = useAuth();
  const rtl = language === "ar";
  const { data: companySettings } = trpc.settings.companySettingsGet.useQuery();
  const [searchQuery, setSearchQuery] = useState("");

  const userAdminItems = adminMenuItems.filter(item => item.roles.includes(user?.role || ""));

  const isSuperAdmin = user?.role === "super_admin";
  const storedCategory = getStoredCategory();
  const visibleGroups = isSuperAdmin
    ? categoryGroupVisibility.all
    : (getVisibleGroupTitles(storedCategory) || categoryGroupVisibility[storedCategory] || categoryGroupVisibility.all);
  const enabledPathPrefixes = isSuperAdmin ? null : getEnabledSidebarPathPrefixes(storedCategory);
  const isItemEnabled = (path: string) => {
    if (!enabledPathPrefixes) return true;
    return enabledPathPrefixes.some((prefix) => path === prefix || (prefix !== "/app" && path.startsWith(`${prefix}/`)));
  };

  const displayName = companySettings?.companyName || "YASCO ERP";
  const displayAr = companySettings?.companyNameAr;
  const logo = companySettings?.logo;
  const initials = displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  // Filter menu items by search query
  const filteredGroups = menuGroups
    .filter(g => visibleGroups.includes(g.title))
    .map((group) => ({ ...group, items: group.items.filter((item) => isItemEnabled(item.path)) }))
    .filter((group) => group.items.length > 0);
  const allItems = filteredGroups.flatMap(g => g.items.map(item => ({ ...item, group: rtl ? g.titleAr : g.title })));
  const filteredItems = searchQuery.trim()
    ? allItems.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.labelAr.includes(searchQuery)
      )
    : null;

  return (
    <div dir={dir} className="flex h-full min-h-0 flex-col bg-slate-900 text-white">
      {/* Logo */}
      <div className={cn("flex items-center gap-3 p-4 border-b border-slate-700", collapsed && "justify-center p-3")}>
        {logo ? (
          <img src={logo} alt={displayName} className="w-8 h-8 rounded-lg object-contain bg-white" />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-sm">{initials}</div>
        )}
        {!collapsed && (
          <div className="min-w-0">
            <span className="block font-bold text-lg tracking-tight leading-5 truncate">{displayName}</span>
            {displayAr && <span className="block text-[11px] text-slate-400 truncate" dir="rtl">{displayAr}</span>}
            {!displayAr && <span className="text-[11px] text-slate-400">Enterprise ERP</span>}
          </div>
        )}
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-3 py-2 border-b border-slate-800">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={rtl ? "ابحث في القائمة..." : "Search menu..."}
              className="w-full bg-slate-800 text-slate-200 text-xs pl-8 pr-3 py-2 rounded-lg outline-none placeholder:text-slate-500 focus:ring-1 focus:ring-emerald-500"
              aria-label="Search menu items"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>
      )}

      <nav
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-2 pr-1 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700"
        aria-label={rtl ? "قائمة النظام" : "ERP navigation"}
      >
        {/* Search results */}
        {filteredItems ? (
          <div className="mb-3">
            {filteredItems.length === 0 ? (
              <p className="px-4 py-3 text-xs text-slate-400">{rtl ? "لا توجد نتائج" : "No results found"}</p>
            ) : (
              filteredItems.map((item) => {
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => { setSearchQuery(""); onNavigate?.(); }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-slate-800",
                      isActive && "bg-emerald-600/20 text-emerald-400",
                      isActive && (rtl ? "border-l-2 border-emerald-500" : "border-r-2 border-emerald-500"),
                      !isActive && "text-slate-300",
                    )}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <div className="min-w-0">
                      <span className="truncate block">{rtl ? item.labelAr : item.label}</span>
                      <span className="text-[10px] text-slate-500">{item.group}</span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        ) : (
          filteredGroups.map((group) => (
            <div key={group.title} className="mb-3">
              {!collapsed && (
                <div className="px-4 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {rtl ? group.titleAr : group.title}
                </div>
              )}
              {group.items.map((item) => {
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onNavigate}
                    title={collapsed ? (rtl ? item.labelAr : item.label) : undefined}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-slate-800",
                      isActive && "bg-emerald-600/20 text-emerald-400",
                      isActive && (rtl ? "border-l-2 border-emerald-500" : "border-r-2 border-emerald-500"),
                      !isActive && "text-slate-300",
                      collapsed && "justify-center px-3"
                    )}
                  >
                    <item.icon className={cn("shrink-0", collapsed ? "w-5 h-5" : "w-4 h-4")} />
                    {!collapsed && <span className="truncate">{rtl ? item.labelAr : item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))
        )}

        {userAdminItems.length > 0 && !filteredItems && (
          <div className="mb-3">
            {!collapsed && (
              <div className="px-4 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {rtl ? "الإدارة" : "ADMIN"}
              </div>
            )}
            {userAdminItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onNavigate}
                  title={collapsed ? (rtl ? item.labelAr : item.label) : undefined}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-slate-800",
                    isActive && "bg-emerald-600/20 text-emerald-400",
                    isActive && (rtl ? "border-l-2 border-emerald-500" : "border-r-2 border-emerald-500"),
                    !isActive && "text-slate-300",
                    collapsed && "justify-center px-3"
                  )}
                >
                  <item.icon className={cn("shrink-0", collapsed ? "w-5 h-5" : "w-4 h-4")} />
                  {!collapsed && <span className="truncate">{rtl ? item.labelAr : item.label}</span>}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* Bottom Actions */}
      <div className={cn("border-t border-slate-700 p-3", collapsed && "p-2")}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLang(language === "en" ? "ar" : "en")}
          className={cn(
            "w-full text-slate-300 hover:text-white hover:bg-slate-800",
            collapsed ? "justify-center px-0" : "justify-start gap-2"
          )}
        >
          <Languages className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{language === "en" ? "العربية" : "English"}</span>}
        </Button>
      </div>
    </div>
  );
});

// User Profile Dropdown Component
function UserProfileDropdown({ user, logout, rtl }: { user: { name?: string; role?: string } | null; logout: () => void; rtl: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = (user?.name || "U").slice(0, 2).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full hover:bg-white/10 transition-colors p-1 pr-2"
        aria-label="User menu"
        aria-expanded={open}
      >
        <div className="w-7 h-7 rounded-full bg-emerald-600 border border-white/20 flex items-center justify-center text-white text-xs font-medium">
          {initials}
        </div>
        <span className="text-xs text-white hidden xl:block max-w-20 truncate">{user?.name || ""}</span>
        <ChevronDown className="size-3 text-white/70 hidden xl:block" />
      </button>

      {open && (
        <div className={cn(
          "absolute top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50",
          rtl ? "left-0" : "right-0"
        )}>
          {/* User info */}
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-800 truncate">{user?.name || "User"}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role || "user"}</p>
          </div>

          <Link
            to="/app/settings/company-profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Building2 className="size-4 text-slate-400" />
            {rtl ? "ملف الشركة" : "Company Profile"}
          </Link>
          <Link
            to="/app/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Settings className="size-4 text-slate-400" />
            {rtl ? "الإعدادات" : "Settings"}
          </Link>
          <Link
            to="/app/setup-wizard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Sparkles className="size-4 text-slate-400" />
            {rtl ? "معالج الإعداد" : "Setup Wizard"}
          </Link>

          <div className="border-t border-slate-100 mt-1 pt-1">
            <button
              onClick={() => { setOpen(false); logout(); }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-start"
            >
              <LogOut className="size-4" />
              {rtl ? "تسجيل الخروج" : "Sign out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isLoading } = useAuth({ redirectOnUnauthenticated: true });
  const { language, dir } = useLanguage();
  const countryDetection = useCountryDetection();
  const rtl = language === "ar";
  const theme = countryThemes[countryDetection.selectedCountry] ?? countryThemes.US;

  // Breadcrumb: find active item label
  const allNavItems = menuGroups.flatMap(g => g.items);
  const activeItem = allNavItems.find(i => location.pathname === i.path || location.pathname.startsWith(i.path + "/"));

  if (isLoading && !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <img src="/logo-40.png" alt="YASCO" className="w-10 h-10 rounded-lg object-contain mx-auto" />
          <p className="text-sm text-slate-500">Checking secure session...</p>
        </div>
      </div>
    );
  }

  return (
    <div dir={dir} className="flex h-dvh overflow-hidden bg-slate-50">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden h-dvh lg:block transition-all duration-300 shrink-0 overflow-y-auto",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarContent collapsed={collapsed} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className={cn("absolute top-3 z-50", rtl ? "right-3" : "left-3")}>
            <Menu className="w-5 h-5 text-white" />
          </Button>
        </SheetTrigger>
        <SheetContent side={rtl ? "right" : "left"} className="h-dvh p-0 w-64">
          <SidebarContent collapsed={false} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className={cn("min-h-16 bg-gradient-to-r text-white shadow-md flex flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6 shrink-0", theme.shell)}>
          <div className={cn("flex items-center gap-3 min-w-0", rtl ? "lg:mr-0 mr-10" : "lg:ml-0 ml-10")}>
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex hover:bg-white/10 text-white"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-white">
                {activeItem ? (rtl ? activeItem.labelAr : activeItem.label) : (rtl ? "لوحة التحكم" : "Dashboard")}
              </h1>
              <p className="hidden sm:block text-xs text-emerald-200 truncate">
                {rtl ? "نظام ERP عالمي ذكي" : "Global Smart ERP"}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="order-3 w-full md:order-none md:w-[360px] lg:w-[460px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-emerald-100" />
              <Input
                aria-label="Search records and actions"
                className="h-10 rounded-full border-white/20 bg-white/10 text-white placeholder:text-emerald-100/70 pl-9 pr-20 focus-visible:ring-emerald-400"
                placeholder={rtl ? "ابحث في الفواتير والعملاء والمخزون..." : "Search invoices, customers, stock..."}
              />
              <div className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-full bg-white/20 px-2 py-1 text-[11px] text-white sm:flex">
                <Command className="size-3" /> K
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("hidden lg:inline-flex", theme.badge)}>
              {countryDetection.countryFlag}
              <span className="mx-1">{countryDetection.selectedCountry}</span>
              {theme.tax}
            </Badge>
            <Badge variant="outline" className="hidden border-emerald-400/30 bg-emerald-400/10 text-emerald-100 xl:inline-flex">
              <ShieldCheck className="size-3 mr-1" />
              {rtl ? `مرخص: ${theme.product}` : `Licensed: ${theme.product}`}
            </Badge>
            {/* Language Toggle Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLang(language === "en" ? "ar" : "en")}
              className="border-white/20 bg-white/10 hover:bg-white/20 text-white hover:text-white gap-1.5 px-2.5"
              aria-label={rtl ? "تغيير اللغة" : "Change language"}
            >
              <Globe className="size-4" />
              <span className="text-xs font-semibold">{language === "en" ? "AR" : "EN"}</span>
            </Button>

            <Button variant="ghost" size="icon" aria-label="Notifications" className="relative hover:bg-white/10 text-white">
              <Bell className="size-4" />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-rose-500" />
            </Button>
            <SyncStatusBar />

            {/* User Profile Dropdown */}
            <UserProfileDropdown user={user} logout={logout} rtl={rtl} />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>

      <ChatBubble />
    </div>
  );
}
