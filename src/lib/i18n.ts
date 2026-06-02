type Language = "en" | "ar";

const translations: Record<string, Record<Language, string>> = {
  "common.loading": { en: "Loading...", ar: "جار التحميل..." },
  "common.save": { en: "Save", ar: "حفظ" },
  "common.cancel": { en: "Cancel", ar: "إلغاء" },
  "common.delete": { en: "Delete", ar: "حذف" },
  "common.edit": { en: "Edit", ar: "تعديل" },
  "common.create": { en: "Create", ar: "إنشاء" },
  "common.search": { en: "Search", ar: "بحث" },
  "common.actions": { en: "Actions", ar: "إجراءات" },
  "common.status": { en: "Status", ar: "الحالة" },
  "common.noData": { en: "No data found", ar: "لا توجد بيانات" },
  "common.confirmDelete": { en: "Are you sure you want to delete this?", ar: "هل أنت متأكد من الحذف؟" },
  "common.error": { en: "An error occurred", ar: "حدث خطأ" },
  "common.success": { en: "Operation successful", ar: "تمت العملية بنجاح" },
  "common.back": { en: "Back", ar: "رجوع" },
  "common.submit": { en: "Submit", ar: "إرسال" },
  "common.close": { en: "Close", ar: "إغلاق" },

  "nav.dashboard": { en: "Dashboard", ar: "لوحة القيادة" },
  "nav.accounting": { en: "Accounting", ar: "المحاسبة" },
  "nav.inventory": { en: "Inventory", ar: "المخزون" },
  "nav.sales": { en: "Sales", ar: "المبيعات" },
  "nav.purchase": { en: "Purchase", ar: "المشتريات" },
  "nav.crm": { en: "CRM", ar: "إدارة العملاء" },
  "nav.hrm": { en: "HR", ar: "الموارد البشرية" },
  "nav.manufacturing": { en: "Manufacturing", ar: "التصنيع" },
  "nav.projects": { en: "Projects", ar: "المشاريع" },
  "nav.helpdesk": { en: "Help Desk", ar: "خدمة العملاء" },
  "nav.assets": { en: "Assets", ar: "الأصول" },
  "nav.reports": { en: "Reports", ar: "التقارير" },
  "nav.settings": { en: "Settings", ar: "الإعدادات" },

  "auth.login": { en: "Sign in with Kimi", ar: "تسجيل الدخول عبر كيمي" },
  "auth.logout": { en: "Sign Out", ar: "تسجيل الخروج" },
  "auth.profile": { en: "Profile", ar: "الملف الشخصي" },

  "dashboard.totalCustomers": { en: "Total Customers", ar: "إجمالي العملاء" },
  "dashboard.totalSuppliers": { en: "Total Suppliers", ar: "إجمالي الموردين" },
  "dashboard.totalProducts": { en: "Total Products", ar: "إجمالي المنتجات" },
  "dashboard.totalEmployees": { en: "Total Employees", ar: "إجمالي الموظفين" },
  "dashboard.revenue": { en: "Total Revenue", ar: "إجمالي الإيرادات" },
  "dashboard.payable": { en: "Total Payable", ar: "إجمالي المدفوعات" },
  "dashboard.openTickets": { en: "Open Tickets", ar: "التذاكر المفتوحة" },
  "dashboard.activeProjects": { en: "Active Projects", ar: "المشاريع النشطة" },
  "dashboard.lowStock": { en: "Low Stock Items", ar: "المنتجات منخفضة المخزون" },
  "dashboard.recentInvoices": { en: "Recent Invoices", ar: "آخر الفواتير" },
  "dashboard.topCustomers": { en: "Top Customers", ar: "أفضل العملاء" },
  "dashboard.revenueByMonth": { en: "Revenue by Month", ar: "الإيرادات الشهرية" },
  "dashboard.expenseByCategory": { en: "Expenses by Category", ar: "المصروفات حسب الفئة" },
  "dashboard.businessOverview": { en: "Business Overview", ar: "نظرة عامة على الأعمال" },

  "accounting.title": { en: "Accounting", ar: "المحاسبة" },
  "accounting.chartOfAccounts": { en: "Chart of Accounts", ar: "دليل الحسابات" },
  "accounting.journalEntries": { en: "Journal Entries", ar: "قيود اليومية" },
  "accounting.generalLedger": { en: "General Ledger", ar: "الأستاذ العام" },
  "accounting.trialBalance": { en: "Trial Balance", ar: "ميزان المراجعة" },
  "accounting.costCenters": { en: "Cost Centers", ar: "مراكز التكلفة" },
  "accounting.accountCode": { en: "Account Code", ar: "رمز الحساب" },
  "accounting.accountName": { en: "Account Name", ar: "اسم الحساب" },
  "accounting.debit": { en: "Debit", ar: "مدين" },
  "accounting.credit": { en: "Credit", ar: "دائن" },
  "accounting.balance": { en: "Balance", ar: "الرصيد" },

  "inventory.title": { en: "Inventory", ar: "المخزون" },
  "inventory.products": { en: "Products", ar: "المنتجات" },
  "inventory.stockLevels": { en: "Stock Levels", ar: "مستويات المخزون" },
  "inventory.warehouses": { en: "Warehouses", ar: "المستودعات" },
  "inventory.movements": { en: "Stock Movements", ar: "حركات المخزون" },
  "inventory.transfers": { en: "Transfers", ar: "التحويلات" },
  "inventory.sku": { en: "SKU", ar: "رمز المنتج" },
  "inventory.productName": { en: "Product Name", ar: "اسم المنتج" },
  "inventory.quantity": { en: "Quantity", ar: "الكمية" },
  "inventory.warehouse": { en: "Warehouse", ar: "المستودع" },

  "sales.title": { en: "Sales", ar: "المبيعات" },
  "sales.customers": { en: "Customers", ar: "العملاء" },
  "sales.invoices": { en: "Invoices", ar: "الفواتير" },
  "sales.quotations": { en: "Quotations", ar: "عروض الأسعار" },
  "sales.orders": { en: "Orders", ar: "الطلبات" },
  "sales.creditNotes": { en: "Credit Notes", ar: "إشعارات الدائن" },
  "sales.payments": { en: "Payments", ar: "المدفوعات" },
  "sales.invoiceNumber": { en: "Invoice #", ar: "رقم الفاتورة" },
  "sales.customer": { en: "Customer", ar: "العميل" },
  "sales.total": { en: "Total", ar: "الإجمالي" },
  "sales.date": { en: "Date", ar: "التاريخ" },
  "sales.dueDate": { en: "Due Date", ar: "تاريخ الاستحقاق" },
  "sales.status": { en: "Status", ar: "الحالة" },

  "purchase.title": { en: "Purchase", ar: "المشتريات" },
  "purchase.suppliers": { en: "Suppliers", ar: "الموردين" },
  "purchase.orders": { en: "Purchase Orders", ar: "أوامر الشراء" },
  "purchase.grn": { en: "Goods Received", ar: "إيصال الاستلام" },
  "purchase.payments": { en: "Supplier Payments", ar: "مدفوعات الموردين" },

  "crm.title": { en: "CRM", ar: "إدارة العملاء" },
  "crm.leads": { en: "Leads", ar: "العملاء المحتملين" },
  "crm.opportunities": { en: "Opportunities", ar: "الفرص" },
  "crm.activities": { en: "Activities", ar: "الأنشطة" },

  "hrm.title": { en: "Human Resources", ar: "الموارد البشرية" },
  "hrm.employees": { en: "Employees", ar: "الموظفين" },
  "hrm.departments": { en: "Departments", ar: "الأقسام" },
  "hrm.attendance": { en: "Attendance", ar: "الحضور" },
  "hrm.leave": { en: "Leave", ar: "الإجازات" },
  "hrm.payroll": { en: "Payroll", ar: "الرواتب" },
  "hrm.performance": { en: "Performance", ar: "الأداء" },

  "manufacturing.title": { en: "Manufacturing", ar: "التصنيع" },
  "manufacturing.bom": { en: "Bill of Materials", ar: "فاتورة المواد" },
  "manufacturing.workOrders": { en: "Work Orders", ar: "أوامر العمل" },
  "manufacturing.production": { en: "Production", ar: "الإنتاج" },

  "projects.title": { en: "Projects", ar: "المشاريع" },
  "projects.list": { en: "All Projects", ar: "جميع المشاريع" },
  "projects.tasks": { en: "Tasks", ar: "المهام" },
  "projects.timesheets": { en: "Timesheets", ar: "ساعات العمل" },

  "helpdesk.title": { en: "Help Desk", ar: "خدمة العملاء" },
  "helpdesk.tickets": { en: "Tickets", ar: "التذاكر" },
  "helpdesk.newTicket": { en: "New Ticket", ar: "تذكرة جديدة" },

  "assets.title": { en: "Assets", ar: "الأصول" },
  "assets.list": { en: "Asset List", ar: "قائمة الأصول" },
  "assets.fleet": { en: "Fleet Management", ar: "إدارة الأسطول" },

  "reports.title": { en: "Reports", ar: "التقارير" },
  "recharts.salesReport": { en: "Sales Report", ar: "تقرير المبيعات" },
  "recharts.financialReport": { en: "Financial Report", ar: "التقرير المالي" },

  "settings.title": { en: "Settings", ar: "الإعدادات" },
  "settings.company": { en: "Company", ar: "الشركة" },
  "settings.finance": { en: "Finance", ar: "المالية" },
  "settings.appearance": { en: "Appearance", ar: "المظهر" },
  "settings.compliance": { en: "Compliance", ar: "الامتثال" },

  "pos.title": { en: "Point of Sale", ar: "نقطة البيع" },
  "pos.search": { en: "Search items...", ar: "بحث عن منتجات..." },
  "pos.cart": { en: "Cart", ar: "السلة" },
  "pos.pay": { en: "Pay", ar: "دفع" },
  "pos.hold": { en: "Hold", ar: "تعليق" },
  "pos.resume": { en: "Resume", ar: "استئناف" },
  "pos.cancel": { en: "Cancel", ar: "إلغاء" },
  "pos.subtotal": { en: "Subtotal", ar: "المجموع الفرعي" },
  "pos.discount": { en: "Discount", ar: "الخصم" },
  "pos.tax": { en: "Tax", ar: "الضريبة" },
  "pos.total": { en: "Total", ar: "الإجمالي" },
  "pos.change": { en: "Change", ar: "الباقي" },
  "pos.receipt": { en: "Receipt", ar: "الإيصال" },
  "pos.invoice": { en: "Invoice", ar: "الفاتورة" },
  "pos.print": { en: "Print", ar: "طباعة" },
  "pos.scanBarcode": { en: "Scan Barcode", ar: "مسح الباركود" },
  "pos.selectCustomer": { en: "Select Customer", ar: "اختيار عميل" },
  "pos.walkInCustomer": { en: "Walk-in Customer", ar: "عميل نقدي" },
  "pos.heldSales": { en: "Held Sales", ar: "المبيعات المعلقة" },
  "pos.newSale": { en: "New Sale", ar: "بيع جديد" },
  "pos.paymentMethod": { en: "Payment Method", ar: "طريقة الدفع" },
  "pos.confirmPayment": { en: "Confirm Payment", ar: "تأكيد الدفع" },
  "pos.cashReceived": { en: "Cash Received", ar: "المبلغ المقبوض" },

  "cashbox.title": { en: "Cashbox", ar: "الصندوق" },
  "cashbox.balance": { en: "Current Balance", ar: "الرصيد الحالي" },
  "cashbox.cashIn": { en: "Cash In", ar: "إيداع" },
  "cashbox.cashOut": { en: "Cash Out", ar: "سحب" },
  "cashbox.expense": { en: "Expense", ar: "مصروف" },
  "cashbox.transactions": { en: "Transactions", ar: "المعاملات" },
  "cashbox.todaySales": { en: "Today's Sales", ar: "مبيعات اليوم" },
  "cashbox.todayCashIn": { en: "Today's Cash In", ar: "إيداع اليوم" },
  "cashbox.todayCashOut": { en: "Today's Cash Out", ar: "سحب اليوم" },
  "cashbox.todayExpenses": { en: "Today's Expenses", ar: "مصروفات اليوم" },
  "cashbox.description": { en: "Description", ar: "الوصف" },
  "cashbox.amount": { en: "Amount", ar: "المبلغ" },
  "cashbox.notes": { en: "Notes", ar: "ملاحظات" },
  "cashbox.noTransactions": { en: "No transactions yet", ar: "لا توجد معاملات" },

  "installments.title": { en: "Installments", ar: "التقسيط" },
  "installments.newPlan": { en: "New Installment Plan", ar: "إنشاء خطة تقسيط" },
  "installments.active": { en: "Active", ar: "نشط" },
  "installments.completed": { en: "Completed", ar: "مكتمل" },
  "installments.overdue": { en: "Overdue", ar: "متأخر" },
  "installments.customer": { en: "Customer", ar: "العميل" },
  "installments.totalAmount": { en: "Total Amount", ar: "المبلغ الإجمالي" },
  "installments.downPayment": { en: "Down Payment", ar: "الدفعة الأولى" },
  "installments.installments": { en: "Installments", ar: "عدد الدفعات" },
  "installments.interval": { en: "Interval", ar: "نوع الدفعة" },
  "installments.startDate": { en: "Start Date", ar: "تاريخ البدء" },
  "installments.payment": { en: "Payment", ar: "الدفعة" },
  "installments.recordPayment": { en: "Record Payment", ar: "تسجيل دفعة" },
  "installments.paidAmount": { en: "Paid Amount", ar: "المبلغ المدفوع" },
  "installments.remaining": { en: "Remaining", ar: "المتبقي" },
  "installments.noPlans": { en: "No installment plans", ar: "لا توجد خطط تقسيط" },
  "installments.overdueAlert": { en: "Overdue Payments", ar: "دفعات متأخرة" },
  "installments.overdueDesc": { en: "Please follow up on collections", ar: "يرجى متابعة التحصيل" },

  "landing.hero.title": { en: "Enterprise Resource Planning — Simplified", ar: "تخطيط موارد المؤسسة — بشكل مبسط" },
  "landing.hero.subtitle": { en: "One integrated platform to manage your entire business: finance, inventory, sales, HR, manufacturing, projects, and more.", ar: "منصة متكاملة واحدة لإدارة أعمالك بالكامل: المالية، المخزون، المبيعات، الموارد البشرية، التصنيع، المشاريع، والمزيد." },
  "landing.hero.cta": { en: "Launch ERP System", ar: "افتح نظام ERP" },
  "landing.hero.learnMore": { en: "Learn More", ar: "اعرف المزيد" },
  "landing.hero.badge": { en: "All-in-One Business OS", ar: "نظام تشغيل أعمال متكامل" },

  "landing.features.title": { en: "Everything your business needs", ar: "كل ما تحتاجه أعمالك" },
  "landing.features.subtitle": { en: "From accounting to manufacturing — manage all operations in one place.", ar: "من المحاسبة إلى التصنيع — أدر جميع العمليات في مكان واحد." },
  "landing.features.accounting": { en: "Accounting & Finance", ar: "المحاسبة والمالية" },
  "landing.features.accounting.desc": { en: "Full double-entry accounting, chart of accounts, journal entries, general ledger, trial balance, and cost centers.", ar: "محاسبة كاملة بالقيد المزدوج، دليل حسابات، قيود يومية، أستاذ عام، ميزان مراجعة، ومراكز تكلفة." },
  "landing.features.inventory": { en: "Inventory Management", ar: "إدارة المخزون" },
  "landing.features.inventory.desc": { en: "Track products, manage warehouses, monitor stock levels, movements, and transfers across locations.", ar: "تتبع المنتجات، إدارة المستودعات، مراقبة مستويات المخزون، الحركات، والتحويلات بين المواقع." },
  "landing.features.sales": { en: "Sales & Invoicing", ar: "المبيعات والفواتير" },
  "landing.features.sales.desc": { en: "Manage customers, quotations, sales orders, invoices, credit notes, and customer payments.", ar: "إدارة العملاء، عروض الأسعار، أوامر البيع، الفواتير، إشعارات الدائن، ومدفوعات العملاء." },
  "landing.features.purchase": { en: "Purchase & Procurement", ar: "المشتريات والتوريد" },
  "landing.features.purchase.desc": { en: "Handle suppliers, purchase orders, goods receipt notes, and supplier payments.", ar: "إدارة الموردين، أوامر الشراء، إيصالات الاستلام، ومدفوعات الموردين." },
  "landing.features.crm": { en: "CRM & Sales Pipeline", ar: "إدارة العملاء ومسار المبيعات" },
  "landing.features.crm.desc": { en: "Track leads, manage opportunities, log activities, and close deals faster.", ar: "تتبع العملاء المحتملين، إدارة الفرص، تسجيل الأنشطة، وإغلاق الصفقات بشكل أسرع." },
  "landing.features.hrm": { en: "HR & Payroll", ar: "الموارد البشرية والرواتب" },
  "landing.features.hrm.desc": { en: "Manage employees, attendance, leaves, payroll, and performance reviews.", ar: "إدارة الموظفين، الحضور، الإجازات، الرواتب، وتقييم الأداء." },
  "landing.features.manufacturing": { en: "Manufacturing", ar: "التصنيع" },
  "landing.features.manufacturing.desc": { en: "Create bills of materials, manage work orders, and track production.", ar: "إنشاء فواتير المواد، إدارة أوامر العمل، وتتبع الإنتاج." },
  "landing.features.projects": { en: "Projects & Tasks", ar: "المشاريع والمهام" },
  "landing.features.projects.desc": { en: "Plan projects, assign tasks, track timesheets, and deliver on time.", ar: "تخطيط المشاريع، تعيين المهام، تتبع ساعات العمل، والتسليم في الوقت المحدد." },

  "landing.about.title": { en: "Why YASCO?", ar: "لماذا ياسكو؟" },
  "landing.about.subtitle": { en: "We built YASCO to make enterprise resource planning accessible, affordable, and delightful for growing businesses.", ar: "قمنا ببناء ياسكو لجعل تخطيط موارد المؤسسة متاحًا، وبأسعار معقولة، وممتعًا للشركات النامية." },
  "landing.about.point1": { en: "Open-source & self-hostable", ar: "مفتوح المصدر وقابل للاستضافة الذاتية" },
  "landing.about.point2": { en: "Bilingual (Arabic / English)", ar: "ثنائي اللغة (العربية / الإنجليزية)" },
  "landing.about.point3": { en: "Mobile-friendly responsive design", ar: "تصميم متجاوب مناسب للجوال" },
  "landing.about.point4": { en: "Real-time dashboards & reports", ar: "لوحات بيانات وتقارير فورية" },
  "landing.about.point5": { en: "Role-based access control", ar: "التحكم في الوصول حسب الصلاحيات" },
  "landing.about.point6": { en: "Audit-ready compliance", ar: "الامتثال الجاهز للتدقيق" },

  "landing.cta.title": { en: "Ready to transform your business?", ar: "مستعد لتحويل أعمالك؟" },
  "landing.cta.subtitle": { en: "Jump into the ERP system and start managing your entire operations in minutes.", ar: "ادخل إلى نظام ERP وابدأ في إدارة كل عملياتك في دقائق." },
  "landing.cta.button": { en: "Open ERP Now", ar: "افتح ERP الآن" },

  "landing.footer.copyright": { en: "© 2026 YASCO. All rights reserved.", ar: "© 2026 ياسكو. جميع الحقوق محفوظة." },
  "landing.footer.tagline": { en: "Enterprise Operating System", ar: "نظام تشغيل المؤسسات" },

  "landing.nav.home": { en: "Home", ar: "الرئيسية" },
  "landing.nav.features": { en: "Features", ar: "المميزات" },
  "landing.nav.about": { en: "About", ar: "عن ياسكو" },
  "landing.nav.login": { en: "Sign In", ar: "تسجيل الدخول" },
};

let currentLanguage: Language = "en";

export function setLanguage(lang: Language) {
  currentLanguage = lang;
  if (typeof document !== "undefined") {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }
}

export function getLanguage(): Language {
  return currentLanguage;
}

export function t(key: string, lang?: Language): string {
  const l = lang ?? currentLanguage;
  return translations[key]?.[l] ?? key;
}

export function getDirection(): "ltr" | "rtl" {
  return currentLanguage === "ar" ? "rtl" : "ltr";
}

export function isRTL(): boolean {
  return currentLanguage === "ar";
}
