// ============================================================================
// RAWAFED UNIVERSAL SAAS - COMPLETE SAUDI BUSINESS CATEGORIES
// Comprehensive catalog of 45+ Saudi market business types
// ============================================================================

import { BusinessCatalogItem, BusinessCategory } from "./businessCatalog";

// AUTOMOTIVE & WORKSHOP CATEGORIES
export const AUTOMOTIVE_CATEGORIES: BusinessCatalogItem[] = [
  {
    value: "auto_parts" as BusinessCategory,
    label: "Auto Spare Parts & Tire Center",
    labelAr: "قطع غيار السيارات ومركز الإطارات",
    icon: "Settings",
    color: "from-orange-600 to-red-700",
    description: "VIN lookup, part compatibility, tire/battery sales, warranty tracking",
    descriptionAr: "البحث عن رقم الهيكل، توافق القطع، مبيعات الإطارات والبطاريات، تتبع الضمان",
    subCategories: [
      "New Spare Parts",
      "Used Spare Parts", 
      "Tires",
      "Batteries",
      "Oils & Lubricants",
      "Accessories",
      "Wholesale Parts"
    ],
    subCategoriesAr: [
      "قطع غيار جديدة",
      "قطع غيار مستعملة",
      "إطارات",
      "بطاريات",
      "زيوت ومواد تشحيم",
      "اكسسوارات",
      "قطع غيار بالجملة"
    ],
    complianceNotes: ["VAT on sales", "Product warranty terms", "Return policy", "Supplier documentation"],
    workflowHighlights: ["VIN-based search", "Compatibility matrix", "Shelf location tracking", "Warranty periods", "Serial numbers (batteries)"],
    entityTypes: ["spare_part", "tire", "battery", "vehicle_compatibility"],
    defaultModules: ["pos_retail", "inventory", "sales", "purchase", "crm"],
    groupTitles: ["Automotive", "Retail", "Workshop Support"],
    saudiMarketNotes: [
      "High demand for Toyota, Hyundai, GMC parts",
      "Tire seasonal demand (summer heat)",
      "Battery replacement surge in extreme weather",
      "OEM vs aftermarket price sensitivity"
    ]
  },
  {
    value: "workshop" as BusinessCategory,
    label: "Auto Workshop & Garage",
    labelAr: "ورشة صيانة السيارات",
    icon: "Wrench",
    color: "from-blue-600 to-indigo-700",
    description: "Job cards, bay management, technician assignment, parts requisition, service reminders",
    descriptionAr: "بطاقات العمل، إدارة البايات، تعيين الفنيين، طلب القطع، تذكيرات الخدمة",
    subCategories: [
      "Mechanical Repair",
      "Engine Overhaul",
      "Transmission Repair",
      "Auto Electrical",
      "AC Service",
      "Body Repair",
      "Paint Booth",
      "Detailing & Polishing",
      "Quick Service (Oil/Tire)",
      "Heavy Truck Workshop"
    ],
    subCategoriesAr: [
      "إصلاح ميكانيكي",
      "إصلاح المحرك",
      "إصلاح ناقل الحركة",
      "كهرباء السيارات",
      "صيانة المكيف",
      "إصلاح الهيكل",
      "دهان",
      "تلميع وتنظيف",
      "خدمة سريعة (زيت/إطارات)",
      "ورشة شاحنات ثقيلة"
    ],
    complianceNotes: ["Municipality workshop license", "Environmental waste disposal", "Insurance claim documentation", "Customer vehicle responsibility"],
    workflowHighlights: [
      "Vehicle intake with photos",
      "Customer approval before work",
      "Technician time tracking",
      "Parts vs labor billing",
      "Bay/lift assignment",
      "Service history per vehicle",
      "Mileage/date reminders"
    ],
    entityTypes: ["vehicle", "job_card", "bay", "inspection", "estimate", "technician_task"],
    defaultModules: ["workshop", "inventory", "sales", "purchase", "crm", "hrm"],
    groupTitles: ["Automotive", "Service Operations"],
    saudiMarketNotes: [
      "Moiboo and GarageMate are local competitors",
      "Integration with insurance companies common",
      "WhatsApp reminders critical for customer retention",
      "Bay utilization tracking for profitability",
      "Technician commission structures vary"
    ]
  }
];

// CONSTRUCTION & BUILDING CATEGORIES
export const CONSTRUCTION_CATEGORIES: BusinessCatalogItem[] = [
  {
    value: "construction" as BusinessCategory,
    label: "Construction & Contracting",
    labelAr: "المقاولات والإنشاءات",
    icon: "HardHat",
    color: "from-amber-600 to-orange-700",
    description: "Projects, BOQ, variations, payment certificates, subcontractor management, retention",
    descriptionAr: "المشاريع، جدول الكميات، الاختلافات، شهادات الدفع، إدارة المقاولين من الباطن، الاستقطاع",
    subCategories: [
      "General Building Contractor",
      "Villa Construction",
      "Commercial Construction",
      "Civil Works",
      "Road Works",
      "Excavation",
      "MEP Contracting",
      "Finishing Works",
      "Landscaping",
      "Swimming Pools"
    ],
    subCategoriesAr: [
      "مقاول عام",
      "بناء فلل",
      "إنشاءات تجارية",
      "أعمال مدنية",
      "أعمال طرق",
      "حفريات",
      "مقاولات كهروميكانيك",
      "أعمال تشطيب",
      "تنسيق حدائق",
      "مسابح"
    ],
    complianceNotes: [
      "MOMRA building permits",
      "Balady construction licenses",
      "Environmental approvals",
      "Safety certificates",
      "Contractor classification",
      "Retention 10% typical",
      "Variation approval workflow"
    ],
    workflowHighlights: [
      "BOQ estimation",
      "Project phases",
      "Material requisitions",
      "Site daily reports",
      "Subcontractor invoices",
      "Progress certificates",
      "Retention tracking",
      "Final handover"
    ],
    entityTypes: ["project", "boq_item", "variation", "payment_certificate", "site_report", "subcontractor_invoice"],
    defaultModules: ["construction", "accounting", "purchase", "inventory", "hrm", "projects"],
    groupTitles: ["Construction", "Project Management"],
    saudiMarketNotes: [
      "HAL ERP targets this vertical",
      "Vision 2030 mega-projects drive demand",
      "Strict GOSI compliance for labor",
      "Qiwa visa quotas critical",
      "Retention aging reports essential"
    ]
  },
  {
    value: "building_materials" as BusinessCategory,
    label: "Building Materials & Hardware",
    labelAr: "مواد البناء والأدوات",
    icon: "Boxes",
    color: "from-stone-600 to-slate-700",
    description: "Cement, steel, timber, tiles, tools, contractor credit accounts, bulk pricing",
    descriptionAr: "أسمنت، حديد، خشب، بلاط، أدوات، حسابات ائتمانية للمقاولين، أسعار بالجملة",
    subCategories: [
      "Cement & Blocks",
      "Steel & Rebar",
      "Timber & Plywood",
      "Paints",
      "Electrical Supplies",
      "Plumbing Supplies",
      "Tiles & Sanitaryware",
      "Doors & Windows",
      "Safety Equipment"
    ],
    subCategoriesAr: [
      "أسمنت وبلوك",
      "حديد وحديد تسليح",
      "خشب وخشب مضغوط",
      "دهانات",
      "مستلزمات كهربائية",
      "مستلزمات سباكة",
      "بلاط وأدوات صحية",
      "أبواب ونوافذ",
      "معدات السلامة"
    ],
    complianceNotes: ["VAT on materials", "Supplier compliance", "Delivery documentation", "Return policy for contractors"],
    workflowHighlights: [
      "Unit of measure conversions",
      "Bulk contractor pricing",
      "Credit limit management",
      "Delivery scheduling",
      "Project-linked sales",
      "Stock aging for slow movers"
    ],
    entityTypes: ["material_item", "contractor_account", "delivery_note", "bulk_order"],
    defaultModules: ["pos_wholesale", "inventory", "sales", "purchase", "crm", "accounting"],
    groupTitles: ["Wholesale", "Construction Support"],
    saudiMarketNotes: [
      "Contractors expect credit terms 30-60 days",
      "Delivery truck availability critical",
      "Weight-based pricing common for steel/cement",
      "Seasonal demand fluctuations"
    ]
  }
];

