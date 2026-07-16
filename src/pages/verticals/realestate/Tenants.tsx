import VerticalOperationsPage from "../VerticalOperationsPage";

export default function RealEstateTenantsPage() {
  return (
    <VerticalOperationsPage
      title="Tenants & Occupancy"
      titleAr="المستأجرون والإشغال"
      description="Manage tenant profiles, Ejar references, deposits, renewals, rent aging and maintenance history."
      descriptionAr="إدارة بيانات المستأجرين ومراجع إيجار والتأمينات والتجديدات وأعمار الإيجارات والصيانة."
      badge="Real Estate"
      primaryAction="Add Tenant"
      primaryActionAr="إضافة مستأجر"
      kpis={[
        { label: "Active tenants", value: "186", tone: "blue" },
        { label: "Occupancy", value: "92%", tone: "emerald" },
        { label: "Renewals due", value: "17", tone: "amber" },
        { label: "Rent overdue", value: "31.2K SAR", tone: "rose" },
      ]}
      workflows={["Tenant profile", "Lease/Ejar ref", "Deposit", "Rent schedule", "Renewal", "Move-out inspection"]}
      tasks={[
        { code: "TEN-3001", title: "Unit A-120 renewal", owner: "Leasing Office", status: "Negotiation", due: "2026-07-18", amount: "42,000 SAR" },
        { code: "TEN-3018", title: "Deposit refund review", owner: "Property Manager", status: "Inspection", due: "Today", amount: "3,500 SAR" },
        { code: "TEN-3030", title: "Commercial tenant overdue", owner: "Collections", status: "Follow-up", due: "Today", amount: "8,900 SAR" },
      ]}
      compliance={["Ejar reference", "ID document controls", "Deposit audit trail", "Owner statement link"]}
    />
  );
}
