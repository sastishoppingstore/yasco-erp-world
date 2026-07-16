/**
 * RAWAFED UNIVERSAL SAAS - Demo Data Seeds
 * Realistic Arabic/English demo data for all 50+ business categories
 * Use this for instant demos, testing, and customer presentations
 */

import type { BusinessCategory } from "./businessCatalog";

export interface DemoCustomer {
  id: string;
  name: string;
  nameAr: string;
  phone: string;
  email: string;
  vatNumber?: string;
  address?: string;
  addressAr?: string;
}

export interface DemoProduct {
  id: string;
  name: string;
  nameAr: string;
  sku: string;
  barcode?: string;
  price: number;
  cost?: number;
  category: string;
  unit: string;
  stock?: number;
}

export interface DemoInvoice {
  id: string;
  customer: string;
  date: string;
  items: Array<{
    product: string;
    qty: number;
    price: number;
  }>;
  total: number;
  status: "paid" | "pending" | "overdue";
}

export interface DemoEmployee {
  id: string;
  name: string;
  nameAr: string;
  position: string;
  positionAr: string;
  department: string;
  salary: number;
  hireDate: string;
  nationalId: string;
}

export interface DemoCategorySeeds {
  customers: DemoCustomer[];
  products: DemoProduct[];
  invoices: DemoInvoice[];
  employees: DemoEmployee[];
  // Category-specific entities
  entities?: Record<string, any[]>;
}

// ============================================================================
// AUTOMOTIVE WORKSHOP DEMO DATA
// ============================================================================

export const WORKSHOP_SEEDS: DemoCategorySeeds = {
  customers: [
    {
      id: "CUST-001",
      name: "Ahmed Al-Shehri",
      nameAr: "أحمد الشهري",
      phone: "+966 50 123 4567",
      email: "ahmed.shehri@example.com",
      address: "Riyadh, Olaya District"
    },
    {
      id: "CUST-002",
      name: "Mohammed Al-Otaibi",
      nameAr: "محمد العتيبي",
      phone: "+966 55 987 6543",
      email: "m.otaibi@example.com",
      address: "Jeddah, Al-Rawdah"
    },
    {
      id: "CUST-003",
      name: "Khalid Al-Mutairi",
      nameAr: "خالد المطيري",
      phone: "+966 53 456 7890",
      email: "khalid.m@example.com",
      address: "Dammam, Al-Faisaliah"
    }
  ],
  products: [
    {
      id: "PROD-001",
      name: "Engine Oil 5W-30",
      nameAr: "زيت محرك 5W-30",
      sku: "OIL-5W30",
      barcode: "6281234567890",
      price: 120,
      cost: 85,
      category: "Oils & Lubricants",
      unit: "Liter",
      stock: 50
    },
    {
      id: "PROD-002",
      name: "Brake Pads - Toyota",
      nameAr: "فحمات فرامل - تويوتا",
      sku: "BP-TOY-001",
      barcode: "6281234567891",
      price: 250,
      cost: 180,
      category: "Brake System",
      unit: "Set",
      stock: 25
    },
    {
      id: "PROD-003",
      name: "Air Filter",
      nameAr: "فلتر هواء",
      sku: "AF-UNI-001",
      barcode: "6281234567892",
      price: 80,
      cost: 50,
      category: "Filters",
      unit: "Piece",
      stock: 40
    },
    {
      id: "PROD-004",
      name: "Labor - Oil Change",
      nameAr: "عمالة - تغيير زيت",
      sku: "SVC-OIL",
      price: 50,
      category: "Services",
      unit: "Service"
    },
    {
      id: "PROD-005",
      name: "Labor - Brake Service",
      nameAr: "عمالة - صيانة فرامل",
      sku: "SVC-BRAKE",
      price: 150,
      category: "Services",
      unit: "Service"
    }
  ],
  invoices: [
    {
      id: "INV-2026-001",
      customer: "CUST-001",
      date: "2026-07-08",
      items: [
        { product: "PROD-001", qty: 4, price: 120 },
        { product: "PROD-004", qty: 1, price: 50 }
      ],
      total: 530,
      status: "paid"
    },
    {
      id: "INV-2026-002",
      customer: "CUST-002",
      date: "2026-07-07",
      items: [
        { product: "PROD-002", qty: 1, price: 250 },
        { product: "PROD-005", qty: 1, price: 150 }
      ],
      total: 400,
      status: "paid"
    }
  ],
  employees: [
    {
      id: "EMP-001",
      name: "Fahad Al-Otaibi",
      nameAr: "فهد العتيبي",
      position: "Senior Technician",
      positionAr: "فني أول",
      department: "Workshop",
      salary: 5000,
      hireDate: "2023-01-15",
      nationalId: "1234567890"
    },
    {
      id: "EMP-002",
      name: "Imran Ahmed",
      nameAr: "عمران أحمد",
      position: "Technician",
      positionAr: "فني",
      department: "Workshop",
      salary: 3500,
      hireDate: "2024-03-20",
      nationalId: "2345678901"
    }
  ],
  entities: {
    vehicles: [
      {
        id: "VEH-001",
        plate: "ر ص ب 1234",
        vin: "JTDBT923X91234567",
        make: "Toyota",
        model: "Camry",
        year: 2022,
        color: "White",
        customer: "CUST-001",
        odometer: 45000,
        lastService: "2026-05-15"
      },
      {
        id: "VEH-002",
        plate: "د ه و 5678",
        vin: "WBADT43462G123456",
        make: "BMW",
        model: "320i",
        year: 2021,
        color: "Black",
        customer: "CUST-002",
        odometer: 32000,
        lastService: "2026-06-10"
      }
    ],
    jobCards: [
      {
        id: "JC-2026-001",
        vehicle: "VEH-001",
        customer: "CUST-001",
        date: "2026-07-08",
        issue: "Oil change + brake inspection",
        issueAr: "تغيير زيت + فحص فرامل",
        status: "in_progress",
        bay: "Bay 3",
        technician: "EMP-001",
        estimatedCost: 530,
        estimatedHours: 2
      },
      {
        id: "JC-2026-002",
        vehicle: "VEH-002",
        customer: "CUST-002",
        date: "2026-07-07",
        issue: "Brake replacement",
        issueAr: "تبديل فرامل",
        status: "completed",
        bay: "Bay 1",
        technician: "EMP-002",
        estimatedCost: 400,
        actualCost: 400,
        completedDate: "2026-07-07"
      }
    ]
  }
};

