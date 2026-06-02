import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Link } from "react-router";
import { Users, Receipt, ShoppingCart, CreditCard } from "lucide-react";

export default function SalesPage() {
  const modules = [
    { title: "Customers", desc: "Customer management & credit", icon: Users, path: "/app/sales/customers", color: "bg-blue-600" },
    { title: "Quotations", desc: "Create and send quotations", icon: Receipt, path: "/app/sales/quotations", color: "bg-emerald-600" },
    { title: "Invoices", desc: "Sales invoicing with ZATCA", icon: ShoppingCart, path: "/app/sales/invoices", color: "bg-purple-600" },
    { title: "Payments", desc: "Customer payment tracking", icon: CreditCard, path: "/app/sales/payments", color: "bg-orange-600" },
  ];

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Sales Management</h2><p className="text-slate-500">Quotation to cash with ZATCA e-invoicing</p></div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {modules.map((mod) => (
          <Link key={mod.path} to={mod.path} className="block">
            <Card className="hover:shadow-lg transition-all cursor-pointer group h-full">
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-xl ${mod.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <mod.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg mb-1">{mod.title}</CardTitle>
                <p className="text-sm text-slate-500">{mod.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
