// ============================================================================
// VERTICAL WORKSPACES — Config-driven premium operations workspaces
// Saudi-market verticals that previously had catalog entries but no screens.
// One premium engine (VerticalWorkspacePage) renders all of these.
// RULE: This file only ADDS verticals. Existing vertical pages stay untouched.
// ============================================================================

export interface WorkspaceStage {
  id: string;
  label: string;
  labelAr: string;
  color: string; // tailwind badge classes
}

export interface WorkspaceField {
  key: string;
  label: string;
  labelAr: string;
  type: "text" | "number" | "select" | "date";
  options?: string[];
  placeholder?: string;
}

export interface WorkspaceRecord {
  id: string;
  title: string;
  customer: string;
  phone: string;
  amount: number;
  stage: string;
  date: string;
  data: Record<string, string | number>;
}

export interface QuickLink {
  label: string;
  labelAr: string;
  path: string;
  icon: string;
}

export interface VerticalWorkspace {
  id: string;
  moduleId: string;
  nameEn: string;
  nameAr: string;
  taglineEn: string;
  taglineAr: string;
  icon: string; // lucide icon name
  gradient: string; // header gradient classes
  accent: string; // accent text color
  recordNounEn: string;
  recordNounAr: string;
  stages: WorkspaceStage[];
  fields: WorkspaceField[];
  quickLinks: QuickLink[];
  seeds: WorkspaceRecord[];
}

// Shared stage colors
const C = {
  slate: "bg-slate-100 text-slate-700 border-slate-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  amber: "bg-amber-100 text-amber-700 border-amber-200",
  violet: "bg-violet-100 text-violet-700 border-violet-200",
  emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rose: "bg-rose-100 text-rose-700 border-rose-200",
  cyan: "bg-cyan-100 text-cyan-700 border-cyan-200",
};

const linkSales: QuickLink = { label: "Invoices", labelAr: "الفواتير", path: "/app/sales/invoices", icon: "Receipt" };
const linkCrm: QuickLink = { label: "Customers", labelAr: "العملاء", path: "/app/crm", icon: "Users" };
const linkInventory: QuickLink = { label: "Inventory", labelAr: "المخزون", path: "/app/inventory/products", icon: "Package" };
const linkPurchase: QuickLink = { label: "Purchases", labelAr: "المشتريات", path: "/app/purchase", icon: "ShoppingBag" };
const linkReports: QuickLink = { label: "Reports", labelAr: "التقارير", path: "/app/reports", icon: "BarChart3" };
const linkProjects: QuickLink = { label: "Projects", labelAr: "المشاريع", path: "/app/projects/list", icon: "FolderKanban" };
const linkAssets: QuickLink = { label: "Assets", labelAr: "الأصول", path: "/app/assets", icon: "Package2" };
const linkPos: QuickLink = { label: "POS", labelAr: "نقطة البيع", path: "/app/pos", icon: "Store" };

