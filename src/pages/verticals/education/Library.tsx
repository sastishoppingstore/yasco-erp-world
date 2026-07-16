import VerticalOperationsPage from "../VerticalOperationsPage";

export default function EducationLibraryPage() {
  return (
    <VerticalOperationsPage
      title="Library & Learning Resources"
      titleAr="المكتبة ومصادر التعلم"
      description="Track books, digital resources, student borrowing, overdue notices and replacement fees."
      descriptionAr="متابعة الكتب والمصادر الرقمية والاستعارة والتنبيهات والغرامات."
      badge="Education"
      primaryAction="Add Resource"
      primaryActionAr="إضافة مورد"
      kpis={[
        { label: "Books in stock", value: "4,820", tone: "blue" },
        { label: "Borrowed", value: "326", tone: "emerald" },
        { label: "Overdue", value: "23", tone: "rose" },
        { label: "Digital licenses", value: "14", tone: "slate" },
      ]}
      workflows={["Catalog", "Issue", "Renew", "Return", "Fine/replacement", "Guardian notice"]}
      tasks={[
        { code: "LIB-451", title: "Arabic reader set", owner: "Librarian", status: "Issued", due: "2026-07-20" },
        { code: "LIB-462", title: "Science lab workbook", owner: "Grade 5", status: "Overdue", due: "2026-07-06", amount: "25 SAR" },
        { code: "LIB-470", title: "Digital math subscription", owner: "IT Admin", status: "Renewal", due: "2026-08-01", amount: "1,200 SAR" },
      ]}
      compliance={["Student borrowing history", "Guardian fee notice", "Inventory valuation", "Digital license expiry"]}
    />
  );
}