// ============================================================================
// MEDICAL CLINIC DEMO DATA
// ============================================================================

export const CLINIC_SEEDS: DemoCategorySeeds = {
  customers: [
    {
      id: "PAT-001",
      name: "Fatima Al-Harbi",
      nameAr: "فاطمة الحربي",
      phone: "+966 50 222 3333",
      email: "fatima.h@example.com",
      address: "Riyadh, King Fahd Road"
    },
    {
      id: "PAT-002",
      name: "Abdullah Al-Qarni",
      nameAr: "عبدالله القرني",
      phone: "+966 55 444 5555",
      email: "abdullah.q@example.com",
      address: "Jeddah, Al-Zahra"
    }
  ],
  products: [
    {
      id: "SVC-001",
      name: "General Consultation",
      nameAr: "استشارة عامة",
      sku: "CONS-GEN",
      price: 150,
      category: "Consultation",
      unit: "Visit"
    },
    {
      id: "SVC-002",
      name: "Follow-up Visit",
      nameAr: "زيارة متابعة",
      sku: "CONS-FOLLOWUP",
      price: 100,
      category: "Consultation",
      unit: "Visit"
    },
    {
      id: "LAB-001",
      name: "Complete Blood Count (CBC)",
      nameAr: "فحص الدم الشامل",
      sku: "LAB-CBC",
      price: 80,
      category: "Laboratory",
      unit: "Test"
    },
    {
      id: "MED-001",
      name: "Paracetamol 500mg",
      nameAr: "باراسيتامول 500 مجم",
      sku: "MED-PARA500",
      barcode: "6281234567893",
      price: 15,
      cost: 8,
      category: "Medicines",
      unit: "Box",
      stock: 100
    }
  ],
  invoices: [
    {
      id: "INV-2026-001",
      customer: "PAT-001",
      date: "2026-07-08",
      items: [
        { product: "SVC-001", qty: 1, price: 150 },
        { product: "LAB-001", qty: 1, price: 80 },
        { product: "MED-001", qty: 2, price: 15 }
      ],
      total: 260,
      status: "paid"
    }
  ],
  employees: [
    {
      id: "DOC-001",
      name: "Dr. Khalid Al-Zahrani",
      nameAr: "د. خالد الزهراني",
      position: "General Physician",
      positionAr: "طبيب عام",
      department: "Medical",
      salary: 20000,
      hireDate: "2020-01-10",
      nationalId: "3456789012"
    },
    {
      id: "NUR-001",
      name: "Aisha Mohammed",
      nameAr: "عائشة محمد",
      position: "Nurse",
      positionAr: "ممرضة",
      department: "Nursing",
      salary: 7000,
      hireDate: "2021-06-15",
      nationalId: "4567890123"
    }
  ],
  entities: {
    appointments: [
      {
        id: "APT-001",
        patient: "PAT-001",
        doctor: "DOC-001",
        date: "2026-07-08",
        time: "10:00",
        type: "General Consultation",
        status: "completed",
        notes: "Routine check-up"
      },
      {
        id: "APT-002",
        patient: "PAT-002",
        doctor: "DOC-001",
        date: "2026-07-08",
        time: "11:00",
        type: "Follow-up",
        status: "scheduled"
      }
    ]
  }
};

