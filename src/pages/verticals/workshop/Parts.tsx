import VerticalOperationsPage from "../VerticalOperationsPage";

export default function WorkshopPartsPage() {
  return (
    <VerticalOperationsPage
      title="Workshop Parts Requests"
      titleAr="طلبات قطع غيار الورشة"
      description="Control parts requisitions, VIN fitment, warranty, rack location and job-card cost posting."
      descriptionAr="إدارة طلبات القطع والتوافق مع المركبة والضمان وموقع الرف وربط التكلفة ببطاقة العمل."
      badge="Workshop"
      primaryAction="Request Parts"
      primaryActionAr="طلب قطع غيار"
      kpis={[
        { label: "Pending requests", value: "12", tone: "amber" },
        { label: "Parts issued", value: "38", tone: "emerald" },
        { label: "Shortage alerts", value: "5", tone: "rose" },
        { label: "Warranty returns", value: "3", tone: "blue" },
      ]}
      workflows={["Technician request", "Store approval", "Rack pick", "Issue to job card", "Return/warranty", "COGS posting"]}
      tasks={[
        { code: "PR-771", title: "Brake pads for Camry 2022", owner: "Parts Store", status: "Ready pick", due: "Today", amount: "420 SAR" },
        { code: "PR-778", title: "AC compressor warranty check", owner: "Warranty Desk", status: "Supplier review", due: "Tomorrow", amount: "1,150 SAR" },
        { code: "PR-782", title: "Oil service kit", owner: "Quick Service", status: "Issued", due: "Today", amount: "185 SAR" },
      ]}
      compliance={["VIN/plate fitment record", "Supplier warranty months", "Rack/bin location", "Job-card cost split"]}
    />
  );
}
