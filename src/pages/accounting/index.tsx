import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import { Landmark, Receipt, BookOpen, BarChart3, Settings } from "lucide-react";

export default function AccountingPage() {
  const { data: coaCount } = trpc.accounting.coaList.useQuery(undefined);
  const { data: jeCount } = trpc.accounting.journalEntryList.useQuery(undefined);
  const { data: ccCount } = trpc.accounting.costCenterList.useQuery(undefined);

  const modules = [
    { title: "Chart of Accounts", desc: `${coaCount?.length || 0} accounts configured`, icon: Landmark, path: "/app/accounting/coa", color: "bg-blue-600" },
    { title: "Journal Entries", desc: "Record & manage transactions", icon: Receipt, path: "/app/accounting/journal-entries", color: "bg-emerald-600" },
    { title: "General Ledger", desc: "View account balances & history", icon: BookOpen, path: "/app/accounting/ledger", color: "bg-purple-600" },
    { title: "Financial Reports", desc: "P&L, Balance Sheet, Cash Flow", icon: BarChart3, path: "/app/accounting/reports", color: "bg-orange-600" },
    { title: "Trial Balance", desc: "Verify debit-credit equality", icon: BarChart3, path: "/app/accounting/trial-balance", color: "bg-cyan-600" },
    { title: "Cost Centers", desc: `${ccCount?.length || 0} centers configured`, icon: Landmark, path: "/app/accounting/cost-centers", color: "bg-indigo-600" },
    { title: "Accounting Settings", desc: "Fiscal year, tax, currency & more", icon: Settings, path: "/app/accounting/settings", color: "bg-slate-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Accounting & Finance</h2>
        <p className="text-slate-500">Manage your financial operations and compliance</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((mod) => (
          <Link key={mod.path} to={mod.path} className="block">
            <Card className="hover:shadow-lg transition-all cursor-pointer group h-full">
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-xl ${mod.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <mod.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-1">{mod.title}</h3>
                <p className="text-sm text-slate-500">{mod.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