// HEALTHCARE & MEDICAL CATEGORIES
export const HEALTHCARE_CATEGORIES: BusinessCatalogItem[] = [
  {
    value: "medical_clinic" as BusinessCategory,
    label: "Medical Clinic & Polyclinic",
    labelAr: "عيادة طبية ومركز طبي",
    icon: "Stethoscope",
    color: "from-teal-600 to-cyan-700",
    description: "Appointments, EHR, prescriptions, lab orders, insurance claims (NPHIES-ready)",
    descriptionAr: "المواعيد، السجل الطبي، الوصفات، طلبات المختبر، مطالبات التأمين (جاهز لـ NPHIES)",
    subCategories: [
      "General Clinic",
      "Polyclinic",
      "Pediatrics",
      "Gynecology",
      "Orthopedics",
      "ENT",
      "Dermatology",
      "Ophthalmology"
    ],
    subCategoriesAr: [
      "عيادة عامة",
      "مركز طبي",
      "أطفال",
      "نساء وولادة",
      "عظام",
      "أنف وأذن وحنجرة",
      "جلدية",
      "عيون"
    ],
    complianceNotes: ["MOH clinic license", "Doctor licenses", "NPHIES eligibility/claims architecture", "Patient privacy GDPR-style", "Prescription controls"],
    workflowHighlights: [
      "Appointment booking",
      "Doctor schedule",
      "Patient queue",
      "Vital signs recording",
      "Diagnosis (ICD codes)",
      "Prescription creation",
      "Lab/radiology orders",
      "Insurance eligibility check",
      "Claim submission workflow"
    ],
    entityTypes: ["patient", "appointment", "consultation", "prescription", "lab_order", "insurance_claim"],
    defaultModules: ["healthcare", "pharmacy", "accounting", "crm", "hrm"],
    groupTitles: ["Healthcare", "Medical Services"],
    saudiMarketNotes: [
      "NPHIES integration critical for insurance billing",
      "WhatsApp appointment reminders standard",
      "Multilingual staff (Arabic, English, Urdu)",
      "Walk-in vs appointment balance varies",
      "Insurance vs cash payment split tracking"
    ]
  },
  {
    value: "dental_center" as BusinessCategory,
    label: "Dental Clinic & Center",
    labelAr: "عيادة ومركز الأسنان",
    icon: "Activity",
    color: "from-sky-600 to-blue-700",
    description: "Dental procedures, treatment plans, orthodontics, insurance, appointment scheduling",
    descriptionAr: "إجراءات الأسنان، خطط العلاج، تقويم الأسنان، التأمين، جدولة المواعيد",
    subCategories: [
      "General Dentistry",
      "Orthodontics",
      "Pediatric Dentistry",
      "Cosmetic Dentistry",
      "Oral Surgery",
      "Endodontics",
      "Periodontics"
    ],
    subCategoriesAr: [
      "طب أسنان عام",
      "تقويم أسنان",
      "أسنان أطفال",
      "تجميل أسنان",
      "جراحة فم",
      "علاج جذور",
      "أمراض لثة"
    ],
    complianceNotes: ["MOH dental license", "Sterilization protocols", "Medical waste disposal", "Insurance approvals"],
    workflowHighlights: [
      "Treatment plan builder",
      "Multi-visit procedures",
      "Orthodontic tracking",
      "Insurance pre-authorization",
      "Before/after photos",
      "Payment installments"
    ],
    entityTypes: ["patient", "treatment_plan", "dental_procedure", "orthodontic_phase"],
    defaultModules: ["healthcare", "crm", "accounting", "installments"],
    groupTitles: ["Healthcare", "Dental Services"],
    saudiMarketNotes: [
      "High-value procedures common (implants, orthodontics)",
      "Installment payment plans typical",
      "Insurance coverage often limited",
      "Patient retention via follow-up reminders"
    ]
  },
  {
    value: "pharmacy" as BusinessCategory,
    label: "Pharmacy & Drug Store",
    labelAr: "صيدلية ومحل أدوية",
    icon: "Pill",
    color: "from-green-600 to-emerald-700",
    description: "Prescription POS, batch/expiry tracking, controlled substances, insurance co-pay",
    descriptionAr: "نقطة بيع وصفات، تتبع الدفعات والصلاحية، مواد مراقبة، المشاركة في التأمين",
    subCategories: [
      "Retail Pharmacy",
      "Clinic Pharmacy",
      "Hospital Pharmacy",
      "Medical Equipment Shop"
    ],
    subCategoriesAr: [
      "صيدلية تجزئة",
      "صيدلية عيادة",
      "صيدلية مستشفى",
      "محل معدات طبية"
    ],
    complianceNotes: ["SFDA pharmacy license", "Pharmacist license", "Controlled substance tracking", "Prescription retention", "Near-expiry disposal protocols"],
    workflowHighlights: [
      "Prescription intake",
      "Batch/expiry mandatory",
      "Medicine substitution suggestions",
      "Controlled item permissions",
      "Insurance co-pay calculation",
      "Near-expiry alerts",
      "Recall management"
    ],
    entityTypes: ["medicine", "prescription", "batch", "controlled_item"],
    defaultModules: ["pos_pharmacy", "pharmacy", "inventory", "sales", "purchase", "accounting"],
    groupTitles: ["Healthcare", "Retail Pharmacy"],
    saudiMarketNotes: [
      "Batch/expiry tracking mandatory by SFDA",
      "Insurance claim submission via Wasfaty platform",
      "High margin on OTC, thin margin on prescription",
      "Seasonal demand (cold/flu season)"
    ]
  }
];

// RETAIL & SUPERMARKET CATEGORIES
export const RETAIL_CATEGORIES: BusinessCatalogItem[] = [
  {
    value: "supermarket" as BusinessCategory,
    label: "Supermarket & Grocery",
    labelAr: "سوبر ماركت ومحل بقالة",
    icon: "ShoppingCart",
    color: "from-lime-600 to-green-700",
    description: "Fast barcode POS, weighing scale integration, batch/expiry, cashier shifts, promotions",
    descriptionAr: "نقطة بيع باركود سريعة، تكامل ميزان، دفعة/صلاحية، نوبات الكاشير، عروض",
    subCategories: [
      "Mini Market",
      "Supermarket",
      "Hypermarket",
      "Fresh Produce",
      "Butchery",
      "Frozen Food"
    ],
    subCategoriesAr: [
      "ميني ماركت",
      "سوبر ماركت",
      "هايبر ماركت",
      "منتجات طازجة",
      "جزارة",
      "مجمدات"
    ],
    complianceNotes: ["Municipality food license", "SFDA registration for packaged foods", "Halal certification", "Price labeling regulations"],
    workflowHighlights: [
      "Fast barcode checkout",
      "Weighing scale barcode generation",
      "Batch/expiry tracking",
      "Supplier receiving",
      "Price label printing",
      "Promotion campaigns",
      "Cashier shift reconciliation",
      "Wastage tracking"
    ],
    entityTypes: ["product", "weighable_item", "promotion", "cashier_shift"],
    defaultModules: ["pos_retail", "inventory", "purchase", "accounting", "crm"],
    groupTitles: ["Retail", "FMCG"],
    saudiMarketNotes: [
      "Rewaa is main competitor in this space",
      "Offline POS critical (internet unreliable)",
      "Multi-shift operations common",
      "Expiry management essential for profitability"
    ]
  },
  {
    value: "wholesale" as BusinessCategory,
    label: "Wholesale & Distribution",
    labelAr: "تجارة الجملة والتوزيع",
    icon: "Warehouse",
    color: "from-indigo-600 to-purple-700",
    description: "B2B pricing, credit limits, salesman routes, van sales, delivery notes, collections",
    descriptionAr: "تسعير بين الشركات، حدود ائتمان، طرق البائع، مبيعات الفان، مذكرات التسليم، التحصيلات",
    subCategories: [
      "FMCG Distribution",
      "Food Distribution",
      "Pharmacy Wholesale",
      "Electronics Wholesale",
      "Auto Parts Distribution"
    ],
    subCategoriesAr: [
      "توزيع السلع الاستهلاكية",
      "توزيع الأغذية",
      "أدوية بالجملة",
      "إلكترونيات بالجملة",
      "قطع غيار بالجملة"
    ],
    complianceNotes: ["VAT on B2B sales", "Customer VAT number validation", "Credit terms documentation", "Delivery documentation"],
    workflowHighlights: [
      "Customer price lists",
      "Credit limit enforcement",
      "Salesman route planning",
      "Van sales mobile app",
      "Delivery notes",
      "Sales orders",
      "Warehouse picking/packing",
      "Collections tracking",
      "Aging reports"
    ],
    entityTypes: ["b2b_customer", "price_list", "sales_route", "delivery_note"],
    defaultModules: ["pos_wholesale", "inventory", "sales", "purchase", "crm", "accounting", "transport"],
    groupTitles: ["Wholesale", "Distribution"],
    saudiMarketNotes: [
      "Credit terms typically 30-60-90 days",
      "Salesman commission structures vary",
      "Delivery tracking critical",
      "Aging management makes or breaks profitability"
    ]
  }
];

