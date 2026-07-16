export type BusinessCategory =
  | "hospital"
  | "workshop"
  | "construction"
  | "retail"
  | "restaurant"
  | "hotel"
  | "hostel"
  | "manufacturing"
  | "education"
  | "transport"
  | "real_estate"
  | "services"
  | "laundry"
  | "salon"
  | "gym"
  | "pharmacy"
  | "ecommerce"
  | "ecommerce_online_retail"
  | "manufacturing_industrial"
  | "digital_marketing_media"
  | "logistics_supply_chain"
  | "healthcare_medical"
  | "real_estate_property"
  | "construction_engineering"
  | "tourism_travel"
  | "hospitality_accommodation"
  | "food_beverage"
  | "education_edtech"
  | "professional_consulting"
  | "offline_retail_consumer"
  | "events_entertainment"
  | "financial_fintech"
  | "agriculture_agritech"
  | "automotive_transportation"
  | "clean_energy_environment"
  | "wholesale_import_export"
  | "mining_quarrying"
  | "marine_port_shipping"
  | "veterinary_pet"
  | "nonprofit_charity"
  | "tailoring_fashion"
  | "gold_jewelry_watches"
  | "electronics_repair"
  | "furniture_carpentry"
  | "printing_signage"
  | "water_sanitation_waste"
  | "all";

export interface BusinessCatalogItem {
  value: BusinessCategory;
  label: string;
  labelAr: string;
  icon: string;
  color: string;
  description: string;
  descriptionAr: string;
  subCategories?: string[];
  subCategoriesAr?: string[];
  complianceNotes?: string[];
  workflowHighlights?: string[];
  entityTypes?: string[];
  onboardingQuestions?: string[];
  saudiMarketNotes?: string[];
  defaultModules: string[];
  groupTitles: string[];
}

export interface BusinessProfile {
  businessCategory?: BusinessCategory;
  businessType?: BusinessCategory;
  industry?: string;
  selectedModules?: string[];
  enabledModules?: string[];
  [key: string]: unknown;
}

export const COMPANY_PROFILE_STORAGE_KEY = "yasco-company-profile";

export const CORE_MODULE_IDS = [
  "dashboard",
  "accounting",
  "inventory",
  "sales",
  "purchase",
  "hrm",
  "reports",
  "settings",
];

export const MODULE_PATH_PREFIXES: Record<string, string[]> = {
  dashboard: ["/app"],
  accounting: ["/app/accounting"],
  inventory: ["/app/inventory"],
  sales: ["/app/sales", "/app/pos", "/app/cashbox", "/app/installments"],
  purchase: ["/app/purchase"],
  hrm: ["/app/hrm"],
  reports: ["/app/reports"],
  settings: ["/app/settings", "/app/branches", "/app/admin/invoice-settings", "/app/setup-wizard"],
  documents: ["/app/documents"],
  crm: ["/app/crm"],
  projects: ["/app/projects"],
  helpdesk: ["/app/helpdesk"],
  assets: ["/app/assets"],
  pos_retail: ["/app/pos", "/app/cashbox"],
  pos_restaurant: ["/app/pos/restaurant"],
  pos_pharmacy: ["/app/pos/pharmacy"],
  pos_wholesale: ["/app/pos/wholesale"],
  healthcare: ["/app/verticals/healthcare", "/app/pos/pharmacy"],
  workshop: ["/app/verticals/workshop"],
  construction: ["/app/construction", "/app/verticals/construction"],
  education: ["/app/verticals/education"],
  hotel: ["/app/verticals/hotel", "/app/pos/restaurant"],
  real_estate: ["/app/verticals/real-estate"],
  transport: ["/app/verticals/transport", "/app/assets/fleet"],
  travel: ["/app/verticals/travel"],
  manufacturing: ["/app/manufacturing", "/app/mrp", "/app/verticals/manufacturing"],
  laundry: ["/app/verticals/laundry"],
  salon: ["/app/verticals/salon"],
  gym: ["/app/verticals/gym"],
  ecommerce: ["/app/verticals/ecommerce"],
  hostel: ["/app/verticals/hostel"],
  pharmacy: ["/app/verticals/pharmacy", "/app/pos/pharmacy"],
  platform: ["/app/platform"],
};

export const SAUDI_MARKET_SOURCE_NOTES = [
  {
    label: "GASTAT classifications and statistics",
    url: "https://www.stats.gov.sa/en/home",
    note: "Economic, digital economy, business, international trade, labor, health, education, tourism, transport, environment, agriculture and energy statistics are used as sector anchors.",
  },
  {
    label: "MISA investment sectors",
    url: "https://misa.gov.sa/",
    note: "Saudi priority-sector positioning supports broad coverage for trade, logistics, healthcare, manufacturing, tourism, technology and services.",
  },
  {
    label: "Balady municipal services",
    url: "https://balady.gov.sa/en",
    note: "Commercial licenses, construction licenses, health certificates, mobile carts, delivery permits and municipal service tracking inform tenant document and compliance fields.",
  },
  {
    label: "ZATCA e-invoicing",
    url: "https://zatca.gov.sa/en/E-Invoicing/Pages/default.aspx",
    note: "Invoice, credit note, debit note, XML, QR, signing, reporting and clearance architecture must stay universal across all verticals.",
  },
  {
    label: "MOH healthcare portal",
    url: "https://www.moh.gov.sa/en/pages/default.aspx",
    note: "Healthcare workflows need patient privacy, clinical records, appointments, prescriptions, medical documents and insurance-ready architecture.",
  },
  {
    label: "SAMA",
    url: "https://www.sama.gov.sa/en-US/Pages/default.aspx",
    note: "Payment, banking, fintech and reconciliation modules must keep regulated activities behind compliance flags and approval workflows.",
  },
];

export interface SaudiBusinessCoverageItem {
  category: BusinessCategory;
  sourceSector: string;
  managementSystem: string;
  workflows: string[];
  entities: string[];
  complianceFlags: string[];
  recommendedModules: string[];
}

