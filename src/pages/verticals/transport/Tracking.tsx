import VerticalOperationsPage from "../VerticalOperationsPage";

export default function TransportTrackingPage() {
  return (
    <VerticalOperationsPage
      title="Live Tracking & Dispatch"
      titleAr="التتبع المباشر والتشغيل"
      description="Monitor shipment status, driver check-ins, route exceptions, POD and cold-chain alerts."
      descriptionAr="متابعة حالة الشحنات وتسجيل السائقين والاستثناءات وإثبات التسليم وتنبيهات سلسلة التبريد."
      badge="Logistics"
      primaryAction="Dispatch Trip"
      primaryActionAr="إرسال رحلة"
      kpis={[
        { label: "Active trips", value: "31", tone: "blue" },
        { label: "On time", value: "87%", tone: "emerald" },
        { label: "Route exceptions", value: "5", tone: "amber" },
        { label: "Temp alerts", value: "2", tone: "rose" },
      ]}
      workflows={["Dispatch", "Driver check-in", "Pickup proof", "In transit", "Delivery proof", "Settlement"]}
      tasks={[
        { code: "TRK-901", title: "Riyadh last-mile route", owner: "Driver Fahad", status: "In transit", due: "Today 16:00" },
        { code: "TRK-904", title: "Cold-chain pharmacy delivery", owner: "Driver Salem", status: "Temperature alert", due: "Now" },
        { code: "TRK-912", title: "Jeddah freight POD", owner: "Dispatch", status: "Awaiting signature", due: "Today" },
      ]}
      compliance={["Vehicle document expiry", "Driver ID record", "POD photo/signature", "Temperature log audit"]}
    />
  );
}