// FOOD & BEVERAGE CATEGORIES
export const FOOD_BEVERAGE_CATEGORIES: BusinessCatalogItem[] = [
  {
    value: "bakery" as BusinessCategory,
    label: "Bakery & Pastry",
    labelAr: "مخبز وحلويات",
    icon: "Cake",
    color: "from-amber-600 to-orange-700",
    description: "Production planning, recipe costing, batch tracking, retail POS",
    descriptionAr: "تخطيط الإنتاج، تكلفة الوصفات، تتبع الدفعات، نقطة بيع التجزئة",
    subCategories: ["Retail Bakery", "Wholesale Bakery", "Pastry Shop", "Cake Shop", "Arabic Sweets", "Croissant Factory"],
    subCategoriesAr: ["مخبز تجزئة", "مخبز جملة", "محل حلويات", "محل كيك", "حلويات عربية", "مصنع كرواسون"],
    complianceNotes: ["SFDA food registration", "Municipality health certificate", "Halal certification", "Batch/expiry tracking", "Food safety protocols"],
    workflowHighlights: ["Recipe BOM", "Production batches", "Baking schedule", "Expiry tracking", "Daily wastage", "Retail POS", "Wholesale orders", "Delivery routes"],
    entityTypes: ["recipe", "production_batch", "retail_product", "wholesale_order"],
    defaultModules: ["pos_retail", "manufacturing", "inventory", "sales", "purchase", "accounting"],
    groupTitles: ["Food & Beverage", "Manufacturing"],
    saudiMarketNotes: ["High demand during Ramadan", "Daily production cycles", "Shelf life critical (1-3 days)", "Wholesale to cafes/restaurants common"]
  },
  {
    value: "cafe" as BusinessCategory,
    label: "Cafe & Coffee Shop",
    labelAr: "مقهى ومحمصة",
    icon: "Coffee",
    color: "from-brown-600 to-amber-700",
    description: "Quick service POS, recipe costing, modifiers, loyalty programs",
    descriptionAr: "نقطة بيع سريعة، تكلفة الوصفات، الإضافات، برامج الولاء",
    subCategories: ["Specialty Coffee", "Traditional Cafe", "Roastery Cafe", "Juice Bar", "Dessert Cafe", "Shisha Cafe"],
    subCategoriesAr: ["قهوة متخصصة", "مقهى تقليدي", "محمصة", "عصير", "مقهى حلويات", "مقهى شيشة"],
    complianceNotes: ["Municipality permit", "Food handling license", "Shisha permit where applicable", "Health certificate"],
    workflowHighlights: ["Quick order POS", "Drink modifiers", "Recipe ingredient depletion", "Loyalty points", "Tip handling", "Daily shift closing"],
    entityTypes: ["menu_item", "modifier", "recipe", "loyalty_member"],
    defaultModules: ["pos_restaurant", "inventory", "sales", "crm", "accounting"],
    groupTitles: ["Food & Beverage", "Hospitality"],
    saudiMarketNotes: ["Specialty coffee growth in major cities", "Modifiers critical (milk type, sugar level, shot count)", "High margin on beverages"]
  },
  {
    value: "catering" as BusinessCategory,
    label: "Catering & Event Food",
    labelAr: "تقديم الطعام والفعاليات",
    icon: "UtensilsCrossed",
    color: "from-purple-600 to-pink-700",
    description: "Event packages, production planning, serving count, delivery scheduling",
    descriptionAr: "باقات الفعاليات، تخطيط الإنتاج، عدد الأفراد، جدولة التوصيل",
    subCategories: ["Corporate Catering", "Wedding Catering", "Event Catering", "Meal Plans", "School Canteen", "Hospital Food Service"],
    subCategoriesAr: ["تقديم طعام للشركات", "أفراح", "فعاليات", "وجبات مشتركة", "كانتين مدارس", "خدمة طعام مستشفيات"],
    complianceNotes: ["Commercial kitchen license", "Food safety certification", "Transport vehicle permits", "Staff health certificates"],
    workflowHighlights: ["Package builder", "Event quotation", "Serving count management", "Production planning", "Ingredient forecast", "Delivery schedule", "Equipment tracking", "Recurring contracts"],
    entityTypes: ["event_package", "event_booking", "production_plan", "delivery_schedule"],
    defaultModules: ["projects", "manufacturing", "inventory", "sales", "transport", "accounting"],
    groupTitles: ["Food & Beverage", "Services"],
    saudiMarketNotes: ["Corporate contracts lucrative", "Wedding season peaks", "Ramadan meal plans popular", "Equipment rental adds revenue"]
  },
  {
    value: "cloud_kitchen" as BusinessCategory,
    label: "Cloud Kitchen & Dark Kitchen",
    labelAr: "مطبخ سحابي",
    icon: "ChefHat",
    color: "from-red-600 to-orange-700",
    description: "Delivery-only brands, aggregator sync, kitchen production, order routing",
    descriptionAr: "علامات توصيل فقط، مزامنة التطبيقات، إنتاج المطبخ، توجيه الطلبات",
    subCategories: ["Single Brand Kitchen", "Multi-Brand Kitchen", "Virtual Restaurant", "Delivery Central Kitchen"],
    subCategoriesAr: ["مطبخ علامة واحدة", "مطبخ متعدد العلامات", "مطعم افتراضي", "مطبخ مركزي للتوصيل"],
    complianceNotes: ["Commercial kitchen license", "Food delivery permits", "Municipality health approval", "Aggregator agreements"],
    workflowHighlights: ["Multi-brand menu management", "Aggregator order import", "Kitchen display system", "Ingredient depletion", "Delivery aggregator reconciliation", "Commission tracking", "Brand performance analysis"],
    entityTypes: ["brand", "aggregator_order", "kitchen_station", "delivery_batch"],
    defaultModules: ["pos_restaurant", "inventory", "sales", "transport", "accounting", "crm"],
    groupTitles: ["Food & Beverage", "E-commerce"],
    saudiMarketNotes: ["Rapid growth with Jahez, HungerStation, Mrsool", "Low overhead vs traditional restaurants", "Aggregator fees 20-35%", "Multiple brand strategy common"]
  },
  {
    value: "food_truck" as BusinessCategory,
    label: "Food Truck & Mobile Food",
    labelAr: "عربة الطعام المتنقلة",
    icon: "Truck",
    color: "from-yellow-600 to-red-700",
    description: "Mobile POS, location tracking, event booking, inventory management",
    descriptionAr: "نقطة بيع متنقلة، تتبع الموقع، حجز الفعاليات، إدارة المخزون",
    subCategories: ["Street Food Truck", "Event Food Truck", "Mobile Coffee", "Ice Cream Truck", "BBQ Truck"],
    subCategoriesAr: ["عربة طعام الشارع", "عربة فعاليات", "قهوة متنقلة", "عربة آيس كريم", "عربة شواء"],
    complianceNotes: ["Mobile food permit", "Vehicle health inspection", "Event location permits", "Fire safety equipment"],
    workflowHighlights: ["Offline POS", "Location-based sales tracking", "Event booking calendar", "Mobile inventory", "Daily stock loading", "Cash reconciliation", "Fuel tracking"],
    entityTypes: ["truck", "location_stop", "event_booking", "daily_stock_kit"],
    defaultModules: ["pos_retail", "inventory", "sales", "transport", "accounting"],
    groupTitles: ["Food & Beverage", "Mobile Operations"],
    saudiMarketNotes: ["Event season peaks (festivals, national days)", "Municipality permits vary by city", "High cash transactions", "Social media marketing critical"]
  }
];

// SERVICES & FACILITIES CATEGORIES
export const SERVICES_CATEGORIES: BusinessCatalogItem[] = [
  {
    value: "facility_management" as BusinessCategory,
    label: "Facility Management & AMC",
    labelAr: "إدارة المرافق وعقود الصيانة",
    icon: "Building2",
    color: "from-blue-600 to-cyan-700",
    description: "AMC contracts, preventive maintenance, work orders, SLA tracking, technician dispatch",
    descriptionAr: "عقود صيانة سنوية، صيانة وقائية، أوامر عمل، تتبع مستوى الخدمة، إرسال الفنيين",
    subCategories: ["AC Maintenance", "Electrical Maintenance", "Plumbing", "Elevator Maintenance", "Fire Systems", "Cleaning Contracts", "Security Contracts", "Pest Control"],
    subCategoriesAr: ["صيانة مكيفات", "صيانة كهرباء", "سباكة", "صيانة مصاعد", "أنظمة الإطفاء", "عقود تنظيف", "عقود أمن", "مكافحة حشرات"],
    complianceNotes: ["Civil Defense approvals", "Contractor classification", "Insurance certificates", "Staff certifications", "SLA documentation"],
    workflowHighlights: ["AMC contract management", "Preventive maintenance schedule", "Work order dispatch", "Technician assignment", "Spare parts tracking", "SLA monitoring", "Customer signature", "Recurring invoicing"],
    entityTypes: ["amc_contract", "work_order", "maintenance_schedule", "service_visit"],
    defaultModules: ["projects", "inventory", "sales", "hrm", "accounting", "crm"],
    groupTitles: ["Services", "Facility Management"],
    saudiMarketNotes: ["Corporate contracts stable revenue", "Technician retention challenging", "SLA penalties common", "Multi-site contracts preferred"]
  },
  {
    value: "cleaning_services" as BusinessCategory,
    label: "Cleaning & Housekeeping Services",
    labelAr: "خدمات التنظيف",
    icon: "SprayCan",
    color: "from-teal-600 to-green-700",
    description: "Residential/commercial cleaning, staff roster, site checklist, recurring contracts",
    descriptionAr: "تنظيف سكني/تجاري، جدول الموظفين، قائمة الموقع، عقود متكررة",
    subCategories: ["Residential Cleaning", "Commercial Cleaning", "Deep Cleaning", "Post-Construction Cleaning", "Janitorial Services"],
    subCategoriesAr: ["تنظيف منازل", "تنظيف تجاري", "تنظيف عميق", "تنظيف بعد البناء", "خدمات النظافة"],
    complianceNotes: ["Municipality license", "Staff residence permits", "Insurance coverage", "Chemical handling permits"],
    workflowHighlights: ["Recurring contracts", "Staff roster", "Site visit schedule", "Checklist completion", "Material consumption tracking", "Customer sign-off", "Quality inspection"],
    entityTypes: ["cleaning_contract", "site_visit", "staff_roster", "quality_checklist"],
    defaultModules: ["projects", "hrm", "sales", "inventory", "accounting"],
    groupTitles: ["Services", "Facilities"],
    saudiMarketNotes: ["Labor-intensive business model", "Corporate contracts more stable", "Staff accommodation costs significant", "Seasonal demand (summer deep cleaning)"]
  },
  {
    value: "pest_control" as BusinessCategory,
    label: "Pest Control Services",
    labelAr: "خدمات مكافحة الحشرات",
    icon: "Bug",
    color: "from-green-600 to-lime-700",
    description: "Recurring visits, chemical tracking, service reports, compliance certificates",
    descriptionAr: "زيارات متكررة، تتبع المواد، تقارير الخدمة، شهادات الامتثال",
    subCategories: ["Residential Pest Control", "Commercial Pest Control", "Food Premises Pest Control", "Termite Control", "Rodent Control"],
    subCategoriesAr: ["مكافحة حشرات منزلية", "مكافحة حشرات تجارية", "مكافحة للمطاعم", "مكافحة النمل الأبيض", "مكافحة القوارض"],
    complianceNotes: ["Municipality license", "Chemical handling permits", "Technician certifications", "Safety equipment", "Food premises approvals"],
    workflowHighlights: ["Contract management", "Visit scheduling", "Chemical application log", "Service report with photos", "Follow-up visits", "Certificate issuance", "Compliance documentation"],
    entityTypes: ["pest_contract", "service_visit", "chemical_application", "compliance_certificate"],
    defaultModules: ["projects", "inventory", "sales", "hrm", "documents", "accounting"],
    groupTitles: ["Services", "Environmental"],
    saudiMarketNotes: ["Food premises require regular service", "Municipality inspections frequent", "Contract renewals critical", "Seasonal peaks (summer)"]
  },
  {
    value: "security_services" as BusinessCategory,
    label: "Security Guard Services",
    labelAr: "خدمات الحراسة الأمنية",
    icon: "Shield",
    color: "from-slate-600 to-gray-700",
    description: "Guard deployment, site contracts, shift roster, attendance tracking, incident reports",
    descriptionAr: "نشر الحراس، عقود المواقع، جدول النوبات، تتبع الحضور، تقارير الحوادث",
    subCategories: ["Static Security", "Mobile Patrol", "Event Security", "VIP Protection", "CCTV Monitoring"],
    subCategoriesAr: ["حراسة ثابتة", "دوريات متنقلة", "أمن فعاليات", "حماية شخصيات", "مراقبة كاميرات"],
    complianceNotes: ["Security company license", "Guard training certificates", "Background checks", "Insurance coverage", "Incident reporting protocol"],
    workflowHighlights: ["Site contract management", "Guard deployment", "Shift roster", "Attendance (biometric)", "Incident reporting", "Site inspection", "Client billing", "Guard payroll"],
    entityTypes: ["security_contract", "guard", "shift_assignment", "incident_report"],
    defaultModules: ["projects", "hrm", "sales", "accounting", "documents"],
    groupTitles: ["Services", "Security"],
    saudiMarketNotes: ["Long-term contracts preferred", "Guard retention challenging", "Saudization requirements", "Technology integration growing (CCTV, access control)"]
  }
];

