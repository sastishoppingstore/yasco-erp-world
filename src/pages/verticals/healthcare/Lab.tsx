import VerticalOperationsPage from "../VerticalOperationsPage";

export default function HealthcareLabPage() {
  return (
    <VerticalOperationsPage
      title="Lab & Radiology Orders"
      titleAr="طلبات المختبر والأشعة"
      description="Manage samples, radiology requests, result approvals, attachments and patient billing links."
      descriptionAr="إدارة العينات وطلبات الأشعة واعتماد النتائج والمرفقات وربطها بفواتير المرضى."
      badge="Healthcare"
      primaryAction="New Lab Order"
      primaryActionAr="طلب مختبر جديد"
      kpis={[
        { label: "Pending samples", value: "18", tone: "amber" },
        { label: "Ready results", value: "11", tone: "emerald" },
        { label: "Insurance-linked", value: "7", tone: "blue" },
        { label: "Critical alerts", value: "2", tone: "rose" },
      ]}
      workflows={["Order", "Sample collection", "Lab processing", "Doctor review", "Result release", "Billing"]}
      tasks={[
        { code: "LAB-2201", title: "CBC and Vitamin D panel", owner: "Lab Tech Abeer", status: "Processing", due: "Today 14:30", amount: "240 SAR" },
        { code: "RAD-814", title: "Orthopedic X-ray request", owner: "Radiology", status: "Ready review", due: "Today 12:45", amount: "320 SAR" },
        { code: "LAB-2205", title: "Diabetes follow-up panel", owner: "Lab Tech Omar", status: "Sample pending", due: "Tomorrow", amount: "180 SAR" },
      ]}
      compliance={["Patient privacy permissions", "Result attachment audit trail", "Doctor-only release approval", "NPHIES-ready claim reference"]}
    />
  );
}
