import VerticalOperationsPage from "../VerticalOperationsPage";

export default function ServiceContractsPage() {
  return (
    <VerticalOperationsPage
      title="Service Contracts & Retainers"
      titleAr="عقود الخدمات والاشتراكات"
      description="Manage service agreements, retainers, recurring invoices, SLA tasks, approvals and renewals."
      descriptionAr="إدارة اتفاقيات الخدمة والاشتراكات والفواتير المتكررة ومهام SLA والاعتمادات والتجديد."
      badge="Services"
      primaryAction="New Contract"
      primaryActionAr="عقد جديد"
      kpis={[
        { label: "Active contracts", value: "94", tone: "blue" },
        { label: "Renewals due", value: "11", tone: "amber" },
        { label: "Recurring MRR", value: "268K SAR", tone: "emerald" },
        { label: "SLA breaches", value: "3", tone: "rose" },
      ]}
      workflows={["Lead", "Proposal", "Contract", "Recurring invoice", "Service ticket", "Renewal"]}
      tasks={[
        { code: "CTR-501", title: "Cybersecurity retainer", owner: "Account Manager", status: "Renewal", due: "2026-07-25", amount: "18,000 SAR" },
        { code: "CTR-514", title: "Cleaning AMC monthly invoice", owner: "Billing", status: "Invoice ready", due: "Today", amount: "6,500 SAR" },
        { code: "CTR-522", title: "Legal consulting matter", owner: "Partner", status: "Milestone approval", due: "Tomorrow", amount: "12,000 SAR" },
      ]}
      compliance={["Signed contract vault", "Recurring billing approval", "SLA audit", "Client document permissions"]}
    />
  );
}
