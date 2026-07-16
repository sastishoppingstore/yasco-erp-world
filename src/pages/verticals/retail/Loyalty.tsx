import VerticalOperationsPage from "../VerticalOperationsPage";

export default function RetailLoyaltyPage() {
  return (
    <VerticalOperationsPage
      title="Retail Loyalty & Promotions"
      titleAr="ولاء العملاء والعروض"
      description="Create loyalty points, gift cards, discount campaigns, customer wallet and branch promotions."
      descriptionAr="إنشاء نقاط الولاء وبطاقات الهدايا وحملات الخصم ومحفظة العميل وعروض الفروع."
      badge="Retail"
      primaryAction="New Campaign"
      primaryActionAr="حملة جديدة"
      kpis={[
        { label: "Active members", value: "8,420", tone: "blue" },
        { label: "Points issued", value: "142K", tone: "emerald" },
        { label: "Gift cards", value: "19.6K SAR", tone: "amber" },
        { label: "Campaign ROI", value: "3.4x", tone: "slate" },
      ]}
      workflows={["Customer segment", "Offer setup", "POS rule", "Approval", "Redemption", "ROI report"]}
      tasks={[
        { code: "LOY-601", title: "Back-to-school campaign", owner: "Marketing", status: "Active", due: "2026-07-31", amount: "12% discount" },
        { code: "LOY-608", title: "VIP perfume customer wallet", owner: "Branch Manager", status: "Review", due: "Today", amount: "4,500 SAR" },
        { code: "LOY-615", title: "Gift card liability report", owner: "Accounting", status: "Month close", due: "2026-07-30" },
      ]}
      compliance={["Discount approval", "Gift card liability", "Customer opt-out", "POS redemption audit"]}
    />
  );
}
