import VerticalOperationsPage from "../VerticalOperationsPage";

export default function HotelEventsPage() {
  return (
    <VerticalOperationsPage
      title="Hotel Events & Banquets"
      titleAr="فعاليات وقاعات الفندق"
      description="Manage banquet halls, event packages, deposits, resource booking, catering and final settlement."
      descriptionAr="إدارة القاعات وباقات الفعاليات والعربون وحجز الموارد والضيافة والتسوية النهائية."
      badge="Hospitality"
      primaryAction="New Event Booking"
      primaryActionAr="حجز فعالية جديد"
      kpis={[
        { label: "Events this month", value: "28", tone: "blue" },
        { label: "Deposits due", value: "18.5K SAR", tone: "amber" },
        { label: "Hall utilization", value: "71%", tone: "emerald" },
        { label: "Vendor payable", value: "9.2K SAR", tone: "slate" },
      ]}
      workflows={["Inquiry", "Package quote", "Deposit", "Resource booking", "Event checklist", "Final settlement"]}
      tasks={[
        { code: "EVT-1101", title: "Wedding hall package", owner: "Events Desk", status: "Deposit pending", due: "2026-07-10", amount: "35,000 SAR" },
        { code: "EVT-1112", title: "Corporate training banquet", owner: "F&B Manager", status: "Confirmed", due: "2026-07-14", amount: "8,500 SAR" },
        { code: "EVT-1120", title: "AV rental settlement", owner: "Accounting", status: "Vendor bill", due: "Today", amount: "1,900 SAR" },
      ]}
      compliance={["Deposit receipt", "Venue license document", "Vendor payable split", "Event checklist archive"]}
    />
  );
}