export const SAUDI_BUSINESS_COVERAGE_MATRIX: SaudiBusinessCoverageItem[] = [
  {
    category: "ecommerce_online_retail",
    sourceSector: "Trade, digital economy, transport and payment services",
    managementSystem: "Online order, inventory, warehouse, courier and settlement console",
    workflows: ["order import", "stock sync", "pick and pack", "courier booking", "COD reconciliation", "returns", "marketplace fees", "customer messaging"],
    entities: ["online_order", "sales_channel", "shipment", "return_request", "fulfillment_task"],
    complianceFlags: ["VAT invoices", "payment gateway reconciliation", "consumer return policy", "courier COD settlement"],
    recommendedModules: ["ecommerce", "inventory", "sales", "transport", "crm", "accounting"],
  },
  {
    category: "manufacturing_industrial",
    sourceSector: "Manufacturing and industrial production",
    managementSystem: "BOM, production, batch, quality, maintenance and cost accounting system",
    workflows: ["BOM setup", "production order", "raw material issue", "work center scheduling", "quality inspection", "finished goods receipt", "scrap", "machine maintenance"],
    entities: ["bom", "production_order", "batch", "work_center", "quality_check"],
    complianceFlags: ["industrial license documents", "batch traceability", "safety records", "expiry for food or chemicals"],
    recommendedModules: ["manufacturing", "inventory", "purchase", "sales", "accounting", "assets"],
  },
  {
    category: "digital_marketing_media",
    sourceSector: "Information, communication, professional and media services",
    managementSystem: "CRM, proposal, retainer, project, approval and campaign billing workspace",
    workflows: ["lead intake", "proposal", "campaign plan", "creative approval", "content calendar", "ad spend tracking", "retainer billing", "performance report"],
    entities: ["campaign", "creative_brief", "content_calendar", "client_retainer"],
    complianceFlags: ["client approval records", "contract document vault", "expense pass-through audit"],
    recommendedModules: ["crm", "projects", "sales", "accounting", "helpdesk"],
  },
  {
    category: "logistics_supply_chain",
    sourceSector: "Transportation, logistics, warehousing and courier services",
    managementSystem: "Shipment, fleet, driver, warehouse, route and settlement system",
    workflows: ["shipment booking", "waybill", "driver assignment", "route status", "POD", "fuel log", "temperature log", "driver settlement"],
    entities: ["shipment", "waybill", "vehicle", "driver", "proof_of_delivery"],
    complianceFlags: ["vehicle documents", "driver documents", "temperature audit for cold chain", "customs document checklist"],
    recommendedModules: ["transport", "assets", "inventory", "sales", "purchase", "accounting"],
  },
  {
    category: "healthcare_medical",
    sourceSector: "Health and social care",
    managementSystem: "Patient, appointment, clinical note, prescription, pharmacy and insurance-ready billing system",
    workflows: ["patient registration", "appointment", "consultation", "diagnosis coding", "prescription", "lab order", "procedure billing", "follow-up"],
    entities: ["patient", "appointment", "consultation", "prescription", "insurance_claim"],
    complianceFlags: ["patient privacy", "doctor-only notes", "clinical audit trail", "NPHIES-ready adapter boundary"],
    recommendedModules: ["healthcare", "pos_pharmacy", "inventory", "sales", "purchase", "accounting"],
  },
  {
    category: "real_estate_property",
    sourceSector: "Real estate, rental and facility management",
    managementSystem: "Property, unit, tenant, lease, rent schedule and maintenance system",
    workflows: ["unit registry", "tenant onboarding", "rent schedule", "Ejar reference", "maintenance ticket", "inspection", "owner statement"],
    entities: ["property", "unit", "tenant", "lease", "maintenance_ticket"],
    complianceFlags: ["Ejar reference storage", "security deposit audit", "maintenance document trail"],
    recommendedModules: ["real_estate", "crm", "sales", "accounting", "helpdesk"],
  },
  {
    category: "construction_engineering",
    sourceSector: "Construction, engineering and municipal building services",
    managementSystem: "BOQ, project cost, site operations, subcontractor and progress billing system",
    workflows: ["site survey", "BOQ", "quotation", "contract", "material request", "daily report", "variation", "progress certificate", "retention"],
    entities: ["project", "boq", "site_report", "subcontractor", "progress_certificate"],
    complianceFlags: ["Balady building permit document storage", "HSE records", "retention accounting", "subcontractor approval"],
    recommendedModules: ["construction", "projects", "inventory", "purchase", "sales", "accounting"],
  },
  {
    category: "tourism_travel",
    sourceSector: "Tourism, Hajj, Umrah, ticketing, guided tours and corporate travel services",
    managementSystem: "Package, ticketing, passenger, supplier, itinerary, visa checklist and settlement system",
    workflows: ["travel inquiry", "package builder", "ticketing request", "passenger manifest", "passport/visa checklist", "hotel allocation", "transport allocation", "guide assignment", "supplier settlement", "installment billing"],
    entities: ["travel_package", "passenger", "itinerary", "supplier_booking", "ticketing_request", "visa_document", "group_manifest"],
    complianceFlags: ["passport document protection", "group manifest", "supplier payable split", "customer installment schedule", "licensed activity document storage"],
    recommendedModules: ["travel", "crm", "sales", "purchase", "accounting", "transport"],
  },
  {
    category: "hospitality_accommodation",
    sourceSector: "Accommodation, hospitality and tourism establishments",
    managementSystem: "Room, booking, guest, housekeeping, maintenance and folio billing system",
    workflows: ["room inventory", "booking", "check-in", "housekeeping", "maintenance", "extra charges", "folio billing", "OTA reconciliation"],
    entities: ["room", "guest", "booking", "folio", "housekeeping_task"],
    complianceFlags: ["guest ID document controls", "municipal license storage", "tourism license document expiry"],
    recommendedModules: ["hotel", "pos_restaurant", "sales", "accounting", "helpdesk"],
  },
  {
    category: "food_beverage",
    sourceSector: "Food services, restaurants, cafes and catering",
    managementSystem: "POS, menu, KDS, recipe, ingredient, shift and delivery settlement system",
    workflows: ["table order", "quick POS", "KDS", "recipe depletion", "supplier receiving", "wastage", "shift closing", "aggregator reconciliation"],
    entities: ["table", "order", "menu_item", "recipe", "kitchen_ticket"],
    complianceFlags: ["Balady commercial license", "health certificate tracking", "food expiry and batch control"],
    recommendedModules: ["pos_restaurant", "inventory", "purchase", "sales", "accounting"],
  },
  {
    category: "education_edtech",
    sourceSector: "Education, training and digital learning",
    managementSystem: "Student, guardian, course, attendance, fee and certificate system",
    workflows: ["admission", "guardian record", "class schedule", "attendance", "fee installment", "certificate", "notification"],
    entities: ["student", "guardian", "class", "course", "fee_schedule"],
    complianceFlags: ["student document privacy", "guardian communications", "certificate audit"],
    recommendedModules: ["education", "crm", "sales", "accounting", "hrm"],
  },
  {
    category: "professional_consulting",
    sourceSector: "Professional, scientific and technical services",
    managementSystem: "Lead, matter/project, document vault, timesheet and retainer billing system",
    workflows: ["lead", "proposal", "contract", "matter/project", "timesheet", "milestone billing", "document approval"],
    entities: ["matter", "project", "timesheet", "client_document"],
    complianceFlags: ["sensitive document permissions", "client approval trail", "retainer accounting"],
    recommendedModules: ["crm", "projects", "sales", "accounting", "documents"],
  },
  {
    category: "offline_retail_consumer",
    sourceSector: "Retail trade and consumer goods",
    managementSystem: "Barcode POS, inventory, variants, promotions, loyalty and branch control system",
    workflows: ["barcode sale", "variant stock", "stock transfer", "promotion", "return", "cashier close", "loyalty"],
    entities: ["product", "variant", "promotion", "cashier_session"],
    complianceFlags: ["VAT invoice", "exchange policy", "cash drawer audit"],
    recommendedModules: ["pos_retail", "inventory", "sales", "purchase", "accounting"],
  },
  {
    category: "events_entertainment",
    sourceSector: "Arts, entertainment, sports and recreation",
    managementSystem: "Event quotation, resource booking, equipment rental, staffing and settlement system",
    workflows: ["event quotation", "resource booking", "vendor assignment", "deposit", "equipment issue", "event checklist", "final settlement"],
    entities: ["event", "venue", "resource", "equipment_booking"],
    complianceFlags: ["permit document storage", "deposit accounting", "vendor payable split"],
    recommendedModules: ["projects", "inventory", "crm", "sales", "purchase", "accounting"],
  },
  {
    category: "financial_fintech",
    sourceSector: "Financial services, insurance and fintech",
    managementSystem: "CRM, case, document, commission and controlled approval system",
    workflows: ["lead", "KYC document checklist", "application", "approval", "commission", "renewal", "case audit"],
    entities: ["financial_case", "policy", "commission", "regulated_document"],
    complianceFlags: ["SAMA/regulator license flag", "sensitive access controls", "approval workflow", "audit exports"],
    recommendedModules: ["crm", "documents", "sales", "accounting", "reports"],
  },
  {
    category: "agriculture_agritech",
    sourceSector: "Agriculture, livestock, fisheries and food supply",
    managementSystem: "Plot, livestock, crop cycle, batch, cold storage and production costing system",
    workflows: ["crop cycle", "irrigation", "fertilizer log", "harvest", "livestock health", "feed consumption", "cold storage", "sales"],
    entities: ["plot", "crop_cycle", "livestock", "harvest_batch", "cold_room"],
    complianceFlags: ["batch traceability", "cold-chain logs", "veterinary document storage"],
    recommendedModules: ["inventory", "manufacturing", "assets", "sales", "purchase", "accounting"],
  },
  {
    category: "automotive_transportation",
    sourceSector: "Automotive repair, vehicle trade, rental and transport services",
    managementSystem: "Vehicle, job card, rental/fleet, parts, warranty and reminder system",
    workflows: ["vehicle intake", "inspection", "estimate", "approval", "parts issue", "technician work", "QC", "invoice", "service reminder"],
    entities: ["vehicle", "job_card", "bay", "part_request", "warranty_claim"],
    complianceFlags: ["customer approval signature", "damage photo evidence", "vehicle document expiry"],
    recommendedModules: ["workshop", "transport", "inventory", "pos_retail", "sales", "accounting"],
  },
  {
    category: "clean_energy_environment",
    sourceSector: "Energy, utilities, water, waste and environmental services",
    managementSystem: "Project, route, equipment, service contract and compliance document system",
    workflows: ["site survey", "quotation", "installation", "preventive maintenance", "route service", "weight ticket", "compliance document"],
    entities: ["energy_project", "service_contract", "route", "equipment", "waste_ticket"],
    complianceFlags: ["environmental document storage", "route audit", "equipment warranty"],
    recommendedModules: ["projects", "helpdesk", "assets", "inventory", "sales", "accounting"],
  },
  {
    category: "wholesale_import_export",
    sourceSector: "Wholesale trade, import, export and distribution",
    managementSystem: "Supplier, landed cost, warehouse, price list, credit and distribution system",
    workflows: ["import shipment", "landed cost", "warehouse receiving", "price list", "sales order", "picking", "delivery", "collection"],
    entities: ["shipment_file", "supplier", "price_list", "delivery_note", "collection"],
    complianceFlags: ["customs document storage", "batch/expiry for food and medical goods", "credit limit approvals"],
    recommendedModules: ["pos_wholesale", "inventory", "purchase", "sales", "transport", "accounting"],
  },
  {
    category: "mining_quarrying",
    sourceSector: "Mining, quarrying and industrial materials extraction",
    managementSystem: "Extraction batch, weighbridge, truck dispatch, equipment hours and material grade system",
    workflows: ["extraction batch", "weighbridge ticket", "truck dispatch", "equipment hours", "maintenance plan", "customer contract", "safety checklist"],
    entities: ["extraction_batch", "weighbridge_ticket", "truck_dispatch", "equipment", "material_stockpile"],
    complianceFlags: ["permit document storage", "safety records", "environmental compliance", "equipment certification"],
    recommendedModules: ["inventory", "assets", "purchase", "sales", "accounting", "hrm"],
  },
  {
    category: "marine_port_shipping",
    sourceSector: "Marine, ports, shipping agencies and freight forwarding",
    managementSystem: "Shipment file, vessel tracking, container log, customs docs and billing system",
    workflows: ["shipment file", "vessel details", "container tracking", "document checklist", "demurrage tracking", "supplier billing", "clearing expense"],
    entities: ["shipment_file", "vessel", "container", "customs_document", "freight_invoice"],
    complianceFlags: ["customs document storage", "container demurrage tracking", "vessel certification expiry"],
    recommendedModules: ["transport", "inventory", "crm", "sales", "purchase", "accounting"],
  },
  {
    category: "veterinary_pet",
    sourceSector: "Veterinary, pet services and animal healthcare",
    managementSystem: "Pet profile, owner record, appointment, vaccination, prescription and grooming system",
    workflows: ["pet registration", "owner profile", "appointment", "vaccination", "medical notes", "prescription", "grooming package", "boarding calendar"],
    entities: ["pet", "pet_owner", "appointment", "vaccination_record", "prescription"],
    complianceFlags: ["pet medical records privacy", "vaccination schedule tracking", "controlled medicine logs"],
    recommendedModules: ["healthcare", "pos_pharmacy", "crm", "sales", "accounting"],
  },
  {
    category: "nonprofit_charity",
    sourceSector: "Nonprofit, charity, NGO and community services",
    managementSystem: "Donor CRM, campaign, beneficiary, volunteer and restricted fund system",
    workflows: ["donor registration", "campaign creation", "donation receipt", "beneficiary profile", "case approval", "volunteer scheduling", "fund allocation", "expense tracking"],
    entities: ["donor", "campaign", "beneficiary", "volunteer", "restricted_fund"],
    complianceFlags: ["donor privacy", "audit trail for funds", "charity license documents", "restricted fund accounting"],
    recommendedModules: ["crm", "sales", "accounting", "hrm", "documents", "reports"],
  },
  {
    category: "tailoring_fashion",
    sourceSector: "Tailoring, fashion, textile and alteration services",
    managementSystem: "Measurement profile, fabric inventory, production stages, fitting and delivery system",
    workflows: ["customer measurement", "fabric selection", "design approval", "production stages", "fitting appointment", "alteration", "delivery", "repeat customer templates"],
    entities: ["customer_measurement", "fabric_roll", "production_order", "fitting_appointment"],
    complianceFlags: ["customer measurement data privacy", "fabric inventory tracking", "delivery confirmation"],
    recommendedModules: ["pos_retail", "inventory", "crm", "sales", "purchase", "accounting"],
  },
  {
    category: "gold_jewelry_watches",
    sourceSector: "Gold, jewelry, diamond and watch retail and repair",
    managementSystem: "Gold rate, weight/carat, making charge, stone details, certificate and repair job system",
    workflows: ["gold rate update", "item weight/carat entry", "making charges", "stone details", "certificate attachment", "repair job", "exchange/buyback", "serial tracking"],
    entities: ["gold_item", "jewelry_repair", "certificate", "buyback_transaction"],
    complianceFlags: ["gold purity certification", "weight audit trail", "serial tracking for watches"],
    recommendedModules: ["pos_retail", "inventory", "crm", "sales", "purchase", "accounting"],
  },
  {
    category: "electronics_repair",
    sourceSector: "Electronics, mobile and computer repair services",
    managementSystem: "Repair ticket, IMEI/serial tracking, warranty, parts and customer approval system",
    workflows: ["device intake", "diagnostic fee", "repair ticket", "parts issue", "customer approval", "warranty tracking", "exchange/return", "installment sale"],
    entities: ["repair_ticket", "device", "imei_track", "warranty_record"],
    complianceFlags: ["customer data privacy on devices", "IMEI/ESN recording", "warranty document storage"],
    recommendedModules: ["pos_retail", "inventory", "workshop", "crm", "sales", "accounting"],
  },
  {
    category: "furniture_carpentry",
    sourceSector: "Furniture, carpentry, interior design and upholstery",
    managementSystem: "Site measurement, design quotation, material selection, production and installation system",
    workflows: ["site measurement", "design quotation", "material selection", "production job", "installer schedule", "delivery", "warranty", "progress payment"],
    entities: ["site_measurement", "design_quotation", "production_job", "install_schedule"],
    complianceFlags: ["measurement accuracy records", "material quality documents", "delivery checklist"],
    recommendedModules: ["manufacturing", "inventory", "projects", "crm", "sales", "purchase", "accounting"],
  },
  {
    category: "printing_signage",
    sourceSector: "Printing, signage, advertising production and branding",
    managementSystem: "Artwork approval, size/material quoting, production job card and delivery/install system",
    workflows: ["artwork upload", "design approval", "quotation by size/material", "production job card", "machine assignment", "delivery/install", "revision control"],
    entities: ["artwork", "production_job", "print_material", "install_order"],
    complianceFlags: ["design copyright storage", "revision audit trail", "client approval document"],
    recommendedModules: ["manufacturing", "inventory", "projects", "crm", "sales", "purchase", "accounting"],
  },
  {
    category: "water_sanitation_waste",
    sourceSector: "Water, sanitation, waste management and recycling",
    managementSystem: "Route schedule, vehicle dispatch, weight/volume ticket, subscription billing and compliance system",
    workflows: ["route schedule", "subscription billing", "vehicle dispatch", "weight/volume ticket", "customer service request", "compliance documents", "recycling log"],
    entities: ["service_route", "waste_ticket", "vehicle_dispatch", "customer_subscription"],
    complianceFlags: ["environmental permit storage", "waste manifest", "vehicle license expiry", "temperature log for hazardous"],
    recommendedModules: ["transport", "assets", "crm", "sales", "purchase", "accounting", "helpdesk"],
  },
];

