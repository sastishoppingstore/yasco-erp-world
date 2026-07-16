import VerticalOperationsPage from "../VerticalOperationsPage";

export default function HealthcareBillingPage() {
  return (
    <VerticalOperationsPage
      title="Clinic Billing & Procedures"
      titleAr="فوترة العيادة والإجراءات"
      description="Bill consultations, procedures, pharmacy dispensing, insurance co-pay and ZATCA-ready invoices."
      descriptionAr="فوترة الكشف والإجراءات وصرف الصيدلية ونسبة تحمل التأمين وفواتير متوافقة مع الزكاة والضريبة."
      badge="Healthcare"
      primaryAction="Create Patient Bill"
      primaryActionAr="إنشاء فاتورة مريض"
      kpis={[
        { label: "Open bills", value: "23", tone: "blue" },
        { label: "Insurance review", value: "9", tone: "amber" },
        { label: "Cash collected", value: "18.4K SAR", tone: "emerald" },
        { label: "Rejected claims", value: "3", tone: "rose" },
      ]}
      workflows={["Consultation charge", "Procedure coding", "Insurance split", "Co-pay", "Invoice issue", "Receipt allocation"]}
      tasks={[
        { code: "BILL-1901", title: "Dermatology laser package", owner: "Cashier Noura", status: "Awaiting payment", due: "Today", amount: "1,250 SAR" },
        { code: "BILL-1907", title: "Dental procedure claim", owner: "Insurance Desk", status: "Eligibility review", due: "Today", amount: "820 SAR" },
        { code: "BILL-1914", title: "Pharmacy add-on bill", owner: "Pharmacy POS", status: "Paid", due: "Today", amount: "145 SAR" },
      ]}
      compliance={["VAT/ZATCA invoice fields", "Procedure code library", "Insurance payer contract", "Patient payment audit trail"]}
    />
  );
}