// LOGISTICS & TRANSPORT CATEGORIES
export const LOGISTICS_CATEGORIES: BusinessCatalogItem[] = [
  {
    value: "courier" as BusinessCategory,
    label: "Courier & Last Mile Delivery",
    labelAr: "البريد السريع والتوصيل",
    icon: "Package",
    color: "from-blue-600 to-indigo-700",
    description: "Parcel tracking, route optimization, driver app, POD, COD reconciliation",
    descriptionAr: "تتبع الطرود، تحسين المسارات، تطبيق السائق، إثبات التسليم، تسوية الدفع عند الاستلام",
    subCategories: ["Express Courier", "Same Day Delivery", "E-commerce Fulfillment", "Document Courier", "Medical Delivery"],
    subCategoriesAr: ["بريد سريع", "توصيل نفس اليوم", "تنفيذ التجارة الإلكترونية", "توصيل مستندات", "توصيل طبي"],
    complianceNotes: ["Transport license", "Vehicle insurance", "Driver permits", "GPS tracking required", "COD handling procedures"],
    workflowHighlights: ["Shipment booking", "Barcode scanning", "Route assignment", "Driver app", "GPS tracking", "POD with signature/photo", "COD collection", "Settlement reconciliation"],
    entityTypes: ["shipment", "route", "delivery_batch", "pod", "cod_transaction"],
    defaultModules: ["transport", "accounting", "crm", "hrm"],
    groupTitles: ["Logistics", "Transport"],
    saudiMarketNotes: ["Jahez, Mrsool, SMSA, Aramex compete", "COD reconciliation complex", "E-commerce growth drives demand", "Driver retention challenging"]
  },
  {
    value: "freight" as BusinessCategory,
    label: "Freight & Cargo Transport",
    labelAr: "نقل البضائع والشحن",
    icon: "Truck",
    color: "from-orange-600 to-red-700",
    description: "Trip management, waybills, vehicle tracking, fuel logs, driver settlement",
    descriptionAr: "إدارة الرحلات، بوالص الشحن، تتبع المركبات، سجلات الوقود، تسوية السائق",
    subCategories: ["Land Freight", "Container Transport", "Heavy Equipment Transport", "Tanker Transport", "Bulk Material Transport"],
    subCategoriesAr: ["نقل بري", "نقل حاويات", "نقل معدات ثقيلة", "نقل صهاريج", "نقل مواد سائبة"],
    complianceNotes: ["TGA transport license", "Vehicle inspection certificates", "Driver licenses", "Cargo insurance", "Waybill documentation"],
    workflowHighlights: ["Trip booking", "Waybill generation", "Load planning", "Driver assignment", "GPS tracking", "Fuel consumption", "Toll payments", "Trip settlement", "POD collection"],
    entityTypes: ["trip", "waybill", "vehicle", "driver", "fuel_log"],
    defaultModules: ["transport", "accounting", "assets", "hrm"],
    groupTitles: ["Logistics", "Transport"],
    saudiMarketNotes: ["TGA compliance critical", "Fuel cost significant expense", "Long-haul vs local split", "Driver per-trip settlement common"]
  },
  {
    value: "cold_chain" as BusinessCategory,
    label: "Cold Chain & Refrigerated Transport",
    labelAr: "النقل المبرد وسلسلة التبريد",
    icon: "Thermometer",
    color: "from-cyan-600 to-blue-700",
    description: "Temperature monitoring, cold storage, reefer tracking, compliance logging",
    descriptionAr: "مراقبة الحرارة، التخزين البارد، تتبع الثلاجات، تسجيل الامتثال",
    subCategories: ["Food Cold Chain", "Pharmaceutical Cold Chain", "Frozen Storage", "Reefer Trucks", "Cold Room Management"],
    subCategoriesAr: ["سلسلة تبريد غذائية", "سلسلة تبريد دوائية", "تخزين مجمد", "شاحنات مبردة", "إدارة غرف تبريد"],
    complianceNotes: ["SFDA/MOH temperature compliance", "Temperature monitoring devices", "Vehicle certifications", "Regular calibration", "Incident reporting"],
    workflowHighlights: ["Temperature log (real-time)", "Cold storage inventory", "Reefer vehicle tracking", "Temperature exception alerts", "Compliance reports", "Batch tracking", "Expiry management"],
    entityTypes: ["cold_storage_batch", "temperature_log", "reefer_vehicle", "cold_shipment"],
    defaultModules: ["transport", "inventory", "accounting", "documents"],
    groupTitles: ["Logistics", "Specialized Transport"],
    saudiMarketNotes: ["Critical for pharma/food safety", "Summer temps demand high reliability", "Equipment maintenance costly", "Compliance audits frequent"]
  },
  {
    value: "moving_company" as BusinessCategory,
    label: "Moving & Relocation Services",
    labelAr: "خدمات النقل والشحن المنزلي",
    icon: "Home",
    color: "from-violet-600 to-purple-700",
    description: "Household moving, packing services, inventory list, insurance, storage",
    descriptionAr: "نقل منزلي، خدمات التعبئة، قائمة المحتويات، التأمين، التخزين",
    subCategories: ["Household Moving", "Office Moving", "International Moving", "Storage Services", "Packing Services"],
    subCategoriesAr: ["نقل منزلي", "نقل مكاتب", "نقل دولي", "خدمات تخزين", "خدمات تعبئة"],
    complianceNotes: ["Transport license", "Insurance coverage", "Staff background checks", "Storage facility permits", "International customs (if applicable)"],
    workflowHighlights: ["Site survey", "Quotation", "Packing list/inventory", "Crew assignment", "Vehicle scheduling", "Insurance documentation", "Customer sign-off", "Storage tracking", "Final settlement"],
    entityTypes: ["moving_job", "packing_inventory", "storage_unit", "crew_assignment"],
    defaultModules: ["projects", "transport", "sales", "hrm", "accounting", "documents"],
    groupTitles: ["Logistics", "Services"],
    saudiMarketNotes: ["Expat relocations common", "Peak seasons (summer, year-end)", "Insurance claims occasional", "Packing materials significant cost"]
  },
  {
    value: "fleet_rental" as BusinessCategory,
    label: "Fleet Rental & Car Rental",
    labelAr: "تأجير المركبات والسيارات",
    icon: "CarFront",
    color: "from-red-600 to-pink-700",
    description: "Vehicle availability, rental contracts, damage inspection, fines tracking, maintenance",
    descriptionAr: "توفر المركبات، عقود الإيجار، فحص الأضرار، تتبع المخالفات، الصيانة",
    subCategories: ["Daily Car Rental", "Monthly Rental", "Corporate Fleet", "Luxury Cars", "Bus Rental", "Equipment Rental"],
    subCategoriesAr: ["تأجير يومي", "تأجير شهري", "أسطول شركات", "سيارات فاخرة", "تأجير حافلات", "تأجير معدات"],
    complianceNotes: ["Transport Authority license", "Vehicle registration", "Comprehensive insurance", "Driver verification", "Traffic fine management"],
    workflowHighlights: ["Availability calendar", "Rental agreement", "ID/license verification", "Deposit collection", "Check-out inspection", "Mileage tracking", "Check-in inspection", "Damage assessment", "Fine tracking", "Maintenance scheduling"],
    entityTypes: ["rental_vehicle", "rental_contract", "inspection", "fine", "maintenance_record"],
    defaultModules: ["assets", "sales", "accounting", "crm", "transport"],
    groupTitles: ["Automotive", "Rental Services"],
    saudiMarketNotes: ["Corporate contracts more profitable", "Insurance deductible disputes common", "Traffic fine reconciliation complex", "Vehicle utilization tracking critical"]
  },
  {
    value: "limousine" as BusinessCategory,
    label: "Limousine & VIP Transport",
    labelAr: "ليموزين ونقل VIP",
    icon: "Car",
    color: "from-gray-700 to-slate-800",
    description: "Chauffeur booking, trip management, driver profiles, vehicle fleet, billing",
    descriptionAr: "حجز سائق، إدارة الرحلات، ملفات السائقين، أسطول المركبات، الفواتير",
    subCategories: ["Airport Transfer", "Corporate Chauffeur", "Event Transport", "Wedding Cars", "Hourly Rental with Driver"],
    subCategoriesAr: ["نقل مطار", "سائق شركات", "نقل فعاليات", "سيارات أفراح", "تأجير بالساعة مع سائق"],
    complianceNotes: ["Limousine license", "Driver permits", "Vehicle luxury standards", "Insurance", "Background checks"],
    workflowHighlights: ["Booking management", "Driver assignment", "Trip tracking", "Wait time billing", "Fuel cost", "Driver settlement", "Corporate invoicing", "Customer ratings"],
    entityTypes: ["limousine_booking", "chauffeur", "trip_log", "vehicle_fleet"],
    defaultModules: ["transport", "sales", "hrm", "accounting", "crm"],
    groupTitles: ["Transport", "Premium Services"],
    saudiMarketNotes: ["Corporate accounts stable", "Airport transfers high volume", "Driver quality critical", "Uber/Careem competition"]
  },
  {
    value: "taxi" as BusinessCategory,
    label: "Taxi & Ride Services",
    labelAr: "تاكسي وخدمات النقل",
    icon: "TramFront",
    color: "from-yellow-600 to-orange-700",
    description: "Ride booking, driver app, fare calculation, commission tracking, fleet management",
    descriptionAr: "حجز الرحلات، تطبيق السائق، حساب الأجرة، تتبع العمولة، إدارة الأسطول",
    subCategories: ["Traditional Taxi", "App-based Taxi", "Women's Taxi", "Airport Taxi", "Shared Taxi"],
    subCategoriesAr: ["تاكسي تقليدي", "تاكسي التطبيقات", "تاكسي نسائي", "تاكسي مطار", "تاكسي مشترك"],
    complianceNotes: ["Taxi license per city", "Driver permits", "Meter calibration", "Insurance", "Vehicle inspection"],
    workflowHighlights: ["Ride dispatch", "GPS tracking", "Fare calculation", "Driver settlement", "Commission deduction", "Shift management", "Fuel tracking", "Maintenance"],
    entityTypes: ["ride", "taxi_driver", "shift", "settlement"],
    defaultModules: ["transport", "accounting", "hrm"],
    groupTitles: ["Transport", "Ride Services"],
    saudiMarketNotes: ["Uber/Careem dominant", "Traditional taxi declining", "Driver commission 70-80%", "Women drivers increasing"]
  }
];

