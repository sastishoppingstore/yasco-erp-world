import VerticalOperationsPage from "../VerticalOperationsPage";

export default function ManufacturingQualityPage() {
  return (
    <VerticalOperationsPage
      title="Manufacturing Quality Control"
      titleAr="مراقبة جودة التصنيع"
      description="Track QC samples, batch release, non-conformance, scrap and recall traceability."
      descriptionAr="متابعة عينات الجودة واعتماد الدفعات وعدم المطابقة والهالك وتتبع الاستدعاء."
      badge="Manufacturing"
      primaryAction="New QC Check"
      primaryActionAr="فحص جودة جديد"
      kpis={[
        { label: "QC pending", value: "21", tone: "amber" },
        { label: "Released batches", value: "48", tone: "emerald" },
        { label: "Rejected units", value: "316", tone: "rose" },
        { label: "Scrap value", value: "7.9K SAR", tone: "slate" },
      ]}
      workflows={["Sample", "Inspection", "Lab result", "Release/hold", "Scrap/rework", "Traceability"]}
      tasks={[
        { code: "QC-8801", title: "Dates packaging batch D-442", owner: "QC Inspector", status: "Sample review", due: "Today" },
        { code: "QC-8807", title: "Plastic bottle line variance", owner: "Production", status: "Rework", due: "Tomorrow", amount: "2,400 SAR" },
        { code: "QC-8812", title: "Food label compliance check", owner: "Quality Manager", status: "Approval", due: "Today" },
      ]}
      compliance={["Batch/lot traceability", "QC attachment storage", "Expiry and recall records", "Scrap accounting approval"]}
    />
  );
}