const commonGroups = ["MAIN", "FINANCE", "INVENTORY", "SALES", "PURCHASE", "CRM", "HRM", "OPERATIONS", "SYSTEM"];
const allGroups = ["MAIN", "FINANCE", "INVENTORY", "SALES", "PURCHASE", "CRM", "HRM", "MANUFACTURING", "PROJECTS", "WORKSHOP", "OPERATIONS", "PLATFORM", "SYSTEM"];

export const BUSINESS_CATALOG: BusinessCatalogItem[] = [
  {
    value: "ecommerce_online_retail",
    label: "E-Commerce & Online Retail",
    labelAr: "التجارة الإلكترونية والبيع عبر الإنترنت",
    icon: "Store",
    color: "text-fuchsia-600 bg-fuchsia-50",
    description: "Online storefronts, marketplaces, dropshipping, fulfillment and payment integrations.",
    descriptionAr: "متاجر إلكترونية، أسواق رقمية، دروبشيبنغ، تجهيز طلبات وربط مدفوعات.",
    subCategories: ["Niche Online Storefronts", "B2B Wholesale Platforms", "Multi-vendor Digital Marketplaces", "Dropshipping Businesses", "E-commerce Warehousing and Order Fulfillment", "Payment Gateway and FinTech Integrations"],
    defaultModules: ["ecommerce", "pos_retail", "crm", "inventory", "sales", "purchase", "accounting", "transport", "reports", "settings"],
    groupTitles: commonGroups,
  },
  {
    value: "manufacturing_industrial",
    label: "Manufacturing & Industrial Production",
    labelAr: "التصنيع والإنتاج الصناعي",
    icon: "Factory",
    color: "text-indigo-600 bg-indigo-50",
    description: "Factories for packaging, construction materials, plastics, textiles, food and assemblies.",
    descriptionAr: "مصانع التغليف، مواد البناء، البلاستيك، النسيج، الأغذية والتجميع.",
    subCategories: ["Packaging and Styrofoam Products", "Construction Materials - Cement, Steel, Bricks", "Plastics and Petrochemical Products", "Textile and Garments Manufacturing", "Food Processing and Packaging", "Machinery and Spare Parts Assembly"],
    complianceNotes: ["Batch/lot tracking for food and chemicals", "Industrial license and safety document storage"],
    defaultModules: ["manufacturing", "inventory", "purchase", "sales", "accounting", "hrm", "assets", "reports", "settings"],
    groupTitles: [...commonGroups, "MANUFACTURING"],
  },
  {
    value: "digital_marketing_media",
    label: "Digital Marketing & Media Services",
    labelAr: "التسويق الرقمي والخدمات الإعلامية",
    icon: "Sparkles",
    color: "text-rose-600 bg-rose-50",
    description: "Agencies for AI video, ads, social, SEO, brand design, influencers and PR.",
    descriptionAr: "وكالات فيديو وذكاء اصطناعي، إعلانات، سوشيال، SEO، هوية، مؤثرين وعلاقات عامة.",
    subCategories: ["AI Video Content Creation and Commercial Ads", "Social Media Management", "SEO and Search Engine Marketing", "Brand Identity and Graphic Design", "Influencer Marketing Agencies", "Digital PR and Corporate Communications"],
    defaultModules: ["crm", "projects", "helpdesk", "sales", "accounting", "hrm", "reports", "settings"],
    groupTitles: [...commonGroups, "PROJECTS"],
  },
  {
    value: "logistics_supply_chain",
    label: "Logistics & Supply Chain",
    labelAr: "اللوجستيات وسلاسل الإمداد",
    icon: "Truck",
    color: "text-emerald-600 bg-emerald-50",
    description: "Last-mile, freight forwarding, cold chain, customs, fleet and courier operations.",
    descriptionAr: "توصيل آخر ميل، شحن، سلسلة تبريد، تخليص جمركي، أسطول وبريد سريع.",
    subCategories: ["Last-Mile Delivery Services", "Freight Forwarding and Cargo - Air, Sea, Land", "Cold Chain Storage for Food and Medicines", "Customs Brokerage and Clearance Services", "Fleet Management and Tracking", "Courier and Express Mail Services"],
    complianceNotes: ["Vehicle, driver and temperature-log document expiry alerts"],
    defaultModules: ["transport", "assets", "inventory", "crm", "sales", "purchase", "accounting", "hrm", "reports", "settings"],
    groupTitles: commonGroups,
  },
  {
    value: "healthcare_medical",
    label: "Healthcare & Medical Services",
    labelAr: "الرعاية الصحية والخدمات الطبية",
    icon: "Stethoscope",
    color: "text-teal-600 bg-teal-50",
    description: "Telemedicine, clinics, equipment, pharmacies, healthcare IT and home care.",
    descriptionAr: "طب عن بعد، عيادات، معدات، صيدليات، أنظمة صحية ورعاية منزلية.",
    subCategories: ["Telemedicine and Online Health Platforms", "Specialized Clinics - Dental, Skin, Eye", "Medical Equipment and Surgical Supplies", "Retail Pharmacies and Drug Stores", "Healthcare IT and Patient Record Management", "Home Care and Rehabilitation Services"],
    complianceNotes: ["Patient privacy controls", "NPHIES-ready insurance architecture", "Batch/expiry for medicines"],
    defaultModules: ["healthcare", "pos_pharmacy", "inventory", "crm", "sales", "purchase", "accounting", "hrm", "reports", "settings"],
    groupTitles: commonGroups,
  },
  {
    value: "real_estate_property",
    label: "Real Estate & Property",
    labelAr: "العقار وإدارة الأملاك",
    icon: "Home",
    color: "text-pink-600 bg-pink-50",
    description: "Property management, brokerage, development, short rentals, FM and valuation.",
    descriptionAr: "إدارة أملاك، وساطة، تطوير تجاري، إيجار قصير، صيانة وتقييم.",
    subCategories: ["Property Management Services", "Real Estate Brokerage", "Commercial Real Estate Development", "Short-term Rentals and Vacation Homes", "Facility Management", "Real Estate Appraisals and Valuation"],
    complianceNotes: ["Ejar reference storage where applicable", "Maintenance work-order audit trail"],
    defaultModules: ["real_estate", "crm", "sales", "accounting", "projects", "helpdesk", "reports", "settings"],
    groupTitles: commonGroups,
  },
  {
    value: "construction_engineering",
    label: "Construction & Engineering",
    labelAr: "المقاولات والهندسة",
    icon: "Factory",
    color: "text-orange-600 bg-orange-50",
    description: "Civil, architecture, MEP, interior fit-out, landscaping and project management.",
    descriptionAr: "مدني، معماري، MEP، تصميم داخلي، تنسيق مواقع وإدارة مشاريع.",
    subCategories: ["Civil Contracting and Infrastructure Development", "Architectural Design Services", "MEP Contracting", "Interior Design and Fit-outs", "Landscaping and Urban Planning", "Construction Project Management"],
    complianceNotes: ["BOQ, retention, progress certificates and subcontractor ledgers"],
    defaultModules: ["construction", "projects", "inventory", "purchase", "sales", "accounting", "hrm", "assets", "reports", "settings"],
    groupTitles: [...commonGroups, "PROJECTS"],
  },
  {
    value: "tourism_travel",
    label: "Travel, Tours, Hajj & Umrah",
    labelAr: "السفر والسياحة والحج والعمرة",
    icon: "Globe",
    color: "text-cyan-600 bg-cyan-50",
    description: "Travel agencies, ticketing, Hajj/Umrah packages, domestic tours, guides, adventure tourism and corporate travel.",
    descriptionAr: "وكالات السفر والتذاكر وباقات الحج والعمرة والرحلات الداخلية والمرشدين وسياحة المغامرات وسفر الشركات.",
    subCategories: [
      "Travel Agencies and Ticketing",
      "Hajj Tour Operators",
      "Umrah Package Operators",
      "Domestic Leisure Tourism - AlUla, NEOM, Red Sea, Diriyah",
      "Professional Tour Guide Services",
      "Adventure and Eco-Tourism",
      "Corporate Travel Management",
      "Visa and Document Service Offices",
      "Hotel and Transport Package Sellers",
      "Group Tours and Passenger Manifests",
      "Pilgrim Transport Coordination",
      "Travel Supplier and Commission Management",
    ],
    subCategoriesAr: [
      "وكالات السفر وإصدار التذاكر",
      "مشغلو رحلات الحج",
      "مشغلو باقات العمرة",
      "السياحة الداخلية - العلا، نيوم، البحر الأحمر، الدرعية",
      "خدمات المرشدين السياحيين",
      "سياحة المغامرات والبيئة",
      "إدارة سفر الشركات",
      "مكاتب خدمات التأشيرات والمستندات",
      "بيع باقات الفنادق والنقل",
      "رحلات المجموعات وكشوف المسافرين",
      "تنسيق نقل الحجاج والمعتمرين",
      "إدارة الموردين والعمولات السياحية",
    ],
    complianceNotes: ["Passenger manifests, passport/document controls, supplier settlements, package costing and installment billing"],
    workflowHighlights: ["package builder", "passenger manifest", "visa checklist", "hotel allocation", "transport allocation", "supplier settlement", "installment billing"],
    entityTypes: ["travel_package", "passenger", "itinerary", "supplier_booking", "group_manifest"],
    onboardingQuestions: ["Do you sell Hajj/Umrah packages?", "Do you issue tickets?", "Do you manage group passenger manifests?", "Do you settle with hotels or transport suppliers?"],
    saudiMarketNotes: ["Support domestic tourism packages for AlUla, NEOM, Red Sea and Diriyah style routes", "Keep passenger documents and supplier settlements auditable"],
    defaultModules: ["travel", "crm", "sales", "purchase", "accounting", "transport", "reports", "settings"],
    groupTitles: commonGroups,
  },
  {
    value: "hospitality_accommodation",
    label: "Hospitality & Accommodation",
    labelAr: "الضيافة والإقامة",
    icon: "Hotel",
    color: "text-violet-600 bg-violet-50",
    description: "Hotels, resorts, serviced apartments, boutique hotels, venues and housekeeping.",
    descriptionAr: "فنادق، منتجعات، شقق مخدومة، بوتيك، قاعات وخدمات نظافة.",
    subCategories: ["Hotel and Resort Management", "Serviced Apartments", "Boutique Hotels", "Hospitality Training and Consulting", "Event Venues and Banquet Halls", "Cleaning and Housekeeping Services"],
    defaultModules: ["hotel", "pos_restaurant", "crm", "sales", "purchase", "accounting", "hrm", "helpdesk", "reports", "settings"],
    groupTitles: commonGroups,
  },
  {
    value: "food_beverage",
    label: "Food & Beverage",
    labelAr: "الأغذية والمشروبات",
    icon: "UtensilsCrossed",
    color: "text-red-600 bg-red-50",
    description: "Restaurants, fast food, cloud kitchens, cafes, catering, trucks and pop-ups.",
    descriptionAr: "مطاعم، وجبات سريعة، مطابخ سحابية، كافيهات، تموين وعربات طعام.",
    subCategories: ["Fine Dining Restaurants", "Fast Food and Casual Dining", "Cloud Kitchens", "Coffee Shops and Specialty Cafes", "Corporate and Event Catering Services", "Food Trucks and Pop-up Stalls"],
    complianceNotes: ["Recipe costing, expiry, food safety checklists and shift closing"],
    defaultModules: ["pos_restaurant", "inventory", "purchase", "sales", "accounting", "hrm", "crm", "reports", "settings"],
    groupTitles: commonGroups,
  },
  {
    value: "education_edtech",
    label: "Education & EdTech",
    labelAr: "التعليم والتقنية التعليمية",
    icon: "GraduationCap",
    color: "text-sky-600 bg-sky-50",
    description: "E-learning, tutoring, training centers, schools, corporate training and placements.",
    descriptionAr: "تعليم إلكتروني، دروس، مراكز تدريب، مدارس، تدريب شركات واستشارات تعليمية.",
    subCategories: ["E-learning and Online Tutoring Platforms", "Vocational and Technical Training Centers", "Private Schools and Nurseries", "Corporate Training and Skill Development", "Language Institutes", "Educational Consulting and Student Placements"],
    defaultModules: ["education", "crm", "sales", "accounting", "hrm", "reports", "settings"],
    groupTitles: commonGroups,
  },
  {
    value: "professional_consulting",
    label: "Professional & Consulting Services",
    labelAr: "الخدمات المهنية والاستشارية",
    icon: "Briefcase",
    color: "text-slate-600 bg-slate-50",
    description: "Legal, accounting, tax, business setup, HR/payroll and management consulting.",
    descriptionAr: "قانون، محاسبة، ضرائب، تأسيس شركات، موارد بشرية واستشارات إدارية.",
    subCategories: ["Law Firms and Legal Consulting", "Accounting, Auditing and Bookkeeping", "Tax and VAT Advisory", "Business Setup and Company Formation", "HR, Payroll and Talent Acquisition", "Business Management and Strategy Consulting"],
    defaultModules: ["crm", "projects", "helpdesk", "sales", "accounting", "hrm", "reports", "settings"],
    groupTitles: [...commonGroups, "PROJECTS"],
  },
  {
    value: "offline_retail_consumer",
    label: "Retail & Consumer Goods",
    labelAr: "التجزئة والسلع الاستهلاكية",
    icon: "Store",
    color: "text-blue-600 bg-blue-50",
    description: "Supermarkets, fashion, electronics, cosmetics, furniture and perfumes.",
    descriptionAr: "سوبرماركت، أزياء، إلكترونيات، تجميل، أثاث وعطور.",
    subCategories: ["Supermarkets and Grocery Stores", "Fashion and Apparel Boutiques", "Electronics and Home Appliances", "Cosmetics and Personal Care Stores", "Furniture and Home Decor Showrooms", "Traditional Perfumes - Oud, Attar"],
    defaultModules: ["pos_retail", "crm", "inventory", "sales", "purchase", "accounting", "hrm", "reports", "settings"],
    groupTitles: commonGroups,
  },
  {
    value: "events_entertainment",
    label: "Event Management & Entertainment",
    labelAr: "إدارة الفعاليات والترفيه",
    icon: "Sparkles",
    color: "text-purple-600 bg-purple-50",
    description: "MICE, concerts, rentals, weddings, esports and family entertainment.",
    descriptionAr: "معارض ومؤتمرات، حفلات، تأجير معدات، زفاف، رياضات إلكترونية وترفيه عائلي.",
    subCategories: ["Corporate Events and Exhibitions", "Concerts and Live Entertainment Management", "Event Equipment and Sound System Rentals", "Wedding Planning Services", "Gaming and Esports Arenas", "Theme Parks and Family Entertainment Centers"],
    defaultModules: ["projects", "crm", "inventory", "sales", "purchase", "accounting", "hrm", "reports", "settings"],
    groupTitles: [...commonGroups, "PROJECTS"],
  },
  {
    value: "financial_fintech",
    label: "Financial Services & FinTech",
    labelAr: "الخدمات المالية والتقنية المالية",
    icon: "Briefcase",
    color: "text-emerald-600 bg-emerald-50",
    description: "Wallets, lending, insurance brokerage, advisory, blockchain and wealth management.",
    descriptionAr: "محافظ، تمويل، وساطة تأمين، استثمار، بلوكتشين وإدارة ثروات.",
    subCategories: ["Digital Wallets and Mobile Payments", "Microfinance and Business Lending", "Insurance Brokerage", "Investment Advisory", "Cryptocurrency and Blockchain Solutions", "Wealth Management Services"],
    complianceNotes: ["SAMA/regulator licensing flags", "Sensitive audit logs and approval workflows"],
    defaultModules: ["crm", "sales", "accounting", "documents", "reports", "settings"],
    groupTitles: commonGroups,
  },
  {
    value: "agriculture_agritech",
    label: "Agriculture & AgriTech",
    labelAr: "الزراعة والتقنية الزراعية",
    icon: "Store",
    color: "text-lime-600 bg-lime-50",
    description: "Hydroponics, dates, poultry, dairy, equipment, organic food and agro-chemicals.",
    descriptionAr: "زراعة مائية، تمور، دواجن، ألبان، معدات، أغذية عضوية وأسمدة.",
    subCategories: ["Hydroponics and Vertical Farming", "Date Palm Cultivation and Export", "Poultry and Dairy Farming", "Agricultural Equipment Supply", "Organic Food Production", "Fertilizer and Agro-chemical Supply"],
    defaultModules: ["inventory", "manufacturing", "purchase", "sales", "accounting", "hrm", "assets", "reports", "settings"],
    groupTitles: [...commonGroups, "MANUFACTURING"],
  },
  {
    value: "automotive_transportation",
    label: "Automotive & Transportation Services",
    labelAr: "السيارات وخدمات النقل",
    icon: "Wrench",
    color: "text-amber-600 bg-amber-50",
    description: "Rental, workshops, spare parts, EV charging, limousine, car wash and detailing.",
    descriptionAr: "تأجير، ورش، قطع غيار، شحن كهربائي، ليموزين، غسيل وتلميع.",
    subCategories: ["Car Rental and Leasing", "Auto Repair and Maintenance Workshops", "Spare Parts and Accessories Retail", "EV Charging Infrastructure", "VIP Chauffeur and Limousine Services", "Car Wash and Auto Detailing"],
    defaultModules: ["workshop", "transport", "pos_retail", "inventory", "crm", "sales", "purchase", "accounting", "hrm", "reports", "settings"],
    groupTitles: [...commonGroups, "WORKSHOP"],
  },
  {
    value: "clean_energy_environment",
    label: "Clean Energy & Environmental Services",
    labelAr: "الطاقة النظيفة والخدمات البيئية",
    icon: "Zap",
    color: "text-green-600 bg-green-50",
    description: "Solar, energy audits, waste, recycling, water treatment and green building.",
    descriptionAr: "طاقة شمسية، تدقيق طاقة، نفايات، تدوير، معالجة مياه ومباني خضراء.",
    subCategories: ["Solar Panel Installation and Maintenance", "Renewable Energy Consulting", "Energy Efficiency Audits", "Waste Management and Recycling", "Water Treatment and Desalination Services", "Green Building Consulting"],
    defaultModules: ["projects", "helpdesk", "assets", "inventory", "sales", "purchase", "accounting", "hrm", "reports", "settings"],
    groupTitles: [...commonGroups, "PROJECTS"],
  },
  {
    value: "wholesale_import_export",
    label: "Wholesale, Import & Export Trading",
    labelAr: "الجملة والاستيراد والتصدير",
    icon: "Truck",
    color: "text-cyan-600 bg-cyan-50",
    description: "Garments, electronics, building materials, FMCG, medical supplies and industrial tools.",
    descriptionAr: "ملابس، إلكترونيات، مواد بناء، مواد غذائية، مستلزمات طبية وأدوات صناعية.",
    subCategories: ["Women's Apparel and Garments Wholesale", "Electronics and Mobile Accessories Trading", "Building Materials Wholesale", "Food Stuff and FMCG Distribution", "Medical and Surgical Equipment Trading", "Industrial Tools and Hardware Wholesale"],
    complianceNotes: ["Landed cost, supplier documents, batch/expiry for food and medical goods"],
    defaultModules: ["pos_wholesale", "inventory", "crm", "sales", "purchase", "accounting", "transport", "reports", "settings"],
    groupTitles: commonGroups,
  },
  {
    value: "workshop",
    label: "Automotive Workshop",
    labelAr: "ورشة سيارات",
    icon: "Wrench",
    color: "text-amber-600 bg-amber-50",
    description: "Job cards, vehicles, technicians, bays, parts and service reminders.",
    descriptionAr: "بطاقات عمل، مركبات، فنيين، رافعات، قطع غيار وتذكيرات صيانة.",
    defaultModules: ["workshop", "pos_retail", "crm", "inventory", "sales", "purchase", "accounting", "hrm", "reports", "settings"],
    groupTitles: [...commonGroups, "WORKSHOP"],
  },
  {
    value: "hostel",
    label: "Hostel / Staff Accommodation",
    labelAr: "سكن / نزل",
    icon: "Hotel",
    color: "text-violet-600 bg-violet-50",
    description: "Rooms, bookings, rent billing, housekeeping, maintenance and HR.",
    descriptionAr: "غرف، حجوزات، فواتير إيجار، نظافة، صيانة وموارد بشرية.",
    defaultModules: ["hotel", "real_estate", "crm", "sales", "accounting", "hrm", "reports", "settings"],
    groupTitles: commonGroups,
  },
  {
    value: "hotel",
    label: "Hotel / Hospitality",
    labelAr: "فندق / ضيافة",
    icon: "Hotel",
    color: "text-purple-600 bg-purple-50",
    description: "Rooms, bookings, housekeeping, folio billing and restaurant POS.",
    descriptionAr: "غرف، حجوزات، نظافة، فوترة وحسابات مطعم.",
    defaultModules: ["hotel", "pos_restaurant", "crm", "sales", "accounting", "inventory", "hrm", "reports", "settings"],
    groupTitles: commonGroups,
  },
  {
    value: "hospital",
    label: "Hospital / Clinic",
    labelAr: "مستشفى / عيادة",
    icon: "Stethoscope",
    color: "text-teal-600 bg-teal-50",
    description: "Patients, appointments, EMR, prescriptions, insurance and billing.",
    descriptionAr: "مرضى، مواعيد، ملف طبي، وصفات، تأمين وفوترة.",
    defaultModules: ["healthcare", "pos_pharmacy", "crm", "inventory", "sales", "purchase", "accounting", "hrm", "reports", "settings"],
    groupTitles: commonGroups,
  },
  {
    value: "construction",
    label: "Construction",
    labelAr: "مقاولات",
    icon: "Factory",
    color: "text-orange-600 bg-orange-50",
    description: "Projects, BOQ, contracts, site reports, materials and subcontractors.",
    descriptionAr: "مشاريع، جدول كميات، عقود، تقارير موقع، مواد ومقاولين.",
    defaultModules: ["construction", "projects", "inventory", "purchase", "sales", "accounting", "hrm", "crm", "reports", "settings"],
    groupTitles: [...commonGroups, "PROJECTS"],
  },
  {
    value: "retail",
    label: "Retail / Trading",
    labelAr: "تجزئة / تجارة",
    icon: "Store",
    color: "text-blue-600 bg-blue-50",
    description: "POS, products, stock, invoices, customers and branch sales.",
    descriptionAr: "نقطة بيع، منتجات، مخزون، فواتير، عملاء ومبيعات فروع.",
    defaultModules: ["pos_retail", "crm", "inventory", "sales", "purchase", "accounting", "hrm", "reports", "settings"],
    groupTitles: commonGroups,
  },
  {
    value: "restaurant",
    label: "Restaurant / Cafe",
    labelAr: "مطعم / مقهى",
    icon: "UtensilsCrossed",
    color: "text-red-600 bg-red-50",
    description: "Restaurant POS, tables, kitchen, delivery, recipes and shift closing.",
    descriptionAr: "نقطة بيع مطعم، طاولات، مطبخ، توصيل، وصفات وإقفال وردية.",
    defaultModules: ["pos_restaurant", "inventory", "purchase", "sales", "accounting", "hrm", "crm", "reports", "settings"],
    groupTitles: commonGroups,
  },
  {
    value: "manufacturing",
    label: "Manufacturing",
    labelAr: "تصنيع",
    icon: "Factory",
    color: "text-indigo-600 bg-indigo-50",
    description: "BOM, production, work orders, quality, stock and costing.",
    descriptionAr: "قائمة مواد، إنتاج، أوامر عمل، جودة، مخزون وتكلفة.",
    defaultModules: ["manufacturing", "inventory", "purchase", "sales", "accounting", "hrm", "reports", "settings"],
    groupTitles: [...commonGroups, "MANUFACTURING", "PROJECTS"],
  },
  {
    value: "education",
    label: "School / Training",
    labelAr: "مدرسة / تدريب",
    icon: "GraduationCap",
    color: "text-cyan-600 bg-cyan-50",
    description: "Students, admissions, fees, attendance, schedules and reports.",
    descriptionAr: "طلاب، قبول، رسوم، حضور، جداول وتقارير.",
    defaultModules: ["education", "crm", "sales", "accounting", "hrm", "reports", "settings"],
    groupTitles: commonGroups,
  },
  {
    value: "transport",
    label: "Transport / Logistics",
    labelAr: "نقل / لوجستيات",
    icon: "Truck",
    color: "text-emerald-600 bg-emerald-50",
    description: "Fleet, drivers, routes, shipments, POD and settlements.",
    descriptionAr: "أسطول، سائقين، مسارات، شحنات، إثبات تسليم وتسويات.",
    defaultModules: ["transport", "assets", "crm", "sales", "purchase", "accounting", "hrm", "reports", "settings"],
    groupTitles: commonGroups,
  },
  {
    value: "real_estate",
    label: "Real Estate",
    labelAr: "عقارات",
    icon: "Home",
    color: "text-pink-600 bg-pink-50",
    description: "Properties, leases, rent invoices, maintenance and commissions.",
    descriptionAr: "عقارات، عقود إيجار، فواتير إيجار، صيانة وعمولات.",
    defaultModules: ["real_estate", "crm", "sales", "accounting", "reports", "settings"],
    groupTitles: commonGroups,
  },
  {
    value: "services",
    label: "General Services",
    labelAr: "خدمات عامة",
    icon: "Briefcase",
    color: "text-slate-600 bg-slate-50",
    description: "CRM, projects, helpdesk, contracts, tasks and timesheets.",
    descriptionAr: "عملاء، مشاريع، دعم فني، عقود، مهام وسجلات وقت.",
    defaultModules: ["crm", "projects", "helpdesk", "sales", "accounting", "hrm", "reports", "settings"],
    groupTitles: [...commonGroups, "PROJECTS"],
  },
  {
    value: "laundry",
    label: "Laundry",
    labelAr: "مغسلة",
    icon: "Store",
    color: "text-sky-600 bg-sky-50",
    description: "Garment intake, order stages, POS, delivery and customer alerts.",
    descriptionAr: "استلام ملابس، مراحل الطلب، نقطة بيع، توصيل وتنبيهات عملاء.",
    defaultModules: ["pos_retail", "crm", "inventory", "sales", "accounting", "hrm", "reports", "settings"],
    groupTitles: commonGroups,
  },
  {
    value: "salon",
    label: "Salon / Spa",
    labelAr: "صالون / سبا",
    icon: "Sparkles",
    color: "text-rose-600 bg-rose-50",
    description: "Appointments, packages, staff commission, products and reminders.",
    descriptionAr: "مواعيد، باقات، عمولات موظفين، منتجات وتذكيرات.",
    defaultModules: ["crm", "pos_retail", "inventory", "sales", "accounting", "hrm", "reports", "settings"],
    groupTitles: commonGroups,
  },
  {
    value: "gym",
    label: "Gym / Sports Club",
    labelAr: "نادي رياضي",
    icon: "Briefcase",
    color: "text-lime-600 bg-lime-50",
    description: "Memberships, check-ins, trainers, classes, renewals and billing.",
    descriptionAr: "اشتراكات، دخول، مدربين، حصص، تجديدات وفوترة.",
    defaultModules: ["crm", "sales", "accounting", "hrm", "reports", "settings"],
    groupTitles: commonGroups,
  },
  {
    value: "pharmacy",
    label: "Pharmacy",
    labelAr: "صيدلية",
    icon: "Stethoscope",
    color: "text-emerald-600 bg-emerald-50",
    description: "Pharmacy POS, prescriptions, batches, expiry and supplier purchases.",
    descriptionAr: "نقطة بيع صيدلية، وصفات، دفعات، صلاحية ومشتريات.",
    defaultModules: ["pos_pharmacy", "inventory", "purchase", "sales", "accounting", "hrm", "reports", "settings"],
    groupTitles: commonGroups,
  },
  {
    value: "ecommerce",
    label: "E-commerce",
    labelAr: "تجارة إلكترونية",
    icon: "Store",
    color: "text-fuchsia-600 bg-fuchsia-50",
    description: "Orders, stock sync, picking, courier, COD and returns.",
    descriptionAr: "طلبات، مزامنة مخزون، تجهيز، شحن، دفع عند الاستلام ومرتجعات.",
    defaultModules: ["ecommerce", "pos_retail", "crm", "inventory", "sales", "accounting", "reports", "settings"],
    groupTitles: commonGroups,
  },
  {
    value: "mining_quarrying",
    label: "Mining, Quarrying & Industrial Services",
    labelAr: "التعدين والمحاجر والخدمات الصناعية",
    icon: "Mountain",
    color: "text-stone-600 bg-stone-50",
    description: "Quarries, stone cutting, sand/gravel, cement support, industrial maintenance and heavy equipment.",
    descriptionAr: "محاجر، قص حجر، رمل/حصى، دعم أسمنت، صيانة صناعية ومعدات ثقيلة.",
    subCategories: ["Quarry and Stone Cutting", "Sand/Gravel Supplier", "Cement Support Services", "Industrial Maintenance", "Equipment Workshop", "Drilling and Blasting Support"],
    saudiMarketNotes: ["Saudi Vision 2030 mining sector growth", "Industrial permit and safety document requirements"],
    defaultModules: ["inventory", "purchase", "sales", "accounting", "hrm", "assets", "reports", "settings"],
    groupTitles: [...commonGroups, "PROJECTS"],
  },
  {
    value: "marine_port_shipping",
    label: "Marine, Ports & Shipping Agencies",
    labelAr: "الملاحة والموانئ ووكالات الشحن",
    icon: "Ship",
    color: "text-sky-600 bg-sky-50",
    description: "Shipping agencies, boat maintenance, marine equipment, port logistics, customs and freight.",
    descriptionAr: "وكالات شحن، صيانة قوارب، معدات بحرية، لوجستيات موانئ، تخليص جمركي وشحن.",
    subCategories: ["Shipping Agency", "Boat Maintenance", "Marine Equipment", "Port Logistics", "Customs Brokerage Support", "Freight Forwarding"],
    saudiMarketNotes: ["Saudi ports expansion under Vision 2030", "Customs clearance and container demurrage tracking"],
    defaultModules: ["transport", "crm", "inventory", "sales", "purchase", "accounting", "hrm", "reports", "settings"],
    groupTitles: commonGroups,
  },
  {
    value: "veterinary_pet",
    label: "Veterinary Clinics & Pet Services",
    labelAr: "العيادات البيطرية وخدمات الحيوانات الأليفة",
    icon: "Heart",
    color: "text-emerald-600 bg-emerald-50",
    description: "Veterinary clinics, pet grooming, boarding, animal pharmacy and farm vet services.",
    descriptionAr: "عيادات بيطرية، عناية بالحيوانات، إقامة، صيدلية بيطرية وخدمات بيطرية للمزارع.",
    subCategories: ["Veterinary Clinic", "Pet Grooming", "Pet Boarding", "Animal Pharmacy", "Farm Vet Service", "Pet Training and Care"],
    saudiMarketNotes: ["Growing pet ownership in Saudi Arabia", "Vaccination schedule and medical record requirements"],
    defaultModules: ["healthcare", "pos_pharmacy", "crm", "inventory", "sales", "purchase", "accounting", "hrm", "reports", "settings"],
    groupTitles: [...commonGroups, "HEALTHCARE"],
  },
  {
    value: "nonprofit_charity",
    label: "Nonprofit & Charity Operations",
    labelAr: "المنظمات غير الربحية والجمعيات الخيرية",
    icon: "HeartHandshake",
    color: "text-emerald-600 bg-emerald-50",
    description: "Charities, NGOs, community organizations, donation campaigns, volunteer programs and fund management.",
    descriptionAr: "جمعيات خيرية، منظمات غير ربحية، حملات تبرعات، برامج تطوعية وإدارة أموال.",
    subCategories: ["Charity Organization", "NGO and Community Organization", "Donation Campaign Management", "Beneficiary Profile and Case Management", "Volunteer Program Scheduling", "Mosque and Community Support"],
    saudiMarketNotes: ["Saudi non-profit sector regulation by Ministry of Human Resources", "Zakat/Sadaqah receipt and fund tracking"],
    defaultModules: ["crm", "accounting", "hrm", "sales", "reports", "settings", "documents"],
    groupTitles: commonGroups,
  },
  {
    value: "tailoring_fashion",
    label: "Tailoring, Fashion & Textile",
    labelAr: "الخياطة والأزياء والنسيج",
    icon: "Scissors",
    color: "text-pink-600 bg-pink-50",
    description: "Tailors, abaya shops, uniform suppliers, fabric shops, boutiques and alteration services.",
    descriptionAr: "خياطة، محلات عباءات، موردي زي موحد، محلات أقمشة، بوتيك وخدمات تعديل.",
    subCategories: ["Tailor Shop", "Abaya Shop", "Uniform Supplier", "Fabric Shop", "Boutique and Alteration", "Textile Wholesale"],
    saudiMarketNotes: ["High demand for abaya and uniform tailoring in Saudi", "Measurement profile reuse for repeat customers"],
    defaultModules: ["pos_retail", "inventory", "crm", "sales", "purchase", "accounting", "reports", "settings"],
    groupTitles: commonGroups,
  },
  {
    value: "gold_jewelry_watches",
    label: "Gold, Jewelry & Watches",
    labelAr: "الذهب والمجوهرات والساعات",
    icon: "Gem",
    color: "text-yellow-600 bg-yellow-50",
    description: "Gold retail, jewelry workshops, diamond shops, watch shops, silver and wholesale jewelry.",
    descriptionAr: "بيع ذهب، ورش مجوهرات، محلات ألماس، ساعات، فضة ومجوهرات جملة.",
    subCategories: ["Gold Retail", "Jewelry Workshop", "Diamond Shop", "Watch Shop", "Silver Shop", "Wholesale Jewelry"],
    saudiMarketNotes: ["Gold souk tradition in Saudi Arabia", "Weight/carat tracking and daily gold rate updates"],
    defaultModules: ["pos_retail", "inventory", "crm", "sales", "purchase", "accounting", "reports", "settings"],
    groupTitles: commonGroups,
  },
  {
    value: "electronics_repair",
    label: "Electronics, Mobiles & Repair",
    labelAr: "الإلكترونيات والجوالات والإصلاح",
    icon: "Monitor",
    color: "text-blue-600 bg-blue-50",
    description: "Mobile shops, electronics retail, computer shops, phone/laptop repair and gaming shops.",
    descriptionAr: "محالات جوالات، إلكترونيات، كمبيوتر، إصلاح جوالات/لابتوب ومحلات ألعاب.",
    subCategories: ["Mobile Shop", "Electronics Retail", "Computer Shop", "Phone Repair", "Laptop Repair", "Gaming and Accessories"],
    saudiMarketNotes: ["IMEI tracking and warranty management required", "Installment sale option for high-value items"],
    defaultModules: ["pos_retail", "workshop", "inventory", "crm", "sales", "purchase", "accounting", "reports", "settings"],
    groupTitles: [...commonGroups, "WORKSHOP"],
  },
  {
    value: "furniture_carpentry",
    label: "Furniture, Carpentry & Interior Design",
    labelAr: "الأثاث والنجارة والتصميم الداخلي",
    icon: "Sofa",
    color: "text-amber-600 bg-amber-50",
    description: "Furniture retail, carpentry workshops, kitchen cabinets, interior design, curtains and upholstery.",
    descriptionAr: "أثاث، نجارة، مطابخ، تصميم داخلي، ستائر وتنجيد.",
    subCategories: ["Furniture Retail", "Carpentry Workshop", "Kitchen Cabinets", "Interior Design", "Curtain and Upholstery", "Mattress Shop"],
    saudiMarketNotes: ["High demand for custom furniture and kitchen cabinets", "Site measurement and installation workflow"],
    defaultModules: ["manufacturing", "inventory", "projects", "crm", "sales", "purchase", "accounting", "hrm", "reports", "settings"],
    groupTitles: [...commonGroups, "MANUFACTURING", "PROJECTS"],
  },
  {
    value: "printing_signage",
    label: "Printing, Signage & Advertising Production",
    labelAr: "الطباعة واللافتات والإنتاج الإعلاني",
    icon: "Printer",
    color: "text-cyan-600 bg-cyan-50",
    description: "Digital printing, offset, signage, vehicle branding, uniform printing and packaging.",
    descriptionAr: "طباعة رقمية، أوفست، لافتات، تلبيس مركبات، طباعة زي موحد وتغليف.",
    subCategories: ["Digital Printing", "Offset Printing", "Signage and Billboards", "Vehicle Branding", "Uniform Printing", "Packaging Printing"],
    saudiMarketNotes: ["Artwork approval and revision tracking essential", "Size/material based quoting system"],
    defaultModules: ["manufacturing", "inventory", "projects", "crm", "sales", "purchase", "accounting", "hrm", "reports", "settings"],
    groupTitles: [...commonGroups, "MANUFACTURING", "PROJECTS"],
  },
  {
    value: "water_sanitation_waste",
    label: "Water, Sanitation & Waste Management",
    labelAr: "المياه والصرف الصحي وإدارة النفايات",
    icon: "Droplets",
    color: "text-blue-600 bg-blue-50",
    description: "Water tankers, bottled water delivery, waste collection, recycling and septic services.",
    descriptionAr: "صهاريج مياه، توصيل مياه معبأة، جمع نفايات، تدوير وخدمات بالوعات.",
    subCategories: ["Water Tanker Services", "Bottled Water Delivery", "Waste Collection", "Recycling Services", "Septic Services", "Industrial Waste Management"],
    saudiMarketNotes: ["Subscription billing for water/waste services", "Route optimization and vehicle compliance"],
    defaultModules: ["transport", "assets", "crm", "sales", "purchase", "accounting", "hrm", "reports", "settings"],
    groupTitles: commonGroups,
  },
  {
    value: "all",
    label: "Super Admin / All Services",
    labelAr: "المشرف العام / كل الخدمات",
    icon: "Globe",
    color: "text-violet-600 bg-violet-50",
    description: "Show every service, vertical and platform control.",
    descriptionAr: "عرض كل الخدمات والقطاعات وأدوات التحكم.",
    defaultModules: ["all"],
    groupTitles: allGroups,
  },
];

