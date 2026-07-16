import VerticalOperationsPage from "../VerticalOperationsPage";

export default function ConstructionQualityPage() {
  return (
    <VerticalOperationsPage
      title="Construction Quality & Handover"
      titleAr="جودة المقاولات والتسليم"
      description="Manage inspection requests, snag lists, test reports, consultant approvals and handover checklists."
      descriptionAr="إدارة طلبات الفحص وقوائم الملاحظات وتقارير الاختبار واعتمادات الاستشاري وقوائم التسليم."
      badge="Construction"
      primaryAction="Create Inspection"
      primaryActionAr="إنشاء فحص"
      kpis={[
        { label: "Open inspections", value: "34", tone: "blue" },
        { label: "Snags open", value: "112", tone: "amber" },
        { label: "Approved ITP", value: "76%", tone: "emerald" },
        { label: "Rejected items", value: "9", tone: "rose" },
      ]}
      workflows={["Inspection request", "Consultant review", "Snag", "Corrective action", "Approval", "Handover"]}
      tasks={[
        { code: "QA-2001", title: "Villa slab concrete cube test", owner: "Site Engineer", status: "Lab pending", due: "Today" },
        { code: "QA-2010", title: "MEP pressure test", owner: "MEP Supervisor", status: "Consultant review", due: "Tomorrow" },
        { code: "QA-2022", title: "Final handover checklist", owner: "Project Manager", status: "Snag closeout", due: "2026-07-20" },
      ]}
      compliance={["ITP checklist", "Consultant approval trail", "Photo evidence", "Handover document archive"]}
    />
  );
}