// EDUCATION & TRAINING CATEGORIES
export const EDUCATION_CATEGORIES: BusinessCatalogItem[] = [
  {
    value: "school" as BusinessCategory,
    label: "School & Private Education",
    labelAr: "مدرسة والتعليم الخاص",
    icon: "GraduationCap",
    color: "from-blue-600 to-indigo-700",
    description: "Student records, class management, fee billing, attendance, report cards, parent portal",
    descriptionAr: "سجلات الطلاب، إدارة الفصول، فوترة الرسوم، الحضور، بطاقات التقارير، بوابة أولياء الأمور",
    subCategories: ["Private School", "International School", "Islamic School", "Special Needs School"],
    subCategoriesAr: ["مدرسة خاصة", "مدرسة دولية", "مدرسة إسلامية", "مدرسة ذوي الاحتياجات"],
    complianceNotes: ["MOE license", "Building safety", "Teacher qualifications", "Curriculum approval", "Student records privacy"],
    workflowHighlights: ["Student admission", "Class/section assignment", "Fee installments", "Attendance tracking", "Exam management", "Report card generation", "Parent notifications", "Transport management", "Guardian portal"],
    entityTypes: ["student", "class", "fee_plan", "exam", "report_card", "guardian"],
    defaultModules: ["education", "sales", "accounting", "crm", "hrm", "transport"],
    groupTitles: ["Education", "Student Management"],
    saudiMarketNotes: ["Fee collection critical", "Parent communication via WhatsApp", "Transport add-on common", "Installment plans typical"]
  },
  {
    value: "nursery" as BusinessCategory,
    label: "Nursery & Daycare",
    labelAr: "حضانة ودار رعاية",
    icon: "Baby",
    color: "from-pink-600 to-rose-700",
    description: "Child enrollment, daily reports, guardian app, activity tracking, meal management",
    descriptionAr: "تسجيل الأطفال، تقارير يومية، تطبيق أولياء الأمور، تتبع الأنشطة، إدارة الوجبات",
    subCategories: ["Daycare Center", "Montessori Nursery", "Early Learning Center", "After-School Care"],
    subCategoriesAr: ["حضانة", "حضانة منتسوري", "مركز تعلم مبكر", "رعاية بعد المدرسة"],
    complianceNotes: ["MOE nursery license", "Child safety standards", "Staff certifications", "Health protocols", "Emergency procedures"],
    workflowHighlights: ["Child enrollment", "Daily attendance", "Activity reports", "Photo sharing (with permission)", "Meal tracking", "Nap time logs", "Guardian communication", "Monthly billing"],
    entityTypes: ["child", "daily_report", "activity", "guardian", "meal_plan"],
    defaultModules: ["education", "sales", "crm", "hrm", "accounting"],
    groupTitles: ["Education", "Childcare"],
    saudiMarketNotes: ["Guardian app critical", "Daily photo/video updates expected", "Staff-to-child ratio regulated", "High demand in major cities"]
  },
  {
    value: "training_center" as BusinessCategory,
    label: "Training Center & Institute",
    labelAr: "مركز تدريب ومعهد",
    icon: "BookOpen",
    color: "from-purple-600 to-indigo-700",
    description: "Course management, trainer scheduling, student enrollment, certificates, payments",
    descriptionAr: "إدارة الدورات، جدولة المدربين، تسجيل الطلاب، الشهادات، المدفوعات",
    subCategories: ["Language Center", "IT Training", "Professional Certification", "Management Training", "Vocational Training", "Driving School"],
    subCategoriesAr: ["مركز لغات", "تدريب IT", "شهادات مهنية", "تدريب إداري", "تدريب مهني", "مدرسة قيادة"],
    complianceNotes: ["TVTC accreditation (vocational)", "Trainer certifications", "Curriculum approval", "Certificate issuance authority"],
    workflowHighlights: ["Course catalog", "Batch scheduling", "Student enrollment", "Attendance tracking", "Trainer assignment", "Assessment/exams", "Certificate generation", "Installment billing"],
    entityTypes: ["course", "batch", "trainee", "trainer", "certificate"],
    defaultModules: ["education", "sales", "hrm", "accounting", "crm"],
    groupTitles: ["Education", "Professional Development"],
    saudiMarketNotes: ["Corporate training packages lucrative", "Certificate issuance critical", "Evening/weekend batches common", "Online/hybrid models growing"]
  }
];

// PROFESSIONAL SERVICES CATEGORIES
export const PROFESSIONAL_CATEGORIES: BusinessCatalogItem[] = [
  {
    value: "law_firm" as BusinessCategory,
    label: "Law Firm & Legal Services",
    labelAr: "مكتب محاماة وخدمات قانونية",
    icon: "Scale",
    color: "from-slate-700 to-gray-800",
    description: "Case management, client matters, court dates, timesheets, retainer billing, document vault",
    descriptionAr: "إدارة القضايا، شؤون العملاء، مواعيد المحكمة، سجلات الوقت، فوترة الأتعاب، قبو المستندات",
    subCategories: ["Corporate Law", "Labor Law", "Commercial Law", "Family Law", "Criminal Defense", "Legal Consulting"],
    subCategoriesAr: ["قانون الشركات", "قانون العمل", "قانون تجاري", "قانون الأسرة", "دفاع جنائي", "استشارات قانونية"],
    complianceNotes: ["Lawyer license", "Bar association membership", "Client confidentiality", "Conflict of interest checks", "Retainer agreements"],
    workflowHighlights: ["Matter/case intake", "Court date calendar", "Document management", "Timesheet tracking", "Retainer invoicing", "Expense pass-through", "Client portal", "Deadline alerts"],
    entityTypes: ["legal_matter", "court_date", "timesheet", "retainer", "legal_document"],
    defaultModules: ["professional", "projects", "sales", "documents", "accounting", "crm"],
    groupTitles: ["Professional Services", "Legal"],
    saudiMarketNotes: ["Retainer model common", "Document security critical", "Billable hours tracking essential", "Court date management key"]
  },
  {
    value: "accounting_firm" as BusinessCategory,
    label: "Accounting & Audit Firm",
    labelAr: "مكتب محاسبة ومراجعة",
    icon: "Calculator",
    color: "from-green-600 to-emerald-700",
    description: "Client management, engagement letters, work papers, tax returns, recurring services",
    descriptionAr: "إدارة العملاء، خطابات الارتباط، أوراق العمل، الإقرارات الضريبية، الخدمات المتكررة",
    subCategories: ["Tax Consulting", "Audit Services", "Bookkeeping", "VAT Services", "Payroll Services", "Business Setup"],
    subCategoriesAr: ["استشارات ضريبية", "خدمات مراجعة", "مسك دفاتر", "خدمات VAT", "خدمات رواتب", "تأسيس شركات"],
    complianceNotes: ["SOCPA license", "Professional indemnity insurance", "Client confidentiality", "Work paper retention", "Independence standards"],
    workflowHighlights: ["Client engagement", "Service agreements", "Work paper management", "Recurring tasks", "Deadline calendar", "Review process", "Client reporting", "Billing (hourly/fixed)"],
    entityTypes: ["client_engagement", "work_paper", "recurring_task", "tax_return"],
    defaultModules: ["professional", "projects", "sales", "accounting", "documents", "crm"],
    groupTitles: ["Professional Services", "Financial"],
    saudiMarketNotes: ["VAT compliance high demand", "Recurring monthly services stable", "Year-end audit season peak", "ZATCA compliance growing need"]
  },
  {
    value: "consulting" as BusinessCategory,
    label: "Business Consulting",
    labelAr: "الاستشارات التجارية",
    icon: "Briefcase",
    color: "from-blue-600 to-cyan-700",
    description: "Project engagements, deliverables, timesheets, milestone billing, proposal management",
    descriptionAr: "مشاريع الارتباط، المخرجات، سجلات الوقت، فوترة المراحل، إدارة العروض",
    subCategories: ["Management Consulting", "HR Consulting", "IT Consulting", "Strategy Consulting", "Process Improvement", "Business Setup"],
    subCategoriesAr: ["استشارات إدارية", "استشارات موارد بشرية", "استشارات IT", "استشارات استراتيجية", "تحسين العمليات", "تأسيس أعمال"],
    complianceNotes: ["Business license", "Professional qualifications", "Service agreements", "Intellectual property", "Non-disclosure agreements"],
    workflowHighlights: ["Proposal/pitch", "SOW agreement", "Project phases", "Timesheet tracking", "Deliverable management", "Milestone billing", "Change requests", "Client presentations"],
    entityTypes: ["consulting_project", "deliverable", "milestone", "timesheet", "proposal"],
    defaultModules: ["professional", "projects", "sales", "documents", "accounting"],
    groupTitles: ["Professional Services", "Consulting"],
    saudiMarketNotes: ["Vision 2030 drives demand", "Government projects lucrative", "Retainer + project mix common", "Local partner requirements for foreign firms"]
  },
  {
    value: "engineering_office" as BusinessCategory,
    label: "Engineering Office & Consultancy",
    labelAr: "مكتب هندسي واستشارات",
    icon: "HardHat",
    color: "from-orange-600 to-red-700",
    description: "Design projects, drawing management, site supervision, approvals, progress billing",
    descriptionAr: "مشاريع التصميم، إدارة الرسومات، إشراف موقع، الاعتمادات، فوترة التقدم",
    subCategories: ["Structural Engineering", "MEP Design", "Architecture", "Civil Engineering", "Site Supervision", "Engineering Consulting"],
    subCategoriesAr: ["هندسة إنشائية", "تصميم كهروميكانيك", "معمارية", "هندسة مدنية", "إشراف موقع", "استشارات هندسية"],
    complianceNotes: ["Engineering office license", "SCE membership", "Professional engineer stamps", "Design approvals", "Municipality submissions"],
    workflowHighlights: ["Project intake", "Design phases", "Drawing revisions", "Approval workflow", "Site supervision logs", "Engineer assignment", "Milestone payments", "As-built documentation"],
    entityTypes: ["engineering_project", "drawing", "revision", "site_visit", "approval"],
    defaultModules: ["professional", "projects", "construction", "documents", "sales", "accounting"],
    groupTitles: ["Professional Services", "Engineering"],
    saudiMarketNotes: ["Construction boom drives demand", "Municipality approval delays common", "Site supervision fees separate", "As-built drawings critical"]
  },
  {
    value: "it_agency" as BusinessCategory,
    label: "IT & Software Agency",
    labelAr: "وكالة IT وبرمجيات",
    icon: "Code",
    color: "from-violet-600 to-purple-700",
    description: "Development projects, support tickets, hosting, domain management, recurring contracts",
    descriptionAr: "مشاريع تطوير، تذاكر الدعم، الاستضافة، إدارة النطاقات، عقود متكررة",
    subCategories: ["Web Development", "Mobile Apps", "Software Development", "IT Support", "Cloud Services", "Cybersecurity"],
    subCategoriesAr: ["تطوير مواقع", "تطبيقات جوال", "تطوير برمجيات", "دعم IT", "خدمات سحابية", "أمن سيبراني"],
    complianceNotes: ["CITC registration", "Software licensing", "Data privacy", "Service level agreements", "Intellectual property"],
    workflowHighlights: ["Project estimation", "Sprint/milestone planning", "Development tracking", "Bug/ticket management", "Hosting/domain billing", "Support contracts", "Code repository", "Client UAT"],
    entityTypes: ["dev_project", "sprint", "ticket", "hosting_account", "domain"],
    defaultModules: ["professional", "projects", "helpdesk", "sales", "accounting"],
    groupTitles: ["Professional Services", "Technology"],
    saudiMarketNotes: ["Digital transformation demand high", "Government projects require local hosting", "Recurring support contracts stable", "Saudization in IT roles"]
  },
  {
    value: "marketing_agency" as BusinessCategory,
    label: "Marketing & Advertising Agency",
    labelAr: "وكالة تسويق وإعلان",
    icon: "Megaphone",
    color: "from-pink-600 to-rose-700",
    description: "Campaign management, creative approvals, media buying, influencer tracking, retainer billing",
    descriptionAr: "إدارة الحملات، اعتماد التصاميم، شراء الإعلانات، تتبع المؤثرين، فوترة شهرية",
    subCategories: ["Digital Marketing", "Social Media Management", "SEO/SEM", "Branding", "Video Production", "Influencer Marketing"],
    subCategoriesAr: ["تسويق رقمي", "إدارة سوشيال ميديا", "SEO/SEM", "العلامات التجارية", "إنتاج فيديو", "تسويق بالمؤثرين"],
    complianceNotes: ["Business license", "Content regulations", "Influencer contracts", "Ad spend documentation", "Client agreements"],
    workflowHighlights: ["Campaign brief", "Creative production", "Client approval workflow", "Media plan", "Ad spend tracking", "Influencer contracts", "Performance reporting", "Retainer invoicing"],
    entityTypes: ["campaign", "creative_asset", "media_plan", "influencer_contract"],
    defaultModules: ["agency", "projects", "sales", "crm", "accounting"],
    groupTitles: ["Professional Services", "Marketing"],
    saudiMarketNotes: ["Social media dominates (TikTok, Snapchat, Instagram)", "Influencer marketing huge", "Ramadan peak season", "Retainer + performance model common"]
  }
];