export const MODULE_CHOICES = [
  { id: "accounting", label: "Accounting", labelAr: "المحاسبة" },
  { id: "inventory", label: "Inventory", labelAr: "المخزون" },
  { id: "sales", label: "Sales & Invoices", labelAr: "المبيعات والفواتير" },
  { id: "purchase", label: "Purchase", labelAr: "المشتريات" },
  { id: "hrm", label: "HRM & Payroll", labelAr: "الموارد البشرية والرواتب" },
  { id: "crm", label: "CRM", labelAr: "إدارة العملاء" },
  { id: "reports", label: "Reports", labelAr: "التقارير" },
  { id: "documents", label: "Documents", labelAr: "المستندات" },
  { id: "pos_retail", label: "Retail POS", labelAr: "نقطة بيع التجزئة" },
  { id: "pos_restaurant", label: "Restaurant POS", labelAr: "نقطة بيع المطعم" },
  { id: "pos_pharmacy", label: "Pharmacy POS", labelAr: "نقطة بيع الصيدلية" },
  { id: "pos_wholesale", label: "Wholesale POS", labelAr: "نقطة بيع الجملة" },
  { id: "workshop", label: "Workshop", labelAr: "الورشة" },
  { id: "construction", label: "Construction", labelAr: "المقاولات" },
  { id: "healthcare", label: "Clinic / Healthcare", labelAr: "العيادة / الصحة" },
  { id: "hotel", label: "Hotel / Hospitality", labelAr: "فندق / ضيافة" },
  { id: "hostel", label: "Hostel / Staff Accommodation", labelAr: "سكن / نزل" },
  { id: "pharmacy", label: "Pharmacy", labelAr: "صيدلية" },
  { id: "real_estate", label: "Real Estate", labelAr: "العقارات" },
  { id: "transport", label: "Transport", labelAr: "النقل" },
  { id: "education", label: "Education", labelAr: "التعليم" },
  { id: "manufacturing", label: "Manufacturing", labelAr: "التصنيع" },
  { id: "projects", label: "Projects", labelAr: "المشاريع" },
  { id: "helpdesk", label: "Helpdesk", labelAr: "الدعم الفني" },
  { id: "assets", label: "Assets / Fleet", labelAr: "الأصول / الأسطول" },
  { id: "settings", label: "Settings", labelAr: "الإعدادات" },
];