export const VERTICAL_WORKSPACES: VerticalWorkspace[] = [
  // --------------------------------------------------------------------------
  {
    id: "fieldservice",
    moduleId: "fieldservice",
    nameEn: "Facility Management & AMC",
    nameAr: "إدارة المرافق وعقود الصيانة",
    taglineEn: "AMC contracts, preventive visits, work orders, SLA and technician dispatch",
    taglineAr: "عقود صيانة سنوية، زيارات وقائية، أوامر عمل، اتفاقيات مستوى الخدمة وإرسال الفنيين",
    icon: "Wrench",
    gradient: "from-sky-600 via-blue-600 to-indigo-700",
    accent: "text-sky-600",
    recordNounEn: "Work Order",
    recordNounAr: "أمر عمل",
    stages: [
      { id: "new", label: "New Request", labelAr: "طلب جديد", color: C.slate },
      { id: "scheduled", label: "Scheduled", labelAr: "مجدول", color: C.blue },
      { id: "dispatched", label: "Dispatched", labelAr: "تم الإرسال", color: C.amber },
      { id: "in_progress", label: "In Progress", labelAr: "قيد التنفيذ", color: C.violet },
      { id: "completed", label: "Completed", labelAr: "مكتمل", color: C.emerald },
      { id: "invoiced", label: "Invoiced", labelAr: "مفوتر", color: C.cyan },
    ],
    fields: [
      { key: "site", label: "Site / Location", labelAr: "الموقع", type: "text", placeholder: "Riyadh - Olaya Tower" },
      { key: "serviceType", label: "Service Type", labelAr: "نوع الخدمة", type: "select", options: ["AC Maintenance", "Electrical", "Plumbing", "Elevator", "Fire System", "Pest Control", "Cleaning", "Security"] },
      { key: "technician", label: "Technician", labelAr: "الفني", type: "text" },
      { key: "priority", label: "Priority", labelAr: "الأولوية", type: "select", options: ["Low", "Medium", "High", "Emergency"] },
      { key: "slaHours", label: "SLA (hours)", labelAr: "مدة الاستجابة (ساعة)", type: "number" },
    ],
    quickLinks: [linkSales, linkCrm, linkInventory, linkReports],
    seeds: [
      { id: "WO-1001", title: "AC quarterly service — Olaya Tower", customer: "Al-Rajhi Facilities", phone: "+966 50 123 4001", amount: 4500, stage: "scheduled", date: "2026-07-08", data: { site: "Riyadh - Olaya", serviceType: "AC Maintenance", technician: "Imran K.", priority: "Medium", slaHours: 48 } },
      { id: "WO-1002", title: "Elevator breakdown — Building 7", customer: "Dar Al-Majed Compound", phone: "+966 55 900 7702", amount: 2800, stage: "dispatched", date: "2026-07-08", data: { site: "Riyadh - Nakheel", serviceType: "Elevator", technician: "Faisal A.", priority: "Emergency", slaHours: 4 } },
      { id: "WO-1003", title: "Pest control monthly visit", customer: "Nadec Restaurant Group", phone: "+966 53 400 1188", amount: 950, stage: "completed", date: "2026-07-07", data: { site: "Jeddah - Rawdah", serviceType: "Pest Control", technician: "Yousef M.", priority: "Low", slaHours: 72 } },
    ],
  },
  // --------------------------------------------------------------------------
  {
    id: "events",
    moduleId: "events",
    nameEn: "Events & Entertainment",
    nameAr: "الفعاليات والترفيه",
    taglineEn: "Wedding halls, exhibitions, ticketed events, packages, deposits and settlements",
    taglineAr: "قاعات أفراح، معارض، فعاليات بتذاكر، باقات، عربون وتسويات",
    icon: "PartyPopper",
    gradient: "from-fuchsia-600 via-purple-600 to-indigo-700",
    accent: "text-fuchsia-600",
    recordNounEn: "Event Booking",
    recordNounAr: "حجز فعالية",
    stages: [
      { id: "enquiry", label: "Enquiry", labelAr: "استفسار", color: C.slate },
      { id: "quoted", label: "Quoted", labelAr: "عرض سعر", color: C.blue },
      { id: "deposit", label: "Deposit Paid", labelAr: "دفع العربون", color: C.amber },
      { id: "confirmed", label: "Confirmed", labelAr: "مؤكد", color: C.violet },
      { id: "delivered", label: "Event Done", labelAr: "تمت الفعالية", color: C.emerald },
      { id: "settled", label: "Settled", labelAr: "تمت التسوية", color: C.cyan },
    ],
    fields: [
      { key: "venue", label: "Venue / Hall", labelAr: "القاعة / المكان", type: "text" },
      { key: "eventType", label: "Event Type", labelAr: "نوع الفعالية", type: "select", options: ["Wedding", "Corporate", "Exhibition", "Concert", "Private Party", "Graduation"] },
      { key: "guests", label: "Guest Count", labelAr: "عدد الضيوف", type: "number" },
      { key: "eventDate", label: "Event Date", labelAr: "تاريخ الفعالية", type: "date" },
      { key: "package", label: "Package", labelAr: "الباقة", type: "select", options: ["Silver", "Gold", "Platinum", "Custom"] },
    ],
    quickLinks: [linkSales, linkCrm, linkInventory, linkReports],
    seeds: [
      { id: "EV-2001", title: "Al-Otaibi Wedding — Grand Hall", customer: "Khalid Al-Otaibi", phone: "+966 50 222 9931", amount: 85000, stage: "deposit", date: "2026-07-05", data: { venue: "Grand Hall A", eventType: "Wedding", guests: 450, eventDate: "2026-08-14", package: "Platinum" } },
      { id: "EV-2002", title: "Tech Expo booth build", customer: "Riyadh Chamber", phone: "+966 55 700 4410", amount: 32000, stage: "quoted", date: "2026-07-06", data: { venue: "RICEC", eventType: "Exhibition", guests: 0, eventDate: "2026-09-02", package: "Custom" } },
      { id: "EV-2003", title: "Graduation ceremony package", customer: "Manarat Schools", phone: "+966 53 811 6720", amount: 18500, stage: "settled", date: "2026-06-20", data: { venue: "Crystal Ballroom", eventType: "Graduation", guests: 300, eventDate: "2026-06-25", package: "Gold" } },
    ],
  },
  // --------------------------------------------------------------------------
  {
    id: "agency",
    moduleId: "agency",
    nameEn: "Digital Marketing & Media",
    nameAr: "التسويق الرقمي والإعلام",
    taglineEn: "Campaigns, retainers, creative approvals, influencers and ad-spend billing",
    taglineAr: "حملات، عقود شهرية، اعتماد التصاميم، مؤثرين وفوترة الإنفاق الإعلاني",
    icon: "Megaphone",
    gradient: "from-rose-600 via-pink-600 to-fuchsia-700",
    accent: "text-rose-600",
    recordNounEn: "Campaign",
    recordNounAr: "حملة",
    stages: [
      { id: "brief", label: "Brief", labelAr: "موجز", color: C.slate },
      { id: "proposal", label: "Proposal", labelAr: "عرض", color: C.blue },
      { id: "production", label: "In Production", labelAr: "قيد الإنتاج", color: C.amber },
      { id: "approval", label: "Client Approval", labelAr: "اعتماد العميل", color: C.violet },
      { id: "live", label: "Live", labelAr: "منشورة", color: C.emerald },
      { id: "billed", label: "Billed", labelAr: "مفوترة", color: C.cyan },
    ],
    fields: [
      { key: "channel", label: "Channel", labelAr: "القناة", type: "select", options: ["TikTok", "Snapchat", "Instagram", "X", "Google Ads", "YouTube", "Multi-channel"] },
      { key: "campaignType", label: "Type", labelAr: "النوع", type: "select", options: ["Social Media Mgmt", "Paid Ads", "SEO", "Branding", "Influencer", "Video Production", "PR"] },
      { key: "budget", label: "Ad Budget (SAR)", labelAr: "ميزانية الإعلانات", type: "number" },
      { key: "retainer", label: "Retainer?", labelAr: "عقد شهري؟", type: "select", options: ["Yes", "No"] },
    ],
    quickLinks: [linkCrm, linkProjects, linkSales, linkReports],
    seeds: [
      { id: "CMP-3001", title: "Ramadan TikTok campaign", customer: "Sadeem Perfumes", phone: "+966 54 100 2299", amount: 24000, stage: "production", date: "2026-07-01", data: { channel: "TikTok", campaignType: "Paid Ads", budget: 15000, retainer: "No" } },
      { id: "CMP-3002", title: "Monthly social retainer", customer: "Bait Al-Shawarma", phone: "+966 50 933 7815", amount: 8500, stage: "live", date: "2026-07-01", data: { channel: "Multi-channel", campaignType: "Social Media Mgmt", budget: 3000, retainer: "Yes" } },
      { id: "CMP-3003", title: "Brand identity redesign", customer: "Nakhla Dates Co.", phone: "+966 55 641 0038", amount: 19000, stage: "approval", date: "2026-06-28", data: { channel: "Multi-channel", campaignType: "Branding", budget: 0, retainer: "No" } },
    ],
  },
  // --------------------------------------------------------------------------
  {
    id: "professional",
    moduleId: "professional",
    nameEn: "Professional Services & Consulting",
    nameAr: "الخدمات المهنية والاستشارات",
    taglineEn: "Matters, engagements, deadlines, timesheets and retainer billing",
    taglineAr: "قضايا، ارتباطات، مواعيد نهائية، سجلات وقت وفوترة أتعاب",
    icon: "Scale",
    gradient: "from-slate-700 via-gray-700 to-zinc-800",
    accent: "text-slate-700",
    recordNounEn: "Matter / Engagement",
    recordNounAr: "قضية / ارتباط",
    stages: [
      { id: "intake", label: "Intake", labelAr: "استقبال", color: C.slate },
      { id: "engaged", label: "Engagement Signed", labelAr: "توقيع الاتفاقية", color: C.blue },
      { id: "active", label: "Active Work", labelAr: "عمل جارٍ", color: C.amber },
      { id: "review", label: "Review", labelAr: "مراجعة", color: C.violet },
      { id: "billed", label: "Billed", labelAr: "مفوترة", color: C.cyan },
      { id: "closed", label: "Closed", labelAr: "مغلقة", color: C.emerald },
    ],
    fields: [
      { key: "practice", label: "Practice Area", labelAr: "مجال الممارسة", type: "select", options: ["Legal", "Accounting / VAT", "Business Setup", "HR / Recruitment", "Management Consulting", "Engineering", "Translation"] },
      { key: "leadPartner", label: "Lead Partner", labelAr: "الشريك المسؤول", type: "text" },
      { key: "deadline", label: "Next Deadline", labelAr: "الموعد النهائي", type: "date" },
      { key: "billingType", label: "Billing", labelAr: "نوع الفوترة", type: "select", options: ["Hourly", "Fixed Fee", "Retainer", "Milestone"] },
    ],
    quickLinks: [linkCrm, linkProjects, linkSales, { label: "Documents", labelAr: "المستندات", path: "/app/documents", icon: "FileText" }],
    seeds: [
      { id: "MTR-4001", title: "Commercial dispute — case 4471", customer: "Al-Fawzan Trading", phone: "+966 50 388 1290", amount: 45000, stage: "active", date: "2026-06-15", data: { practice: "Legal", leadPartner: "A. Al-Suhaibani", deadline: "2026-07-20", billingType: "Milestone" } },
      { id: "MTR-4002", title: "Quarterly VAT filing Q2", customer: "Zahra Cosmetics", phone: "+966 55 220 6647", amount: 3500, stage: "review", date: "2026-07-02", data: { practice: "Accounting / VAT", leadPartner: "M. Farooq", deadline: "2026-07-31", billingType: "Fixed Fee" } },
      { id: "MTR-4003", title: "Company formation — MISA license", customer: "TechBridge FZ", phone: "+966 53 991 8804", amount: 12000, stage: "engaged", date: "2026-07-06", data: { practice: "Business Setup", leadPartner: "S. Al-Dossari", deadline: "2026-08-10", billingType: "Fixed Fee" } },
    ],
  },
  // --------------------------------------------------------------------------
  {
    id: "agriculture",
    moduleId: "agriculture",
    nameEn: "Agriculture & Farms",
    nameAr: "الزراعة والمزارع",
    taglineEn: "Plots, crop cycles, livestock, harvest batches and farm-gate sales",
    taglineAr: "قطع زراعية، دورات محاصيل، مواشي، دفعات حصاد ومبيعات المزرعة",
    icon: "Sprout",
    gradient: "from-green-600 via-emerald-600 to-teal-700",
    accent: "text-green-600",
    recordNounEn: "Crop / Livestock Cycle",
    recordNounAr: "دورة محصول / مواشي",
    stages: [
      { id: "planned", label: "Planned", labelAr: "مخطط", color: C.slate },
      { id: "planted", label: "Planted / Started", labelAr: "مزروع / بدأ", color: C.blue },
      { id: "growing", label: "Growing", labelAr: "نمو", color: C.amber },
      { id: "harvest", label: "Harvest", labelAr: "حصاد", color: C.violet },
      { id: "stored", label: "In Cold Store", labelAr: "تخزين مبرد", color: C.cyan },
      { id: "sold", label: "Sold", labelAr: "مباع", color: C.emerald },
    ],
    fields: [
      { key: "plot", label: "Plot / Barn", labelAr: "القطعة / الحظيرة", type: "text" },
      { key: "cropType", label: "Crop / Animal", labelAr: "المحصول / الحيوان", type: "select", options: ["Dates (Sukkari)", "Dates (Khalas)", "Vegetables", "Fodder", "Poultry", "Dairy", "Sheep", "Camels"] },
      { key: "areaOrCount", label: "Area (ha) / Head Count", labelAr: "المساحة / العدد", type: "number" },
      { key: "expectedYield", label: "Expected Yield (kg)", labelAr: "الإنتاج المتوقع (كجم)", type: "number" },
    ],
    quickLinks: [linkInventory, linkSales, linkPurchase, linkAssets],
    seeds: [
      { id: "AGR-5001", title: "Sukkari dates — Block A", customer: "Farm-gate buyers", phone: "-", amount: 220000, stage: "growing", date: "2026-03-01", data: { plot: "Block A - Qassim", cropType: "Dates (Sukkari)", areaOrCount: 12, expectedYield: 48000 } },
      { id: "AGR-5002", title: "Broiler cycle #14", customer: "Al-Watania buyer", phone: "+966 55 002 8871", amount: 96000, stage: "planted", date: "2026-06-25", data: { plot: "Barn 3", cropType: "Poultry", areaOrCount: 12000, expectedYield: 26000 } },
      { id: "AGR-5003", title: "Khalas dates — cold store lot 22", customer: "Tamr Export Co.", phone: "+966 50 640 3395", amount: 145000, stage: "stored", date: "2026-06-10", data: { plot: "Block C - AlAhsa", cropType: "Dates (Khalas)", areaOrCount: 8, expectedYield: 30000 } },
    ],
  },
  // --------------------------------------------------------------------------
  {
    id: "energy",
    moduleId: "energy",
    nameEn: "Clean Energy & Solar",
    nameAr: "الطاقة النظيفة والطاقة الشمسية",
    taglineEn: "Site surveys, solar installs, commissioning, EV charging and AMC visits",
    taglineAr: "مسوحات مواقع، تركيب طاقة شمسية، تشغيل، شواحن كهربائية وعقود صيانة",
    icon: "SunMedium",
    gradient: "from-yellow-500 via-amber-500 to-orange-600",
    accent: "text-amber-600",
    recordNounEn: "Install Job",
    recordNounAr: "مشروع تركيب",
    stages: [
      { id: "survey", label: "Site Survey", labelAr: "مسح الموقع", color: C.slate },
      { id: "proposal", label: "Proposal", labelAr: "عرض فني", color: C.blue },
      { id: "contract", label: "Contract", labelAr: "عقد", color: C.violet },
      { id: "installing", label: "Installing", labelAr: "جاري التركيب", color: C.amber },
      { id: "commissioned", label: "Commissioned", labelAr: "تم التشغيل", color: C.emerald },
      { id: "amc", label: "Under AMC", labelAr: "تحت عقد صيانة", color: C.cyan },
    ],
    fields: [
      { key: "systemType", label: "System", labelAr: "النظام", type: "select", options: ["Rooftop Solar", "Solar Farm", "EV Charger", "Water Treatment", "Energy Audit", "Generator Hybrid"] },
      { key: "capacity", label: "Capacity (kWp)", labelAr: "القدرة (ك.واط)", type: "number" },
      { key: "city", label: "City", labelAr: "المدينة", type: "text" },
      { key: "engineer", label: "Engineer", labelAr: "المهندس", type: "text" },
    ],
    quickLinks: [linkProjects, linkAssets, linkSales, linkPurchase],
    seeds: [
      { id: "ENR-6001", title: "Rooftop 80kWp — logistics warehouse", customer: "Hala Logistics", phone: "+966 55 118 0092", amount: 168000, stage: "installing", date: "2026-06-18", data: { systemType: "Rooftop Solar", capacity: 80, city: "Dammam", engineer: "Eng. Rami" } },
      { id: "ENR-6002", title: "EV charger x4 — mall parking", customer: "Nawras Mall", phone: "+966 50 774 5561", amount: 92000, stage: "proposal", date: "2026-07-03", data: { systemType: "EV Charger", capacity: 22, city: "Riyadh", engineer: "Eng. Sultan" } },
      { id: "ENR-6003", title: "Villa 12kWp net-billing", customer: "Dr. Al-Ghamdi", phone: "+966 54 300 2210", amount: 38500, stage: "commissioned", date: "2026-05-30", data: { systemType: "Rooftop Solar", capacity: 12, city: "Jeddah", engineer: "Eng. Rami" } },
    ],
  },
  // --------------------------------------------------------------------------
  {
    id: "mining",
    moduleId: "mining",
    nameEn: "Mining & Quarrying",
    nameAr: "التعدين والمحاجر",
    taglineEn: "Weighbridge tickets, stockpiles, truck dispatch and contract rates",
    taglineAr: "تذاكر الميزان، المخزونات، إرسال الشاحنات وأسعار العقود",
    icon: "Mountain",
    gradient: "from-stone-600 via-stone-700 to-neutral-800",
    accent: "text-stone-600",
    recordNounEn: "Weighbridge Ticket",
    recordNounAr: "تذكرة ميزان",
    stages: [
      { id: "order", label: "Order", labelAr: "طلب", color: C.slate },
      { id: "loading", label: "Loading", labelAr: "تحميل", color: C.amber },
      { id: "weighed", label: "Weighed", labelAr: "تم الوزن", color: C.blue },
      { id: "dispatched", label: "Dispatched", labelAr: "تم الإرسال", color: C.violet },
      { id: "delivered", label: "Delivered", labelAr: "تم التسليم", color: C.emerald },
      { id: "invoiced", label: "Invoiced", labelAr: "مفوتر", color: C.cyan },
    ],
    fields: [
      { key: "material", label: "Material", labelAr: "المادة", type: "select", options: ["Aggregate 3/4", "Aggregate 3/8", "Washed Sand", "Red Sand", "Road Base", "Marble Block", "Granite"] },
      { key: "truckPlate", label: "Truck Plate", labelAr: "لوحة الشاحنة", type: "text" },
      { key: "netWeight", label: "Net Weight (ton)", labelAr: "الوزن الصافي (طن)", type: "number" },
      { key: "site", label: "Delivery Site", labelAr: "موقع التسليم", type: "text" },
    ],
    quickLinks: [linkInventory, linkAssets, linkSales, linkReports],
    seeds: [
      { id: "WB-7001", title: "Aggregate 3/4 — 28t", customer: "Binladen Site 4", phone: "+966 55 481 2207", amount: 3640, stage: "weighed", date: "2026-07-08", data: { material: "Aggregate 3/4", truckPlate: "RSA 7213", netWeight: 28, site: "Riyadh Ring Rd" } },
      { id: "WB-7002", title: "Washed sand — 30t", customer: "Al-Yamama Concrete", phone: "+966 50 316 9954", amount: 2850, stage: "dispatched", date: "2026-07-08", data: { material: "Washed Sand", truckPlate: "RSA 5580", netWeight: 30, site: "Batching Plant 2" } },
      { id: "WB-7003", title: "Road base — monthly contract", customer: "Nesma Roads", phone: "+966 54 772 3318", amount: 41000, stage: "invoiced", date: "2026-06-30", data: { material: "Road Base", truckPlate: "Multiple", netWeight: 410, site: "Qiddiya access rd" } },
    ],
  },
  // --------------------------------------------------------------------------
  {
    id: "marine",
    moduleId: "marine",
    nameEn: "Marine, Ports & Shipping",
    nameAr: "الشحن البحري والموانئ",
    taglineEn: "Shipment files, containers, customs documents, demurrage and file P&L",
    taglineAr: "ملفات الشحن، الحاويات، مستندات الجمارك، غرامات التأخير وربحية الملف",
    icon: "Ship",
    gradient: "from-blue-700 via-indigo-700 to-blue-900",
    accent: "text-blue-700",
    recordNounEn: "Shipment File",
    recordNounAr: "ملف شحنة",
    stages: [
      { id: "opened", label: "File Opened", labelAr: "فتح الملف", color: C.slate },
      { id: "sailing", label: "On Water", labelAr: "في البحر", color: C.blue },
      { id: "at_port", label: "At Port", labelAr: "في الميناء", color: C.amber },
      { id: "clearing", label: "Customs Clearing", labelAr: "تخليص جمركي", color: C.violet },
      { id: "delivered", label: "Delivered", labelAr: "تم التسليم", color: C.emerald },
      { id: "closed", label: "File Closed", labelAr: "إغلاق الملف", color: C.cyan },
    ],
    fields: [
      { key: "blNumber", label: "B/L Number", labelAr: "رقم البوليصة", type: "text" },
      { key: "port", label: "Port", labelAr: "الميناء", type: "select", options: ["Jeddah Islamic Port", "King Abdulaziz Port Dammam", "King Abdullah Port", "NEOM Port", "Jubail"] },
      { key: "containers", label: "Containers", labelAr: "عدد الحاويات", type: "number" },
      { key: "eta", label: "ETA", labelAr: "تاريخ الوصول", type: "date" },
    ],
    quickLinks: [{ label: "Shipments", labelAr: "الشحنات", path: "/app/verticals/transport/shipments", icon: "Truck" }, linkPurchase, linkSales, linkReports],
    seeds: [
      { id: "SF-8001", title: "4x40HC electronics — Shanghai", customer: "Gulf Electronics", phone: "+966 50 227 8830", amount: 27500, stage: "at_port", date: "2026-07-04", data: { blNumber: "MSCUAB12345", port: "Jeddah Islamic Port", containers: 4, eta: "2026-07-03" } },
      { id: "SF-8002", title: "2x20GP food stuff — Mundra", customer: "Salem Foodstuff", phone: "+966 55 660 4142", amount: 9800, stage: "clearing", date: "2026-07-06", data: { blNumber: "MAEU556677", port: "King Abdulaziz Port Dammam", containers: 2, eta: "2026-07-05" } },
      { id: "SF-8003", title: "1x40 machinery — Hamburg", customer: "Petro Services", phone: "+966 53 118 2764", amount: 14200, stage: "sailing", date: "2026-07-01", data: { blNumber: "HLCU990011", port: "Jeddah Islamic Port", containers: 1, eta: "2026-07-22" } },
    ],
  },
  // --------------------------------------------------------------------------
  {
    id: "veterinary",
    moduleId: "veterinary",
    nameEn: "Veterinary & Pet Care",
    nameAr: "الطب البيطري ورعاية الحيوانات",
    taglineEn: "Pet profiles, appointments, vaccinations, grooming and boarding",
    taglineAr: "ملفات الحيوانات، مواعيد، تطعيمات، عناية وإيواء",
    icon: "PawPrint",
    gradient: "from-teal-600 via-emerald-600 to-green-700",
    accent: "text-teal-600",
    recordNounEn: "Visit / Booking",
    recordNounAr: "زيارة / حجز",
    stages: [
      { id: "booked", label: "Booked", labelAr: "محجوز", color: C.slate },
      { id: "checked_in", label: "Checked In", labelAr: "تم الاستقبال", color: C.blue },
      { id: "in_treatment", label: "In Treatment", labelAr: "قيد العلاج", color: C.amber },
      { id: "ready", label: "Ready for Pickup", labelAr: "جاهز للاستلام", color: C.violet },
      { id: "completed", label: "Completed", labelAr: "مكتمل", color: C.emerald },
    ],
    fields: [
      { key: "petName", label: "Pet Name", labelAr: "اسم الحيوان", type: "text" },
      { key: "species", label: "Species", labelAr: "النوع", type: "select", options: ["Cat", "Dog", "Bird", "Horse", "Camel", "Livestock", "Other"] },
      { key: "service", label: "Service", labelAr: "الخدمة", type: "select", options: ["Consultation", "Vaccination", "Surgery", "Grooming", "Boarding", "Farm Visit"] },
      { key: "vet", label: "Veterinarian", labelAr: "الطبيب البيطري", type: "text" },
    ],
    quickLinks: [linkCrm, { label: "Pharmacy POS", labelAr: "صيدلية", path: "/app/pos/pharmacy", icon: "Pill" }, linkSales, linkInventory],
    seeds: [
      { id: "VET-9001", title: "Persian cat — annual vaccines", customer: "Noura Al-Saleh", phone: "+966 54 210 9987", amount: 380, stage: "booked", date: "2026-07-09", data: { petName: "Luna", species: "Cat", service: "Vaccination", vet: "Dr. Hana" } },
      { id: "VET-9002", title: "Falcon checkup", customer: "Majed Al-Dossary", phone: "+966 50 993 1245", amount: 650, stage: "in_treatment", date: "2026-07-08", data: { petName: "Shaheen", species: "Bird", service: "Consultation", vet: "Dr. Omar" } },
      { id: "VET-9003", title: "Grooming + boarding 3 nights", customer: "Rania K.", phone: "+966 55 402 7768", amount: 720, stage: "ready", date: "2026-07-07", data: { petName: "Max", species: "Dog", service: "Boarding", vet: "-" } },
    ],
  },
  // --------------------------------------------------------------------------
  {
    id: "nonprofit",
    moduleId: "nonprofit",
    nameEn: "Nonprofit & Charity",
    nameAr: "القطاع غير الربحي والجمعيات الخيرية",
    taglineEn: "Donation campaigns, beneficiary cases, approvals and restricted funds",
    taglineAr: "حملات تبرع، حالات مستفيدين، اعتمادات وصناديق مقيدة",
    icon: "HeartHandshake",
    gradient: "from-emerald-600 via-teal-600 to-cyan-700",
    accent: "text-emerald-600",
    recordNounEn: "Aid Case / Campaign",
    recordNounAr: "حالة / حملة",
    stages: [
      { id: "submitted", label: "Submitted", labelAr: "مقدمة", color: C.slate },
      { id: "verification", label: "Verification", labelAr: "تحقق", color: C.blue },
      { id: "committee", label: "Committee Review", labelAr: "لجنة الاعتماد", color: C.amber },
      { id: "approved", label: "Approved", labelAr: "معتمدة", color: C.violet },
      { id: "disbursed", label: "Disbursed", labelAr: "تم الصرف", color: C.emerald },
      { id: "reported", label: "Impact Reported", labelAr: "تقرير الأثر", color: C.cyan },
    ],
    fields: [
      { key: "caseType", label: "Case Type", labelAr: "نوع الحالة", type: "select", options: ["Family Support", "Medical Aid", "Education Aid", "Housing", "Debt Relief", "Seasonal Campaign"] },
      { key: "fund", label: "Fund", labelAr: "الصندوق", type: "select", options: ["General Fund", "Zakat Fund", "Sadaqah Fund", "Ramadan Campaign", "Restricted Donor Fund"] },
      { key: "beneficiaries", label: "Beneficiaries", labelAr: "عدد المستفيدين", type: "number" },
      { key: "caseWorker", label: "Case Worker", labelAr: "الباحث الاجتماعي", type: "text" },
    ],
    quickLinks: [linkCrm, linkSales, linkReports, { label: "Documents", labelAr: "المستندات", path: "/app/documents", icon: "FileText" }],
    seeds: [
      { id: "AID-1101", title: "Medical aid — dialysis support", customer: "Case #4471 (confidential)", phone: "-", amount: 18000, stage: "committee", date: "2026-07-02", data: { caseType: "Medical Aid", fund: "Zakat Fund", beneficiaries: 1, caseWorker: "U. Al-Harbi" } },
      { id: "AID-1102", title: "School bags campaign 1447", customer: "Campaign", phone: "-", amount: 75000, stage: "approved", date: "2026-06-25", data: { caseType: "Seasonal Campaign", fund: "General Fund", beneficiaries: 1500, caseWorker: "Team A" } },
      { id: "AID-1103", title: "Family support — monthly basket", customer: "Case #4488 (confidential)", phone: "-", amount: 1200, stage: "disbursed", date: "2026-07-05", data: { caseType: "Family Support", fund: "Sadaqah Fund", beneficiaries: 6, caseWorker: "M. Qurashi" } },
    ],
  },
  // --------------------------------------------------------------------------
  {
    id: "tailoring",
    moduleId: "tailoring",
    nameEn: "Tailoring & Fashion",
    nameAr: "الخياطة والأزياء",
    taglineEn: "Measurements, fabric rolls, production stages, fittings and delivery",
    taglineAr: "مقاسات، أقمشة، مراحل إنتاج، قياس وتسليم",
    icon: "Shirt",
    gradient: "from-violet-600 via-purple-600 to-fuchsia-700",
    accent: "text-violet-600",
    recordNounEn: "Tailoring Order",
    recordNounAr: "طلب خياطة",
    stages: [
      { id: "measured", label: "Measured", labelAr: "أخذ المقاس", color: C.slate },
      { id: "cutting", label: "Cutting", labelAr: "قص", color: C.blue },
      { id: "stitching", label: "Stitching", labelAr: "خياطة", color: C.amber },
      { id: "fitting", label: "Fitting", labelAr: "قياس/بروفة", color: C.violet },
      { id: "ready", label: "Ready", labelAr: "جاهز", color: C.emerald },
      { id: "delivered", label: "Delivered", labelAr: "تم التسليم", color: C.cyan },
    ],
    fields: [
      { key: "garment", label: "Garment", labelAr: "القطعة", type: "select", options: ["Thobe", "Abaya", "Bisht", "Uniform Set", "Dress", "Alteration"] },
      { key: "fabric", label: "Fabric / Roll No.", labelAr: "القماش / رقم الرول", type: "text" },
      { key: "tailor", label: "Tailor", labelAr: "الخياط", type: "text" },
      { key: "deliveryDate", label: "Delivery Date", labelAr: "تاريخ التسليم", type: "date" },
      { key: "qty", label: "Quantity", labelAr: "الكمية", type: "number" },
    ],
    quickLinks: [linkPos, linkInventory, linkCrm, linkSales],
    seeds: [
      { id: "TLR-1201", title: "3x Thobe — Japanese fabric", customer: "Abdullah Al-Mutairi", phone: "+966 50 118 3342", amount: 900, stage: "stitching", date: "2026-07-05", data: { garment: "Thobe", fabric: "Roll J-88", tailor: "Ustad Bashir", deliveryDate: "2026-07-12", qty: 3 } },
      { id: "TLR-1202", title: "School uniform batch — 120 sets", customer: "Manarat Schools", phone: "+966 55 700 8123", amount: 21600, stage: "cutting", date: "2026-07-01", data: { garment: "Uniform Set", fabric: "Roll U-12", tailor: "Production Line", deliveryDate: "2026-08-05", qty: 120 } },
      { id: "TLR-1203", title: "Wedding abaya — embroidery", customer: "Hessa Al-Qahtani", phone: "+966 54 332 9917", amount: 1850, stage: "fitting", date: "2026-06-28", data: { garment: "Abaya", fabric: "Roll A-privé", tailor: "Sitt Maryam", deliveryDate: "2026-07-10", qty: 1 } },
    ],
  },
  // --------------------------------------------------------------------------
  {
    id: "jewelry",
    moduleId: "jewelry",
    nameEn: "Gold, Jewelry & Watches",
    nameAr: "الذهب والمجوهرات والساعات",
    taglineEn: "Daily gold rate, weight/carat items, making charges, buyback and repairs",
    taglineAr: "سعر الذهب اليومي، الوزن والعيار، أجور المصنعية، إعادة الشراء والإصلاح",
    icon: "Gem",
    gradient: "from-yellow-600 via-amber-600 to-yellow-800",
    accent: "text-yellow-600",
    recordNounEn: "Sale / Repair Job",
    recordNounAr: "بيع / إصلاح",
    stages: [
      { id: "quoted", label: "Quoted", labelAr: "تسعير", color: C.slate },
      { id: "reserved", label: "Reserved", labelAr: "محجوز", color: C.blue },
      { id: "workshop", label: "In Workshop", labelAr: "في الورشة", color: C.amber },
      { id: "ready", label: "Ready", labelAr: "جاهز", color: C.violet },
      { id: "sold", label: "Sold / Delivered", labelAr: "مباع / مسلم", color: C.emerald },
    ],
    fields: [
      { key: "itemType", label: "Item", labelAr: "الصنف", type: "select", options: ["Gold Set 21K", "Gold Set 18K", "Bracelet", "Ring", "Diamond Piece", "Watch", "Repair Job", "Buyback"] },
      { key: "weightGrams", label: "Weight (g)", labelAr: "الوزن (جم)", type: "number" },
      { key: "karat", label: "Karat", labelAr: "العيار", type: "select", options: ["24K", "22K", "21K", "18K", "Diamond", "N/A"] },
      { key: "makingCharge", label: "Making Charge (SAR)", labelAr: "المصنعية", type: "number" },
      { key: "certificate", label: "Certificate No.", labelAr: "رقم الشهادة", type: "text" },
    ],
    quickLinks: [linkPos, linkInventory, linkSales, linkReports],
    seeds: [
      { id: "GLD-1301", title: "21K bridal set — 85g", customer: "Um Faisal", phone: "+966 55 481 6634", amount: 32300, stage: "reserved", date: "2026-07-07", data: { itemType: "Gold Set 21K", weightGrams: 85, karat: "21K", makingCharge: 2400, certificate: "-" } },
      { id: "GLD-1302", title: "Watch service — Omega", customer: "Turki Al-Shehri", phone: "+966 50 292 1108", amount: 1400, stage: "workshop", date: "2026-07-04", data: { itemType: "Repair Job", weightGrams: 0, karat: "N/A", makingCharge: 0, certificate: "SVC-2211" } },
      { id: "GLD-1303", title: "Buyback — 22K bracelet 42g", customer: "Walk-in", phone: "-", amount: 15800, stage: "sold", date: "2026-07-06", data: { itemType: "Buyback", weightGrams: 42, karat: "22K", makingCharge: 0, certificate: "-" } },
    ],
  },
  // --------------------------------------------------------------------------
  {
    id: "repair",
    moduleId: "repair",
    nameEn: "Electronics & Mobile Repair",
    nameAr: "صيانة الإلكترونيات والجوالات",
    taglineEn: "Device intake with IMEI, diagnostics, approvals, parts and warranty",
    taglineAr: "استلام الأجهزة برقم IMEI، فحص، موافقات، قطع غيار وضمان",
    icon: "Smartphone",
    gradient: "from-cyan-600 via-sky-600 to-blue-700",
    accent: "text-cyan-600",
    recordNounEn: "Repair Ticket",
    recordNounAr: "تذكرة صيانة",
    stages: [
      { id: "received", label: "Received", labelAr: "مستلم", color: C.slate },
      { id: "diagnosing", label: "Diagnosing", labelAr: "فحص", color: C.blue },
      { id: "approval", label: "Awaiting Approval", labelAr: "بانتظار الموافقة", color: C.amber },
      { id: "repairing", label: "Repairing", labelAr: "قيد الإصلاح", color: C.violet },
      { id: "ready", label: "Ready", labelAr: "جاهز", color: C.emerald },
      { id: "delivered", label: "Delivered", labelAr: "تم التسليم", color: C.cyan },
    ],
    fields: [
      { key: "device", label: "Device", labelAr: "الجهاز", type: "text", placeholder: "iPhone 15 Pro" },
      { key: "imei", label: "IMEI / Serial", labelAr: "IMEI / الرقم التسلسلي", type: "text" },
      { key: "issue", label: "Issue", labelAr: "العطل", type: "select", options: ["Screen", "Battery", "Charging Port", "Water Damage", "Software", "Motherboard", "Other"] },
      { key: "technician", label: "Technician", labelAr: "الفني", type: "text" },
      { key: "warrantyDays", label: "Warranty (days)", labelAr: "الضمان (يوم)", type: "number" },
    ],
    quickLinks: [linkPos, linkInventory, linkCrm, linkSales],
    seeds: [
      { id: "RPT-1401", title: "iPhone 15 Pro — screen", customer: "Sara Al-Zahrani", phone: "+966 54 001 2293", amount: 850, stage: "approval", date: "2026-07-08", data: { device: "iPhone 15 Pro", imei: "35-882119-334455", issue: "Screen", technician: "Adnan", warrantyDays: 90 } },
      { id: "RPT-1402", title: "MacBook Air — battery", customer: "Fahad Corp IT", phone: "+966 50 776 4410", amount: 1250, stage: "repairing", date: "2026-07-07", data: { device: "MacBook Air M2", imei: "C02-XY22-88", issue: "Battery", technician: "Waleed", warrantyDays: 180 } },
      { id: "RPT-1403", title: "Samsung S24 — charging port", customer: "Walk-in", phone: "+966 55 210 8874", amount: 320, stage: "ready", date: "2026-07-06", data: { device: "Galaxy S24", imei: "35-990233-118822", issue: "Charging Port", technician: "Adnan", warrantyDays: 60 } },
    ],
  },
  // --------------------------------------------------------------------------
  {
    id: "furniture",
    moduleId: "furniture",
    nameEn: "Furniture & Carpentry",
    nameAr: "الأثاث والنجارة",
    taglineEn: "Site measurements, custom orders, production, installation and warranty",
    taglineAr: "قياس المواقع، طلبات مخصصة، إنتاج، تركيب وضمان",
    icon: "Armchair",
    gradient: "from-orange-700 via-amber-700 to-yellow-800",
    accent: "text-orange-700",
    recordNounEn: "Custom Order",
    recordNounAr: "طلب مخصص",
    stages: [
      { id: "measurement", label: "Site Measurement", labelAr: "قياس الموقع", color: C.slate },
      { id: "design", label: "Design & Quote", labelAr: "تصميم وتسعير", color: C.blue },
      { id: "deposit", label: "Deposit Paid", labelAr: "دفعة مقدمة", color: C.amber },
      { id: "production", label: "In Production", labelAr: "قيد الإنتاج", color: C.violet },
      { id: "installing", label: "Installing", labelAr: "تركيب", color: C.cyan },
      { id: "handover", label: "Handover", labelAr: "تسليم", color: C.emerald },
    ],
    fields: [
      { key: "orderType", label: "Order Type", labelAr: "نوع الطلب", type: "select", options: ["Kitchen Cabinets", "Majlis Set", "Wardrobes", "Curtains", "Office Fit-out", "Upholstery", "Doors"] },
      { key: "site", label: "Site Address", labelAr: "عنوان الموقع", type: "text" },
      { key: "installer", label: "Installer Team", labelAr: "فريق التركيب", type: "text" },
      { key: "installDate", label: "Install Date", labelAr: "تاريخ التركيب", type: "date" },
    ],
    quickLinks: [{ label: "Manufacturing", labelAr: "التصنيع", path: "/app/manufacturing", icon: "Factory" }, linkProjects, linkSales, linkInventory],
    seeds: [
      { id: "FRN-1501", title: "Kitchen cabinets — Villa 22", customer: "Eng. Saad Al-Anzi", phone: "+966 50 441 8836", amount: 46000, stage: "production", date: "2026-06-20", data: { orderType: "Kitchen Cabinets", site: "Al-Malqa, Riyadh", installer: "Team B", installDate: "2026-07-25" } },
      { id: "FRN-1502", title: "Majlis set — 12 seats", customer: "Al-Suwailem Family", phone: "+966 55 903 2217", amount: 28500, stage: "deposit", date: "2026-07-03", data: { orderType: "Majlis Set", site: "Al-Nargis district", installer: "Team A", installDate: "2026-08-02" } },
      { id: "FRN-1503", title: "Office fit-out — 400sqm", customer: "Tamkeen HQ", phone: "+966 54 118 7745", amount: 165000, stage: "design", date: "2026-07-06", data: { orderType: "Office Fit-out", site: "KAFD Tower 4", installer: "TBD", installDate: "2026-09-15" } },
    ],
  },
  // --------------------------------------------------------------------------
  {
    id: "printing",
    moduleId: "printing",
    nameEn: "Printing & Signage",
    nameAr: "الطباعة واللوحات الإعلانية",
    taglineEn: "Artwork approvals, sqm pricing, machine jobs, finishing and installs",
    taglineAr: "اعتماد التصاميم، تسعير بالمتر، مهام المكائن، تشطيب وتركيب",
    icon: "Printer",
    gradient: "from-pink-600 via-rose-600 to-red-700",
    accent: "text-pink-600",
    recordNounEn: "Print Job",
    recordNounAr: "أمر طباعة",
    stages: [
      { id: "artwork", label: "Artwork", labelAr: "التصميم", color: C.slate },
      { id: "approval", label: "Client Approval", labelAr: "اعتماد العميل", color: C.blue },
      { id: "printing", label: "Printing", labelAr: "طباعة", color: C.amber },
      { id: "finishing", label: "Finishing", labelAr: "تشطيب", color: C.violet },
      { id: "install", label: "Delivery / Install", labelAr: "تسليم / تركيب", color: C.cyan },
      { id: "done", label: "Done", labelAr: "منجز", color: C.emerald },
    ],
    fields: [
      { key: "jobType", label: "Job Type", labelAr: "نوع العمل", type: "select", options: ["Banner / Flex", "Vehicle Branding", "Shop Sign (Cladding)", "Rollup", "Business Cards", "Packaging", "Stickers"] },
      { key: "sizeSqm", label: "Size (sqm)", labelAr: "المساحة (م²)", type: "number" },
      { key: "material", label: "Material", labelAr: "الخامة", type: "select", options: ["Flex", "Vinyl", "Acrylic", "Aluminum Cladding", "Paper", "PVC Board"] },
      { key: "machine", label: "Machine", labelAr: "المكينة", type: "text" },
    ],
    quickLinks: [linkInventory, linkSales, linkCrm, linkReports],
    seeds: [
      { id: "PRT-1601", title: "Shop sign 12m — cladding + acrylic", customer: "Basmah Cafe", phone: "+966 55 338 9921", amount: 9600, stage: "approval", date: "2026-07-06", data: { jobType: "Shop Sign (Cladding)", sizeSqm: 12, material: "Aluminum Cladding", machine: "CNC-1" } },
      { id: "PRT-1602", title: "Fleet branding — 6 vans", customer: "Wared Delivery", phone: "+966 50 662 1439", amount: 14400, stage: "printing", date: "2026-07-05", data: { jobType: "Vehicle Branding", sizeSqm: 72, material: "Vinyl", machine: "Roland-2" } },
      { id: "PRT-1603", title: "Ramadan packaging — 5000 boxes", customer: "Tamr Boutique", phone: "+966 54 900 3364", amount: 22500, stage: "done", date: "2026-06-15", data: { jobType: "Packaging", sizeSqm: 0, material: "Paper", machine: "Offset-A" } },
    ],
  },
  // --------------------------------------------------------------------------
  {
    id: "watersvc",
    moduleId: "watersvc",
    nameEn: "Water Delivery & Waste Services",
    nameAr: "توصيل المياه وخدمات النفايات",
    taglineEn: "Routes, subscriptions, tanker/pickup tickets and deposit tracking",
    taglineAr: "مسارات، اشتراكات، تذاكر وايت/نقل نفايات وتتبع العهد",
    icon: "Droplets",
    gradient: "from-sky-500 via-cyan-600 to-teal-700",
    accent: "text-sky-600",
    recordNounEn: "Route Ticket",
    recordNounAr: "تذكرة مسار",
    stages: [
      { id: "subscribed", label: "Subscription", labelAr: "اشتراك", color: C.slate },
      { id: "scheduled", label: "Scheduled", labelAr: "مجدول", color: C.blue },
      { id: "en_route", label: "En Route", labelAr: "في الطريق", color: C.amber },
      { id: "delivered", label: "Delivered / Collected", labelAr: "تم التوصيل / الجمع", color: C.emerald },
      { id: "missed", label: "Missed Stop", labelAr: "محطة فائتة", color: C.rose },
      { id: "invoiced", label: "Invoiced", labelAr: "مفوتر", color: C.cyan },
    ],
    fields: [
      { key: "serviceKind", label: "Service", labelAr: "الخدمة", type: "select", options: ["Water Tanker (Wayt)", "Bottled Water Subscription", "Waste Pickup", "Septic Service", "Recycling Pickup"] },
      { key: "route", label: "Route", labelAr: "المسار", type: "text", placeholder: "North Riyadh - R3" },
      { key: "driver", label: "Driver", labelAr: "السائق", type: "text" },
      { key: "volume", label: "Volume (m³/bottles)", labelAr: "الكمية", type: "number" },
      { key: "frequency", label: "Frequency", labelAr: "التكرار", type: "select", options: ["One-time", "Weekly", "Twice Weekly", "Monthly"] },
    ],
    quickLinks: [{ label: "Fleet", labelAr: "الأسطول", path: "/app/verticals/transport", icon: "Truck" }, linkSales, linkCrm, linkReports],
    seeds: [
      { id: "WTR-1701", title: "Tanker 18m³ — Hittin villa", customer: "Villa 118 - Hittin", phone: "+966 50 202 5563", amount: 350, stage: "en_route", date: "2026-07-08", data: { serviceKind: "Water Tanker (Wayt)", route: "North Riyadh - R3", driver: "Anwar", volume: 18, frequency: "Weekly" } },
      { id: "WTR-1702", title: "Office bottled water — monthly", customer: "Amanah Consulting", phone: "+966 55 118 3300", amount: 480, stage: "subscribed", date: "2026-07-01", data: { serviceKind: "Bottled Water Subscription", route: "Olaya - R1", driver: "Sameer", volume: 60, frequency: "Twice Weekly" } },
      { id: "WTR-1703", title: "Construction waste pickup", customer: "Ehsan Contracting", phone: "+966 53 776 9012", amount: 1400, stage: "invoiced", date: "2026-07-04", data: { serviceKind: "Waste Pickup", route: "Industrial - R7", driver: "Bilal", volume: 12, frequency: "One-time" } },
    ],
  },
  // --------------------------------------------------------------------------
  {
    id: "finserv",
    moduleId: "finserv",
    nameEn: "Insurance & Financial Brokerage",
    nameAr: "وساطة التأمين والخدمات المالية",
    taglineEn: "Policies, renewals, commissions, claims follow-up and collections",
    taglineAr: "وثائق تأمين، تجديدات، عمولات، متابعة مطالبات وتحصيل",
    icon: "ShieldCheck",
    gradient: "from-indigo-600 via-blue-700 to-slate-800",
    accent: "text-indigo-600",
    recordNounEn: "Policy / Case",
    recordNounAr: "وثيقة / حالة",
    stages: [
      { id: "lead", label: "Lead", labelAr: "عميل محتمل", color: C.slate },
      { id: "quoting", label: "Quoting", labelAr: "مقارنة أسعار", color: C.blue },
      { id: "issued", label: "Policy Issued", labelAr: "إصدار الوثيقة", color: C.violet },
      { id: "active", label: "Active", labelAr: "سارية", color: C.emerald },
      { id: "renewal_due", label: "Renewal Due", labelAr: "تجديد مستحق", color: C.amber },
      { id: "commission", label: "Commission Settled", labelAr: "تسوية العمولة", color: C.cyan },
    ],
    fields: [
      { key: "product", label: "Product", labelAr: "المنتج", type: "select", options: ["Motor Insurance", "Health Insurance", "Property Insurance", "Life Insurance", "SME Package", "Collections Case"] },
      { key: "insurer", label: "Insurer / Provider", labelAr: "شركة التأمين", type: "text" },
      { key: "policyNo", label: "Policy No.", labelAr: "رقم الوثيقة", type: "text" },
      { key: "renewalDate", label: "Renewal Date", labelAr: "تاريخ التجديد", type: "date" },
      { key: "commissionPct", label: "Commission %", labelAr: "نسبة العمولة", type: "number" },
    ],
    quickLinks: [linkCrm, linkSales, linkReports, { label: "Documents", labelAr: "المستندات", path: "/app/documents", icon: "FileText" }],
    seeds: [
      { id: "POL-1801", title: "Fleet motor — 24 vehicles", customer: "Wared Delivery", phone: "+966 50 662 1439", amount: 96000, stage: "active", date: "2026-03-15", data: { product: "Motor Insurance", insurer: "Tawuniya", policyNo: "MTR-88231", renewalDate: "2027-03-15", commissionPct: 12 } },
      { id: "POL-1802", title: "SME health — 45 employees", customer: "Basmah Cafe Group", phone: "+966 55 338 9921", amount: 157000, stage: "renewal_due", date: "2025-08-01", data: { product: "Health Insurance", insurer: "Bupa Arabia", policyNo: "HLT-45112", renewalDate: "2026-08-01", commissionPct: 8 } },
      { id: "POL-1803", title: "Warehouse property cover", customer: "Hala Logistics", phone: "+966 55 118 0092", amount: 32000, stage: "quoting", date: "2026-07-06", data: { product: "Property Insurance", insurer: "TBD", policyNo: "-", renewalDate: "2026-08-01", commissionPct: 10 } },
    ],
  },
  // --------------------------------------------------------------------------
  {
    id: "importexport",
    moduleId: "importexport",
    nameEn: "Import / Export & Distribution",
    nameAr: "الاستيراد والتصدير والتوزيع",
    taglineEn: "Import files, landed cost, customs checklist and distribution orders",
    taglineAr: "ملفات استيراد، تكلفة الوصول، مستندات الجمارك وطلبات التوزيع",
    icon: "Container",
    gradient: "from-emerald-700 via-green-700 to-teal-800",
    accent: "text-emerald-700",
    recordNounEn: "Import File",
    recordNounAr: "ملف استيراد",
    stages: [
      { id: "po_placed", label: "PO Placed", labelAr: "أمر شراء", color: C.slate },
      { id: "in_transit", label: "In Transit", labelAr: "في الطريق", color: C.blue },
      { id: "customs", label: "Customs", labelAr: "الجمارك", color: C.amber },
      { id: "warehouse", label: "In Warehouse", labelAr: "في المستودع", color: C.violet },
      { id: "distributing", label: "Distributing", labelAr: "توزيع", color: C.cyan },
      { id: "closed", label: "Closed", labelAr: "مغلق", color: C.emerald },
    ],
    fields: [
      { key: "origin", label: "Origin Country", labelAr: "بلد المنشأ", type: "text" },
      { key: "goodsType", label: "Goods", labelAr: "البضاعة", type: "text" },
      { key: "landedCost", label: "Landed Cost (SAR)", labelAr: "التكلفة الشاملة", type: "number" },
      { key: "saberRef", label: "SABER / Fasah Ref", labelAr: "مرجع سابر / فسح", type: "text" },
    ],
    quickLinks: [{ label: "Wholesale POS", labelAr: "بيع الجملة", path: "/app/pos/wholesale", icon: "Store" }, linkInventory, linkPurchase, linkSales],
    seeds: [
      { id: "IMP-1901", title: "Mobile accessories — Shenzhen", customer: "Own stock", phone: "-", amount: 184000, stage: "customs", date: "2026-07-02", data: { origin: "China", goodsType: "Accessories 14 pallets", landedCost: 211000, saberRef: "SBR-99120" } },
      { id: "IMP-1902", title: "Foodstuff container — Mundra", customer: "Own stock", phone: "-", amount: 96000, stage: "in_transit", date: "2026-06-28", data: { origin: "India", goodsType: "Rice + spices 1x20", landedCost: 109500, saberRef: "SBR-99244" } },
      { id: "IMP-1903", title: "Perfume oils — Grasse", customer: "Own stock", phone: "-", amount: 65000, stage: "warehouse", date: "2026-06-20", data: { origin: "France", goodsType: "Fragrance oils", landedCost: 74100, saberRef: "SBR-98871" } },
    ],
  },
];

export const WORKSPACE_BY_ID: Record<string, VerticalWorkspace> = Object.fromEntries(
  VERTICAL_WORKSPACES.map((w) => [w.id, w])
);

export function getWorkspace(id: string | undefined): VerticalWorkspace | undefined {
  return id ? WORKSPACE_BY_ID[id] : undefined;
}