// HOSPITALITY & ACCOMMODATION CATEGORIES
export const HOSPITALITY_CATEGORIES: BusinessCatalogItem[] = [
  {
    value: "furnished_apartments" as BusinessCategory,
    label: "Furnished Apartments & Short Stay",
    labelAr: "شقق مفروشة وإقامة قصيرة",
    icon: "Building",
    color: "from-indigo-600 to-purple-700",
    description: "Booking management, unit inventory, housekeeping, utilities, guest services",
    descriptionAr: "إدارة الحجوزات، مخزون الوحدات، التدبير المنزلي، الخدمات، خدمات الضيوف",
    subCategories: ["Daily Rental", "Weekly Rental", "Monthly Rental", "Corporate Housing", "Holiday Apartments"],
    subCategoriesAr: ["إيجار يومي", "إيجار أسبوعي", "إيجار شهري", "إسكان شركات", "شقق عطلات"],
    complianceNotes: ["Tourism license", "Municipality permit", "Ejar registration", "Fire safety", "Guest registration with police"],
    workflowHighlights: ["Booking calendar", "Unit availability", "Guest check-in/out", "Housekeeping schedule", "Utility billing", "Maintenance requests", "Guest communication", "OTA reconciliation"],
    entityTypes: ["apartment_unit", "booking", "guest", "housekeeping_task"],
    defaultModules: ["hotel", "real_estate", "sales", "accounting", "crm"],
    groupTitles: ["Hospitality", "Real Estate"],
    saudiMarketNotes: ["Growing alternative to hotels", "OTA platforms (Airbnb, Booking.com) popular", "Corporate long-stay lucrative", "Maintenance response time critical"]
  },
  {
    value: "resort" as BusinessCategory,
    label: "Resort & Holiday Destination",
    labelAr: "منتجع ومقصد سياحي",
    icon: "PalmTree",
    color: "from-teal-600 to-cyan-700",
    description: "Resort PMS, activity bookings, F&B, spa, event spaces, all-inclusive packages",
    descriptionAr: "نظام المنتجع، حجز الأنشطة، المطاعم، السبا، قاعات الفعاليات، باقات شاملة",
    subCategories: ["Beach Resort", "Desert Resort", "Mountain Resort", "Spa Resort", "Adventure Resort"],
    subCategoriesAr: ["منتجع شاطئي", "منتجع صحراوي", "منتجع جبلي", "منتجع سبا", "منتجع مغامرات"],
    complianceNotes: ["Tourism license", "Environmental permits", "Food safety", "Activity safety certifications", "Staff training"],
    workflowHighlights: ["Room booking", "Activity reservations", "Restaurant integration", "Spa appointments", "Event bookings", "All-inclusive packages", "Guest experience tracking", "Multi-outlet billing"],
    entityTypes: ["room", "activity", "spa_booking", "event_booking", "guest_folio"],
    defaultModules: ["hotel", "pos_restaurant", "events", "accounting", "hrm", "crm"],
    groupTitles: ["Hospitality", "Tourism"],
    saudiMarketNotes: ["Red Sea, NEOM projects growing", "Domestic tourism increasing", "Seasonal peaks (holidays, summer)", "Multi-language staff essential"]
  },
  {
    value: "chalet" as BusinessCategory,
    label: "Chalet & Istiraha Rental",
    labelAr: "استراحة وشاليه للإيجار",
    icon: "Home",
    color: "from-green-600 to-emerald-700",
    description: "Booking calendar, deposit management, facility checklist, damage tracking, cleaning",
    descriptionAr: "تقويم الحجوزات، إدارة العربون، قائمة المرافق، تتبع الأضرار، التنظيف",
    subCategories: ["Daily Chalet", "Weekend Chalet", "Event Chalet", "Family Compound", "Farm Stay"],
    subCategoriesAr: ["شاليه يومي", "شاليه ويكند", "شاليه فعاليات", "استراحة عائلية", "إقامة مزرعة"],
    complianceNotes: ["Municipality permit", "Building safety", "Swimming pool regulations", "Event permits (if applicable)", "Parking compliance"],
    workflowHighlights: ["Availability calendar", "Booking deposit", "Check-in inspection", "Facility access", "Check-out inspection", "Damage assessment", "Cleaning", "Security deposit return"],
    entityTypes: ["chalet_unit", "booking", "inspection", "damage_claim"],
    defaultModules: ["hotel", "sales", "accounting", "crm"],
    groupTitles: ["Hospitality", "Short-term Rental"],
    saudiMarketNotes: ["Weekend bookings peak", "Family gatherings common use", "Damage deposits standard", "WhatsApp booking common"]
  }
];