const CATEGORY_ALIASES: Record<string, BusinessCategory> = {
  healthcare: "hospital",
  clinic: "hospital",
  healthcare_medical: "hospital",
  hospitality: "hotel",
  accommodation: "hotel",
  hospitality_accommodation: "hotel",
  logistics: "transport",
  logistics_supply_chain: "transport",
  wholesale: "retail",
  wholesale_import_export: "retail",
  offline_retail_consumer: "retail",
  technology: "services",
  professional_consulting: "services",
  digital_marketing_media: "services",
  clean_energy_environment: "services",
  financial_fintech: "services",
  events_entertainment: "services",
  auto_workshop: "workshop",
  automotive_transportation: "workshop",
  realestate: "real_estate",
  real_estate_property: "real_estate",
  construction_engineering: "construction",
  education_edtech: "education",
  manufacturing_industrial: "manufacturing",
  agriculture_agritech: "manufacturing",
  ecommerce_online_retail: "ecommerce",
  tailoring_fashion: "retail",
  gold_jewelry_watches: "retail",
  electronics_repair: "workshop",
  furniture_carpentry: "manufacturing",
  printing_signage: "manufacturing",
  mining_quarrying: "services",
  marine_port_shipping: "transport",
  veterinary_pet: "hospital",
  nonprofit_charity: "services",
  water_sanitation_waste: "transport",
};

