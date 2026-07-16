import { useMemo } from "react";
import { getStoredCategory } from "@/config/businessCatalog";
import type { BusinessCategory } from "@/config/businessCatalog";

export interface DashboardWidget {
  id: string;
  label: string;
  labelAr: string;
  icon: string;
  type: "metric" | "chart" | "list" | "gauge" | "map";
  size?: "small" | "medium" | "large";
}

export function useDashboardWidgets(category?: BusinessCategory): DashboardWidget[] {
  return useMemo(() => {
    const cat = category || getStoredCategory();
    
    // Base widgets for all categories
    const baseWidgets: DashboardWidget[] = [
      { id: "summary_cards", label: "Summary", labelAr: "ملخص", icon: "LayoutGrid", type: "metric" },
      { id: "sales_chart", label: "Sales Trend", labelAr: "اتجاه المبيعات", icon: "TrendingUp", type: "chart" },
      { id: "recent_invoices", label: "Recent Invoices", labelAr: "الفواتير الأخيرة", icon: "Receipt", type: "list" }
    ];

    // Category-specific widgets
    switch (cat) {
      case "workshop":
        return [
          ...baseWidgets,
          { id: "bay_utilization_gauge", label: "Bay Utilization", labelAr: "استخدام البايات", icon: "ParkingCircle", type: "gauge", size: "medium" },
          { id: "pending_job_cards_list", label: "Pending Job Cards", labelAr: "بطاقات العمل المعلقة", icon: "ClipboardList", type: "list" },
          { id: "technician_productivity_chart", label: "Technician Productivity", labelAr: "إنتاجية الفنيين", icon: "Users", type: "chart" },
          { id: "pending_customer_approvals", label: "Customer Approvals", labelAr: "موافقات العملاء", icon: "UserCheck", type: "list" }
        ];

      case "medical_clinic":
        return [
          ...baseWidgets,
          { id: "doctor_schedule", label: "Doctor Schedule", labelAr: "جدول الأطباء", icon: "Calendar", type: "chart" },
          { id: "appointment_queue", label: "Appointment Queue", labelAr: "طابور المواعيد", icon: "Clock", type: "list" },
          { id: "insurance_aging", label: "Insurance Aging", labelAr: "شيخولة التأمين", icon: "Shield", type: "metric" },
          { id: "lab_orders_pending", label: "Pending Lab Orders", labelAr: "طلبات المختبر المعلقة", icon: "Flask", type: "list" }
        ];

      case "restaurant":
      case "cafe":
        return [
          ...baseWidgets,
          { id: "table_status_map", label: "Table Status", labelAr: "حالة الطاولات", icon: "Grid", type: "map" },
          { id: "kitchen_order_queue", label: "Kitchen Orders", labelAr: "طلبات المطبخ", icon: "ChefHat", type: "list" },
          { id: "delivery_status", label: "Delivery Status", labelAr: "حالة التوصيل", icon: "Truck", type: "metric" },
          { id: "food_cost_alert", label: "Food Cost Alert", labelAr: "تنبيه تكلفة الطعام", icon: "Utensils", type: "gauge" }
        ];

      case "retail":
      case "supermarket":
      case "wholesale":
        return [
          ...baseWidgets,
          { id: "inventory_turnover", label: "Inventory Turnover", labelAr: "دوران المخزون", icon: "RefreshCw", type: "metric" },
          { id: "top_selling_products", label: "Top Selling Products", labelAr: "الأكثر مبيعاً", icon: "TrendingUp", type: "list" },
          { id: "sales_by_category", label: "Sales by Category", labelAr: "المبيعات حسب الفئة", icon: "PieChart", type: "chart" },
          { id: "low_stock_alerts", label: "Low Stock Alerts", labelAr: "تنبيهات المخزون المنخفض", icon: "PackageMinus", type: "list" }
        ];

      case "construction":
        return [
          ...baseWidgets,
          { id: "project_margin", label: "Project Margin", labelAr: "هوامش المشاريع", icon: "TrendingUp", type: "metric" },
          { id: "tasks_overdue", label: "Overdue Tasks", labelAr: "المهام المتأخرة", icon: "AlertTriangle", type: "list" },
          { id: "equipment_utilization", label: "Equipment Utilization", labelAr: "استخدام المعدات", icon: "Cylinder", type: "gauge" },
          { id: "subcontractor_performance", label: "Subcontractor Performance", labelAr: "أداء المقاولين من الباطن", icon: "Users", type: "chart" }
        ];

      case "pharmacy":
        return [
          ...baseWidgets,
          { id: "near_expiry_alerts", label: "Near Expiry Alerts", labelAr: "تنبيهات انتهاء الصلاحية القريبة", icon: "Clock", type: "list" },
          { id: "controlled_substances", label: "Controlled Substances", labelAr: "الخاضعة للرقابة", icon: "Shield", type: "metric" },
          { id: "insurance_claims_status", label: "Insurance Claims", labelAr: "مطالبات التأمين", icon: "FileText", type: "list" },
          { id: "top_selling_medicines", label: "Top Selling Medicines", labelAr: "الأكثر مبيعاً من الأدوية", icon: "Pill", type: "list" }
        ];

      case "accounting_firm":
        return [
          ...baseWidgets,
          { id: "billable_hours", label: "Billable Hours", labelAr: "الساعات القابلة للفوترة", icon: "Clock", type: "metric" },
          { id: "upcoming_deadlines", label: "Upcoming Deadlines", labelAr: "المواعيد القادمة", icon: "Calendar", type: "list" },
          { id: "client_satisfaction", label: "Client Satisfaction", labelAr: "رضا العملاء", icon: "Smile", type: "gauge" },
          { id: "tax_filing_status", label: "Tax Filing Status", labelAr: "حالة تقديم الضرائب", icon: "FileText", type: "list" }
        ];

      default:
        return baseWidgets;
    }
  }, [category]);
}