// ============================================================================
// RESTAURANT DEMO DATA
// ============================================================================

export const RESTAURANT_SEEDS: DemoCategorySeeds = {
  customers: [
    {
      id: "WALK-001",
      name: "Walk-in Customer",
      nameAr: "زبون مباشر",
      phone: "+966 50 000 0000",
      email: ""
    }
  ],
  products: [
    {
      id: "FOOD-001",
      name: "Chicken Kabsa",
      nameAr: "كبسة دجاج",
      sku: "FOOD-KABSA-CHK",
      price: 35,
      cost: 12,
      category: "Main Course",
      unit: "Plate"
    },
    {
      id: "FOOD-002",
      name: "Lamb Mandi",
      nameAr: "مندي لحم",
      sku: "FOOD-MANDI-LAMB",
      price: 45,
      cost: 18,
      category: "Main Course",
      unit: "Plate"
    },
    {
      id: "BEV-001",
      name: "Fresh Orange Juice",
      nameAr: "عصير برتقال طازج",
      sku: "BEV-ORANGE",
      price: 12,
      cost: 4,
      category: "Beverages",
      unit: "Glass"
    },
    {
      id: "BEV-002",
      name: "Soft Drink",
      nameAr: "مشروب غازي",
      sku: "BEV-SOFTDRINK",
      price: 5,
      cost: 2,
      category: "Beverages",
      unit: "Can",
      stock: 200
    }
  ],
  invoices: [
    {
      id: "POS-001",
      customer: "WALK-001",
      date: "2026-07-08",
      items: [
        { product: "FOOD-001", qty: 2, price: 35 },
        { product: "BEV-001", qty: 2, price: 12 }
      ],
      total: 94,
      status: "paid"
    },
    {
      id: "POS-002",
      customer: "WALK-001",
      date: "2026-07-08",
      items: [
        { product: "FOOD-002", qty: 1, price: 45 },
        { product: "BEV-002", qty: 3, price: 5 }
      ],
      total: 60,
      status: "paid"
    }
  ],
  employees: [
    {
      id: "CHEF-001",
      name: "Hassan Ali",
      nameAr: "حسن علي",
      position: "Head Chef",
      positionAr: "رئيس الطهاة",
      department: "Kitchen",
      salary: 6000,
      hireDate: "2022-03-10",
      nationalId: "5678901234"
    },
    {
      id: "WAIT-001",
      name: "Yousef Ibrahim",
      nameAr: "يوسف إبراهيم",
      position: "Waiter",
      positionAr: "نادل",
      department: "Service",
      salary: 3000,
      hireDate: "2023-07-15",
      nationalId: "6789012345"
    }
  ]
};

// ============================================================================
// CONSTRUCTION DEMO DATA
// ============================================================================