export function normalizeBusinessCategory(category?: string | null): BusinessCategory {
  if (!category) return "all";
  if (CATEGORY_ALIASES[category]) return CATEGORY_ALIASES[category];
  return BUSINESS_CATALOG.some((item) => item.value === category) ? (category as BusinessCategory) : "all";
}

export function getBusinessCatalogItem(category?: string | null) {
  const exact = BUSINESS_CATALOG.find((item) => item.value === category);
  if (exact) return exact;
  const normalized = normalizeBusinessCategory(category);
  return BUSINESS_CATALOG.find((item) => item.value === normalized) ?? BUSINESS_CATALOG.find((item) => item.value === "all")!;
}

export function getSaudiBusinessCoverage(category?: string | null) {
  const exact = SAUDI_BUSINESS_COVERAGE_MATRIX.find((item) => item.category === category);
  if (exact) return exact;
  const normalized = normalizeBusinessCategory(category);
  return SAUDI_BUSINESS_COVERAGE_MATRIX.find((item) => normalizeBusinessCategory(item.category) === normalized);
}

export function getStoredExactCategory(): BusinessCategory {
  const profile = getStoredBusinessProfile();
  const exactCategory = (profile.businessCategory || profile.businessType || profile.industry || "all") as string;
  return BUSINESS_CATALOG.some((item) => item.value === exactCategory)
    ? (exactCategory as BusinessCategory)
    : normalizeBusinessCategory(exactCategory);
}