// TRAVEL & TOURISM CATEGORIES
export const TRAVEL_CATEGORIES: BusinessCatalogItem[] = [
  {
    value: "travel_agency" as BusinessCategory,
    label: "Travel Agency & Tours",
    labelAr: "وكالة سفر وسياحة",
    icon: "Plane",
    color: "from-sky-600 to-blue-700",
    description: "Ticket booking, visa services, hotel packages, tour itineraries, supplier settlement",
    descriptionAr: "حجز تذاكر، خدمات تأشيرات، باقات فنادق، برامج سياحية، تسوية موردين",
    subCategories: ["Ticketing", "Visa Services", "Tour Packages", "Corporate Travel", "Holiday Packages"],
    subCategoriesAr: ["حجز تذاكر", "خدمات تأشيرات", "باقات سياحية", "سفر شركات", "باقات عطلات"],
    complianceNotes: ["Tourism Authority license", "IATA accreditation (for ticketing)", "Visa service permissions", "Travel insurance", "Customer deposits regulation"],
    workflowHighlights: ["Booking management", "Visa application tracking", "Package builder", "Supplier coordination", "Customer documents", "Payment collection", "Supplier settlement", "Commission tracking"],
    entityTypes: ["travel_booking", "visa_application", "tour_package", "supplier_invoice"],
    defaultModules: ["travel", "sales", "purchase", "accounting", "crm", "documents"],
    groupTitles: ["Travel & Tourism"],
    saudiMarketNotes: ["Outbound travel dominates", "Visa services add revenue", "Corporate accounts stable", "Supplier credit terms critical"]
  },
  {
    value: "hajj_umrah" as BusinessCategory,
    label: "Hajj & Umrah Operations",
    labelAr: "عمليات الحج والعمرة",
    icon: "Mosque",
    color: "from-green-600 to-emerald-700",
    description: "Pilgrim packages, group management, passport/visa, hotel/transport allocation, installments",
    descriptionAr: "باقات الحجاج، إدارة المجموعات، جوازات/تأشيرات، تخصيص فنادق/نقل، أقساط",
    subCategories: ["Umrah Packages", "Hajj Packages", "VIP Packages", "Group Umrah", "Corporate Umrah"],
    subCategoriesAr: ["باقات عمرة", "باقات حج", "باقات VIP", "عمرة جماعية", "عمرة شركات"],
    complianceNotes: ["Ministry of Hajj license", "Nusuk platform integration", "Passport verification", "Hotel allocations", "Transport permits", "Group leader requirements"],
    workflowHighlights: ["Package creation", "Pilgrim registration", "Passport collection", "Visa processing", "Hotel allocation", "Transport scheduling", "Group assignment", "Installment billing", "Travel documents"],
    entityTypes: ["umrah_package", "pilgrim", "group", "allocation", "travel_document"],
    defaultModules: ["travel", "sales", "accounting", "crm", "documents", "transport"],
    groupTitles: ["Travel & Tourism", "Religious Services"],
    saudiMarketNotes: ["Highly regulated sector", "Ramadan/Hajj season peaks", "Installment payments common", "Group leader coordination critical", "Nusuk integration mandatory"]
  },
  {
    value: "tour_operator" as BusinessCategory,
    label: "Tour Operator & Excursions",
    labelAr: "منظم رحلات وجولات",
    icon: "MapPin",
    color: "from-orange-600 to-red-700",
    description: "Tour programs, guide assignment, activity bookings, group management, transport coordination",
    descriptionAr: "برامج الجولات، تعيين المرشدين، حجز الأنشطة، إدارة المجموعات، تنسيق النقل",
    subCategories: ["City Tours", "Desert Tours", "Historical Tours", "Adventure Tours", "Cultural Tours", "Day Trips"],
    subCategoriesAr: ["جولات المدينة", "رحلات صحراوية", "جولات تاريخية", "جولات مغامرة", "جولات ثقافية", "رحلات يومية"],
    complianceNotes: ["Tourism license", "Guide certifications", "Activity permits", "Insurance coverage", "Vehicle permits", "Site access permissions"],
    workflowHighlights: ["Tour catalog", "Booking management", "Guide assignment", "Transport coordination", "Activity reservations", "Group manifest", "Customer waivers", "Feedback collection"],
    entityTypes: ["tour_program", "tour_booking", "guide", "activity"],
    defaultModules: ["travel", "transport", "sales", "hrm", "accounting", "crm"],
    groupTitles: ["Travel & Tourism"],
    saudiMarketNotes: ["AlUla, NEOM, Red Sea growing", "Domestic tourism increasing", "Multi-language guides needed", "Safety protocols essential"]
  }
];

// MANUFACTURING & INDUSTRIAL CATEGORIES
export const MANUFACTURING_CATEGORIES: BusinessCatalogItem[] = [
  {
    value: "food_manufacturing" as BusinessCategory,
    label: "Food Manufacturing & Processing",
    labelAr: "تصنيع ومعالجة الأغذية",
    icon: "Factory",
    color: "from-green-600 to-lime-700",
    description: "Production batches, recipe BOM, quality control, expiry tracking, food safety, distribution",
    descriptionAr: "دفعات الإنتاج، قائمة مواد الوصفة، مراقبة الجودة، تتبع الصلاحية، سلامة الغذاء، التوزيع",
    subCategories: ["Dairy Processing", "Dates Packaging", "Meat Processing", "Frozen Foods", "Bottled Water", "Juice Factory", "Snacks Factory", "Bakery Factory"],
    subCategoriesAr: ["معالجة ألبان", "تعبئة تمور", "معالجة لحوم", "مجمدات", "مياه معبأة", "مصنع عصير", "مصنع وجبات خفيفة", "مصنع مخبوزات"],
    complianceNotes: ["SFDA registration", "Halal certification", "Food safety standards", "Lab testing", "Expiry labeling", "Recall procedures", "Worker health certificates"],
    workflowHighlights: ["Recipe/BOM", "Production planning", "Batch production", "Quality sampling", "Batch/lot tracking", "Expiry management", "Cold storage", "Label printing", "Distributor orders", "Recall traceability"],
    entityTypes: ["recipe", "production_batch", "quality_sample", "distributor_order"],
    defaultModules: ["manufacturing", "inventory", "sales", "purchase", "accounting", "hrm"],
    groupTitles: ["Manufacturing", "Food & Beverage"],
    saudiMarketNotes: ["Halal certification critical", "Cold chain essential", "Distributor network key", "SFDA compliance strict"]
  },
  {
    value: "plastic_factory" as BusinessCategory,
    label: "Plastic & Packaging Factory",
    labelAr: "مصنع بلاستيك وتعبئة",
    icon: "Package2",
    color: "from-blue-600 to-indigo-700",
    description: "Injection/extrusion, mold management, production orders, scrap tracking, customer specs",
    descriptionAr: "حقن/بثق، إدارة القوالب، أوامر إنتاج، تتبع المخلفات، مواصفات العملاء",
    subCategories: ["Plastic Bags", "Bottles", "Containers", "Pipes", "Packaging", "Custom Molding"],
    subCategoriesAr: ["أكياس بلاستيك", "زجاجات", "حاويات", "أنابيب", "تعبئة", "قولبة حسب الطلب"],
    complianceNotes: ["Industrial license", "Environmental permits", "Waste management", "Quality standards", "Customer specifications"],
    workflowHighlights: ["Customer specifications", "Mold setup", "Production runs", "Quality checks", "Scrap/wastage tracking", "Finished goods", "Delivery scheduling"],
    entityTypes: ["production_order", "mold", "quality_check", "scrap_log"],
    defaultModules: ["manufacturing", "inventory", "sales", "purchase", "accounting"],
    groupTitles: ["Manufacturing", "Industrial"],
    saudiMarketNotes: ["Raw material price volatility", "Custom orders common", "Quality consistency critical", "Scrap management affects margin"]
  },
  {
    value: "metal_fabrication" as BusinessCategory,
    label: "Metal Fabrication & Welding",
    labelAr: "تصنيع وحدادة المعادن",
    icon: "Hammer",
    color: "from-gray-700 to-slate-800",
    description: "Cutting lists, welding jobs, quality inspection, surface treatment, site installation",
    descriptionAr: "قوائم القص، أعمال اللحام، فحص الجودة، معالجة السطح، التركيب الموقعي",
    subCategories: ["Steel Structure", "Aluminum Works", "Gates & Railings", "Tanks", "Custom Fabrication", "CNC Cutting"],
    subCategoriesAr: ["هيكل فولاذي", "أعمال ألمنيوم", "بوابات وسور", "خزانات", "تصنيع حسب الطلب", "قص CNC"],
    complianceNotes: ["Industrial license", "Welder certifications", "Quality testing", "Safety standards", "Site installation permits"],
    workflowHighlights: ["Drawing review", "Cutting list", "Production job card", "Welding assignment", "Quality inspection", "Surface treatment", "Site installation", "Project billing"],
    entityTypes: ["fabrication_job", "cutting_list", "welding_task", "installation"],
    defaultModules: ["manufacturing", "projects", "inventory", "sales", "accounting"],
    groupTitles: ["Manufacturing", "Construction Support"],
    saudiMarketNotes: ["Construction boom drives demand", "Welder skill shortage", "Site installation critical", "Payment on delivery common"]
  }
];

// AGRICULTURE & FARMING CATEGORIES
export const AGRICULTURE_CATEGORIES: BusinessCatalogItem[] = [
  {
    value: "dates_farm" as BusinessCategory,
    label: "Dates Farm & Processing",
    labelAr: "مزرعة ومعالجة التمور",
    icon: "Sprout",
    color: "from-amber-600 to-orange-700",
    description: "Palm management, harvest tracking, grading, packaging, cold storage, sales",
    descriptionAr: "إدارة النخيل، تتبع الحصاد، الفرز، التعبئة، التخزين البارد، المبيعات",
    subCategories: ["Date Palm Farm", "Date Packaging", "Date Export", "Organic Dates"],
    subCategoriesAr: ["مزرعة نخيل", "تعبئة تمور", "تصدير تمور", "تمور عضوية"],
    complianceNotes: ["Agricultural license", "Organic certification (if applicable)", "Export permits", "SFDA food registration", "Phytosanitary certificate"],
    workflowHighlights: ["Palm registry", "Irrigation schedule", "Fertilizer/pesticide log", "Harvest planning", "Grading (Khalas, Sukkari, etc.)", "Packaging", "Cold storage", "Sales orders", "Export documentation"],
    entityTypes: ["palm_tree", "harvest_batch", "grade", "packaging_lot"],
    defaultModules: ["agriculture", "inventory", "sales", "manufacturing", "accounting"],
    groupTitles: ["Agriculture", "Food Processing"],
    saudiMarketNotes: ["Premium varieties (Sukkari, Ajwa) command high prices", "Ramadan peak demand", "Export to international markets", "Cold storage essential for quality"]
  },
  {
    value: "poultry_farm" as BusinessCategory,
    label: "Poultry & Egg Production",
    labelAr: "مزرعة دواجن وإنتاج بيض",
    icon: "Bird",
    color: "from-yellow-600 to-amber-700",
    description: "Flock management, feed tracking, egg collection, mortality, vaccination, sales",
    descriptionAr: "إدارة القطيع، تتبع الأعلاف، جمع البيض، الوفيات، التطعيم، المبيعات",
    subCategories: ["Broiler Production", "Layer Farm", "Hatchery", "Organic Poultry"],
    subCategoriesAr: ["إنتاج دجاج لاحم", "مزرعة بيض", "مفرخ", "دواجن عضوية"],
    complianceNotes: ["Veterinary permits", "Health certifications", "Biosecurity protocols", "Slaughter permits (broilers)", "Environmental compliance"],
    workflowHighlights: ["Flock batches", "Feed consumption", "Egg collection (layers)", "Weight tracking (broilers)", "Vaccination schedule", "Mortality logging", "Sales (live/processed)", "Health monitoring"],
    entityTypes: ["flock_batch", "feed_consumption", "egg_collection", "vaccination", "mortality_log"],
    defaultModules: ["agriculture", "inventory", "sales", "purchase", "accounting"],
    groupTitles: ["Agriculture", "Livestock"],
    saudiMarketNotes: ["High demand year-round", "Feed cost 60-70% of expense", "Disease outbreaks risk", "Cold chain for egg distribution"]
  },
  {
    value: "greenhouse" as BusinessCategory,
    label: "Greenhouse & Hydroponic Farm",
    labelAr: "بيوت محمية وزراعة مائية",
    icon: "Leaf",
    color: "from-green-600 to-emerald-700",
    description: "Crop cycles, climate control, nutrient tracking, harvest, quality grading, sales",
    descriptionAr: "دورات المحاصيل، التحكم في المناخ، تتبع المغذيات، الحصاد، تصنيف الجودة، المبيعات",
    subCategories: ["Vegetable Production", "Hydroponic Farm", "Organic Greenhouse", "Flowers & Ornamentals"],
    subCategoriesAr: ["إنتاج خضروات", "زراعة مائية", "بيوت محمية عضوية", "زهور ونباتات زينة"],
    complianceNotes: ["Agricultural license", "Organic certification (if applicable)", "Water usage permits", "Pesticide regulations", "Quality standards"],
    workflowHighlights: ["Crop planting schedule", "Climate/irrigation control", "Nutrient solution tracking", "Pest management", "Harvest logging", "Quality grading", "Packaging", "Sales orders"],
    entityTypes: ["crop_cycle", "greenhouse_section", "harvest_batch", "quality_grade"],
    defaultModules: ["agriculture", "inventory", "sales", "purchase", "accounting"],
    groupTitles: ["Agriculture", "Modern Farming"],
    saudiMarketNotes: ["Water scarcity drives hydroponic adoption", "Year-round production possible", "Premium pricing for organic", "Supermarket contracts stable"]
  }
];

