import VerticalOperationsPage from "../VerticalOperationsPage";

export default function TransportFuelPage() {
  return (
    <VerticalOperationsPage
      title="Fuel & Trip Expenses"
      titleAr="الوقود ومصاريف الرحلات"
      description="Control fuel cards, trip expenses, driver advances, mileage and vehicle profitability."
      descriptionAr="إدارة بطاقات الوقود ومصاريف الرحلات وعهد السائقين والكيلومترات وربحية المركبة."
      badge="Fleet"
      primaryAction="Add Fuel Log"
      primaryActionAr="إضافة سجل وقود"
      kpis={[
        { label: "Fuel this month", value: "42.7K SAR", tone: "amber" },
        { label: "Avg km/liter", value: "6.8", tone: "blue" },
        { label: "Driver advances", value: "8.5K SAR", tone: "slate" },
        { label: "Variance alerts", value: "4", tone: "rose" },
      ]}
      workflows={["Fuel request", "Card/cash issue", "Odometer log", "Receipt upload", "Trip allocation", "Accounting post"]}
      tasks={[
        { code: "FUEL-1401", title: "Truck RYD-482 fuel receipt", owner: "Driver Nasser", status: "Receipt pending", due: "Today", amount: "390 SAR" },
        { code: "FUEL-1408", title: "Bus route expense settlement", owner: "Fleet Admin", status: "Review", due: "Tomorrow", amount: "1,120 SAR" },
        { code: "FUEL-1412", title: "Low mileage variance", owner: "Operations", status: "Investigate", due: "Today" },
      ]}
      compliance={["Receipt attachment", "Odometer evidence", "Driver settlement approval", "Vehicle cost center posting"]}
    />
  );
}