export function getStoredBusinessProfile(): BusinessProfile {
  try {
    const raw = localStorage.getItem(COMPANY_PROFILE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveBusinessSelection(category: BusinessCategory, selectedModules: string[], themeColor?: string, businessSubCategory?: string) {
  const current = getStoredBusinessProfile();
  const data: Record<string, any> = {
    ...current,
    businessCategory: category,
    businessType: category,
    industry: category,
    ...(businessSubCategory ? { businessSubCategory } : {}),
    selectedModules,
    enabledModules: selectedModules,
    modulePresetUpdatedAt: new Date().toISOString(),
  };
  if (themeColor) data.themeColor = themeColor;
  localStorage.setItem(COMPANY_PROFILE_STORAGE_KEY, JSON.stringify(data));
}

export function getStoredCategory(): BusinessCategory {
  const profile = getStoredBusinessProfile();
  return normalizeBusinessCategory((profile.businessCategory || profile.businessType || profile.industry || "all") as string);
}

export function getDefaultModulesForCategory(category: BusinessCategory): string[] {
  const item = getBusinessCatalogItem(category);
  if (item.value === "all") return Object.keys(MODULE_PATH_PREFIXES);
  return Array.from(new Set([...CORE_MODULE_IDS, ...item.defaultModules]));
}

export function getEnabledModuleIds(category?: BusinessCategory): string[] {
  const profile = getStoredBusinessProfile();
  const cat = category || getStoredCategory();
  const modules = profile.selectedModules || profile.enabledModules;
  if (cat === "all" || modules?.includes("all")) return Object.keys(MODULE_PATH_PREFIXES);
  return modules?.length ? Array.from(new Set([...CORE_MODULE_IDS, ...modules])) : getDefaultModulesForCategory(cat);
}

export function getEnabledSidebarPathPrefixes(category?: BusinessCategory): string[] {
  return getEnabledModuleIds(category).flatMap((moduleId) => MODULE_PATH_PREFIXES[moduleId] || []);
}

export function getVisibleGroupTitles(category?: BusinessCategory): string[] {
  return getBusinessCatalogItem(category || getStoredCategory()).groupTitles;
}