export const CONSTRUCTION_SEEDS: DemoCategorySeeds = {
  customers: [
    {
      id: "PROJ-001",
      name: "Al-Rajhi Development Co.",
      nameAr: "شركة الراجحي للتطوير",
      phone: "+966 11 234 5678",
      email: "projects@alrajhi-dev.com.sa",
      vatNumber: "300123456700003",
      address: "Riyadh, King Abdullah Financial District"
    },
    {
      id: "PROJ-002",
      name: "Dar Al-Binaa Real Estate",
      nameAr: "دار البناء العقارية",
      phone: "+966 12 345 6789",
      email: "info@daralbin aa.com.sa",
      vatNumber: "300234567800003",
      address: "Jeddah, Al-Salamah"
    }
  ],
  products: [
    {
      id: "MAT-001",
      name: "Cement (50kg bag)",
      nameAr: "أسمنت (كيس 50 كجم)",
      sku: "MAT-CEM-50",
      price: 25,
      cost: 20,
      category: "Materials",
      unit: "Bag",
      stock: 500
    },
    {
      id: "MAT-002",
      name: "Steel Rebar 12mm",
      nameAr: "حديد تسليح 12 مم",
      sku: "MAT-STL-12",
      price: 3500,
      cost: 3200,
      category: "Materials",
      unit: "Ton",
      stock: 10
    },
    {
      id: "LAB-001",
      name: "General Labor",
      nameAr: "عمالة عامة",
      sku: "LAB-GEN",
      price: 150,
      category: "Labor",
      unit: "Day"
    }
  ],
  invoices: [],
  employees: [
    {
      id: "ENG-001",
      name: "Eng. Saad Al-Ghamdi",
      nameAr: "م. سعد الغامدي",
      position: "Project Manager",
      positionAr: "مدير مشروع",
      department: "Engineering",
      salary: 15000,
      hireDate: "2021-02-01",
      nationalId: "7890123456"
    },
    {
      id: "SUP-001",
      name: "Tariq Al-Shammari",
      nameAr: "طارق الشمري",
      position: "Site Supervisor",
      positionAr: "مشرف موقع",
      department: "Construction",
      salary: 8000,
      hireDate: "2022-05-10",
      nationalId: "8901234567"
    }
  ],
  entities: {
    projects: [
      {
        id: "PRJ-001",
        name: "Al-Nakheel Residential Complex",
        nameAr: "مجمع النخيل السكني",
        customer: "PROJ-001",
        startDate: "2026-01-15",
        endDate: "2027-01-15",
        budget: 5000000,
        status: "in_progress",
        progress: 35
      },
      {
        id: "PRJ-002",
        name: "Al-Zahra Commercial Center",
        nameAr: "مركز الزهراء التجاري",
        customer: "PROJ-002",
        startDate: "2026-03-01",
        endDate: "2026-12-31",
        budget: 3000000,
        status: "in_progress",
        progress: 20
      }
    ]
  }
};

// ============================================================================
// SEED DATA REGISTRY
// ============================================================================

export const DEMO_SEEDS_BY_CATEGORY: Record<BusinessCategory, DemoCategorySeeds> = {
  workshop: WORKSHOP_SEEDS,
  medical_clinic: CLINIC_SEEDS,
  dental_center: CLINIC_SEEDS, // Reuse with modifications
  pharmacy: CLINIC_SEEDS,
  restaurant: RESTAURANT_SEEDS,
  cafe: RESTAURANT_SEEDS,
  construction: CONSTRUCTION_SEEDS,
  
  // Default minimal seeds for other categories
  auto_parts: WORKSHOP_SEEDS,
  building_materials: CONSTRUCTION_SEEDS,
  supermarket: RESTAURANT_SEEDS,
  wholesale: RESTAURANT_SEEDS,
  bakery: RESTAURANT_SEEDS,
  catering: RESTAURANT_SEEDS,
  cloud_kitchen: RESTAURANT_SEEDS,
  food_truck: RESTAURANT_SEEDS,
  
  // Add more mappings as needed...
  // For categories without specific seeds, provide generic business data
  all: {
    customers: [],
    products: [],
    invoices: [],
    employees: []
  }
} as any; // Type assertion for now

/**
 * Get demo seeds for a specific business category
 */
export function getDemoSeeds(category: BusinessCategory): DemoCategorySeeds {
  return DEMO_SEEDS_BY_CATEGORY[category] || DEMO_SEEDS_BY_CATEGORY.all;
}

/**
 * Generate random demo data for testing
 */
export function generateRandomDemoData(category: BusinessCategory, count: number = 10) {
  const seeds = getDemoSeeds(category);
  // Implementation for random generation...
  return seeds;
}
