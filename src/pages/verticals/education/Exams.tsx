import VerticalOperationsPage from "../VerticalOperationsPage";

export default function EducationExamsPage() {
  return (
    <VerticalOperationsPage
      title="Exams & Assessment"
      titleAr="الاختبارات والتقييم"
      description="Plan exams, grade assessments, issue report approvals and notify guardians."
      descriptionAr="تخطيط الاختبارات ورصد الدرجات واعتماد النتائج وإشعار أولياء الأمور."
      badge="Education"
      primaryAction="Create Exam"
      primaryActionAr="إنشاء اختبار"
      kpis={[
        { label: "Upcoming exams", value: "16", tone: "blue" },
        { label: "Grades pending", value: "128", tone: "amber" },
        { label: "Approved reports", value: "74", tone: "emerald" },
        { label: "Guardian alerts", value: "42", tone: "slate" },
      ]}
      workflows={["Exam schedule", "Question paper", "Attendance", "Grade entry", "Approval", "Guardian notice"]}
      tasks={[
        { code: "EX-701", title: "Grade 7 mathematics midterm", owner: "Teacher Hanan", status: "Grade entry", due: "2026-07-12" },
        { code: "EX-704", title: "English placement test", owner: "Academic Office", status: "Scheduled", due: "2026-07-14" },
        { code: "EX-711", title: "Final report approval", owner: "Principal", status: "Review", due: "2026-07-15" },
      ]}
      compliance={["Student privacy", "Report approval audit", "Guardian notification log", "Certificate issue control"]}
    />
  );
}