// SPECIALTY BUSINESS CATEGORIES
export const SPECIALTY_CATEGORIES: BusinessCatalogItem[] = [
  {
    value: "gold_shop" as BusinessCategory,
    label: "Gold & Jewelry Shop",
    labelAr: "محل ذهب ومجوهرات",
    icon: "Gem",
    color: "from-yellow-600 to-amber-700",
    description: "Gold rate tracking, weight/carat, making charges, stone details, buyback, repair",
    descriptionAr: "تتبع سعر الذهب، الوزن/العيار، مصنعية، تفاصيل الأحجار، الاسترجاع، الإصلاح",
    subCategories: ["Gold Retail", "Jewelry Workshop", "Diamond Shop", "Watch Shop", "Silver Shop"],
    subCategoriesAr: ["ذهب تجزئة", "ورشة مجوهرات", "محل ألماس", "محل ساعات", "محل فضة"],
    complianceNotes: ["Ministry of Commerce license", "Gold assay certification", "Diamond certificates", "Transaction documentation", "Security measures"],
    workflowHighlights: ["Gold rate updates", "Item weight/carat", "Making charges", "Stone details", "Certificate attachment", "Sales invoice", "Buyback transactions", "Repair jobs", "Serial tracking"],
    entityTypes: ["gold_item", "stone", "certificate", "buyback", "repair_job"],
    defaultModules: ["pos_retail", "inventory", "sales", "accounting"],
    groupTitles: ["Retail", "Jewelry"],
    saudiMarketNotes: ["Gold rate fluctuation daily", "Making charges vary by design complexity", "Wedding season peaks", "Buyback/exchange common"]
  },
  {
    value: "mobile_shop" as BusinessCategory,
    label: "Mobile & Electronics Retail",
    labelAr: "محل جوالات وإلكترونيات",
    icon: "Smartphone",
    color: "from-blue-600 to-indigo-700",
    description: "IMEI tracking, warranty, installments, trade-ins, repair services, accessories",
    descriptionAr: "تتبع IMEI، الضمان، أقساط، استبدال، خدمات الإصلاح، الإكسسوارات",
    subCategories: ["Mobile Shop", "Computer Store", "Gaming Shop", "Electronics Retail", "Phone Repair"],
    subCategoriesAr: ["محل جوالات", "محل كمبيوتر", "محل ألعاب", "إلكترونيات", "إصلاح جوالات"],
    complianceNotes: ["Commercial license", "Warranty terms", "Installment regulations", "Trade-in documentation", "IMEI registration"],
    workflowHighlights: ["IMEI/serial inventory", "Warranty tracking", "Trade-in assessment", "Installment plans", "Repair tickets", "Accessories bundling", "Supplier returns"],
    entityTypes: ["mobile_device", "serial_item", "warranty", "repair_ticket", "trade_in"],
    defaultModules: ["pos_retail", "repair", "inventory", "sales", "installments", "accounting"],
    groupTitles: ["Retail", "Electronics"],
    saudiMarketNotes: ["iPhone dominates premium segment", "Installment sales growing", "Repair services add revenue", "Trade-in programs popular"]
  },
  {
    value: "veterinary" as BusinessCategory,
    label: "Veterinary Clinic & Pet Services",
    labelAr: "عيادة بيطرية وخدمات حيوانات",
    icon: "PawPrint",
    color: "from-teal-600 to-cyan-700",
    description: "Pet profiles, appointments, vaccinations, medical records, grooming, boarding",
    descriptionAr: "ملفات الحيوانات، المواعيد، التطعيمات، السجلات الطبية، العناية، الإيواء",
    subCategories: ["Veterinary Clinic", "Pet Grooming", "Pet Boarding", "Animal Pharmacy", "Farm Vet Services"],
    subCategoriesAr: ["عيادة بيطرية", "العناية بالحيوانات", "إيواء حيوانات", "صيدلية بيطرية", "خدمات بيطرية للمزارع"],
    complianceNotes: ["Veterinary license", "Controlled medicine regulations", "Animal welfare standards", "Waste disposal", "Staff certifications"],
    workflowHighlights: ["Pet registration", "Owner profile", "Appointment booking", "Medical consultation", "Vaccination tracking", "Prescription", "Grooming packages", "Boarding calendar", "Medical history"],
    entityTypes: ["pet", "owner", "appointment", "vaccination", "medical_record", "boarding"],
    defaultModules: ["veterinary", "healthcare", "crm", "sales", "pharmacy", "accounting"],
    groupTitles: ["Healthcare", "Pet Services"],
    saudiMarketNotes: ["Growing pet ownership in cities", "Vaccination compliance important", "Grooming services popular", "Emergency services premium pricing"]
  },
  {
    value: "printing" as BusinessCategory,
    label: "Printing & Publishing Services",
    labelAr: "خدمات الطباعة والنشر",
    icon: "Printer",
    color: "from-purple-600 to-pink-700",
    description: "Job costing, design approval, print queue, material usage, delivery, invoicing",
    descriptionAr: "تكلفة الأعمال، اعتماد التصميم، قائمة الطباعة، استخدام المواد، التسليم، الفواتير",
    subCategories: ["Digital Printing", "Offset Printing", "Signage", "Vehicle Branding", "Packaging Printing", "Business Cards"],
    subCategoriesAr: ["طباعة رقمية", "طباعة أوفست", "لوحات", "تغليف مركبات", "طباعة تغليف", "بطاقات أعمال"],
    complianceNotes: ["Commercial license", "Design copyrights", "Material safety", "Environmental compliance", "Quality standards"],
    workflowHighlights: ["Quotation by size/material", "Design upload", "Proof approval", "Print job queue", "Material tracking", "Quality check", "Finishing (lamination, cutting)", "Delivery/installation"],
    entityTypes: ["print_job", "design_file", "material", "proof_approval"],
    defaultModules: ["projects", "inventory", "sales", "accounting"],
    groupTitles: ["Services", "Production"],
    saudiMarketNotes: ["Corporate branding projects lucrative", "Quick turnaround competitive advantage", "Material cost fluctuates", "Installation adds value"]
  },
  {
    value: "tailor" as BusinessCategory,
    label: "Tailor & Clothing Alteration",
    labelAr: "خياط وتعديل ملابس",
    icon: "Shirt",
    color: "from-indigo-600 to-purple-700",
    description: "Measurements, fabric selection, fittings, alterations, delivery, repeat templates",
    descriptionAr: "القياسات، اختيار القماش، التجربة، التعديلات، التسليم، قوالب متكررة",
    subCategories: ["Men's Tailor", "Abaya Shop", "Uniform Supplier", "Alteration Services", "Bridal Tailoring"],
    subCategoriesAr: ["خياط رجالي", "محل عبايات", "موّرد بدلات", "خدمات تعديل", "خياطة عرائس"],
    complianceNotes: ["Commercial license", "Fabric supplier documentation", "Customer measurement privacy", "Delivery timeline agreements"],
    workflowHighlights: ["Measurement recording", "Fabric selection", "Design reference", "Production stages", "Fitting appointments", "Alterations", "Final delivery", "Repeat customer templates"],
    entityTypes: ["customer_measurements", "garment_order", "fabric", "fitting"],
    defaultModules: ["tailoring", "sales", "inventory", "crm", "accounting"],
    groupTitles: ["Retail", "Custom Services"],
    saudiMarketNotes: ["Thobe and abaya market large", "Wedding season peaks", "Repeat customers valuable", "Measurement accuracy critical"]
  }
];

// Export complete combined array (56+ categories!)
export const EXTENDED_SAUDI_CATEGORIES = [
  ...AUTOMOTIVE_CATEGORIES,
  ...CONSTRUCTION_CATEGORIES,
  ...HEALTHCARE_CATEGORIES,
  ...RETAIL_CATEGORIES,
  ...FOOD_BEVERAGE_CATEGORIES,
  ...SERVICES_CATEGORIES,
  ...LOGISTICS_CATEGORIES,
  ...EDUCATION_CATEGORIES,
  ...PROFESSIONAL_CATEGORIES,
  ...HOSPITALITY_CATEGORIES,
  ...TRAVEL_CATEGORIES,
  ...MANUFACTURING_CATEGORIES,
  ...AGRICULTURE_CATEGORIES,
  ...SPECIALTY_CATEGORIES
];
