import VerticalOperationsPage from "../VerticalOperationsPage";

export default function HealthcareNursingPage() {
  return (
    <VerticalOperationsPage
      title="Nursing & Care Plans"
      titleAr="التمريض وخطط الرعاية"
      description="Track nursing queues, vital signs, consent forms, home-care visits and follow-up reminders."
      descriptionAr="متابعة طوابير التمريض والمؤشرات الحيوية ونماذج الموافقة وزيارات الرعاية المنزلية والتذكيرات."
      badge="Healthcare"
      primaryAction="New Care Task"
      primaryActionAr="مهمة رعاية جديدة"
      kpis={[
        { label: "Nursing queue", value: "14", tone: "blue" },
        { label: "Home visits", value: "6", tone: "emerald" },
        { label: "Consent pending", value: "4", tone: "amber" },
        { label: "Follow-ups due", value: "19", tone: "slate" },
      ]}
      workflows={["Patient queue", "Vitals capture", "Care task", "Medication note", "Doctor escalation", "Follow-up"]}
      tasks={[
        { code: "NUR-501", title: "Vitals and pre-consultation", owner: "Nurse Maha", status: "In progress", due: "Today 11:20" },
        { code: "HOME-88", title: "Home physiotherapy visit", owner: "Nurse Abdullah", status: "Scheduled", due: "Tomorrow 09:00", amount: "300 SAR" },
        { code: "NUR-506", title: "Consent form for minor procedure", owner: "Front Desk", status: "Pending signature", due: "Today" },
      ]}
      compliance={["Consent form storage", "Patient privacy controls", "Clinical note audit", "Home-care visit proof"]}
    />
  );
}
