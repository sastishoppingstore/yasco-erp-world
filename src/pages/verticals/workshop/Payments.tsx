import VerticalOperationsPage from "../VerticalOperationsPage";

export default function WorkshopPaymentsPage() {
  return (
    <VerticalOperationsPage
      title="Workshop Payments & Delivery"
      titleAr="مدفوعات وتسليم الورشة"
      description="Collect deposits, customer approvals, final invoices, warranty notes and vehicle delivery signatures."
      descriptionAr="تحصيل العربون واعتماد العميل والفواتير النهائية وملاحظات الضمان وتوقيع تسليم المركبة."
      badge="Workshop"
      primaryAction="Collect Payment"
      primaryActionAr="تحصيل دفعة"
      kpis={[
        { label: "Ready for invoice", value: "9", tone: "blue" },
        { label: "Deposits held", value: "12.8K SAR", tone: "emerald" },
        { label: "Pending approvals", value: "6", tone: "amber" },
        { label: "Delivery today", value: "7", tone: "slate" },
      ]}
      workflows={["Estimate approval", "Deposit", "Final invoice", "Payment receipt", "Warranty note", "Vehicle handover"]}
      tasks={[
        { code: "PAY-3301", title: "Final invoice for JOB-1045", owner: "Cashier", status: "Awaiting Mada", due: "Today", amount: "2,460 SAR" },
        { code: "PAY-3307", title: "Insurance claim excess payment", owner: "Service Advisor", status: "Customer approval", due: "Today", amount: "500 SAR" },
        { code: "PAY-3312", title: "Delivery signature", owner: "QC Desk", status: "Ready handover", due: "Today" },
      ]}
      compliance={["ZATCA invoice immutability", "Customer signature", "Warranty terms", "Payment allocation audit"]}
    />
  );
}
