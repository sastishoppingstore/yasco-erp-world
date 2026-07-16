import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/providers/language";
import { Link } from "react-router";
import {
  Building2, Plus, MapPin, Phone, Mail, Users, Package, Edit, Trash2,
  Warehouse, Store, CheckCircle2, XCircle, ArrowRightLeft, BarChart3,
  Shield, TrendingUp, CreditCard, Eye,
} from "lucide-react";

const branchesData: any[] = [];

export default function BranchManagementPage() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const [branches] = useState(branchesData);
  const [open, setOpen] = useState(false);
  const [newBranch, setNewBranch] = useState({
    code: "", nameEn: "", nameAr: "", address: "", phone: "", email: "", manager: "",
  });

  const activeBranches = branches.filter(b => b.isActive);
  const totalPos = branches.reduce((sum, b) => sum + b.posTerminals, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{isAr ? "إدارة الفروع" : "Branch Management"}</h2>
          <p className="text-slate-500">{isAr ? "إدارة فروعك ونقاط البيع" : "Manage your branches and POS terminals"}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="size-4 mr-2" />{isAr ? "إضافة فرع" : "Add Branch"}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{isAr ? "إضافة فرع جديد" : "Add New Branch"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isAr ? "الكود" : "Code"}</Label>
                  <Input value={newBranch.code} onChange={e => setNewBranch({...newBranch, code: e.target.value})} placeholder="RYD-02" />
                </div>
                <div className="space-y-2">
                  <Label>{isAr ? "الاسم (إنجليزي)" : "Name (English)"}</Label>
                  <Input value={newBranch.nameEn} onChange={e => setNewBranch({...newBranch, nameEn: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{isAr ? "الاسم (عربي)" : "Name (Arabic)"}</Label>
                <Input value={newBranch.nameAr} onChange={e => setNewBranch({...newBranch, nameAr: e.target.value})} dir="rtl" />
              </div>
              <div className="space-y-2">
                <Label>{isAr ? "العنوان" : "Address"}</Label>
                <Input value={newBranch.address} onChange={e => setNewBranch({...newBranch, address: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isAr ? "الهاتف" : "Phone"}</Label>
                  <Input value={newBranch.phone} onChange={e => setNewBranch({...newBranch, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={newBranch.email} onChange={e => setNewBranch({...newBranch, email: e.target.value})} type="email" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{isAr ? "المدير" : "Branch Manager"}</Label>
                <Input value={newBranch.manager} onChange={e => setNewBranch({...newBranch, manager: e.target.value})} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>{isAr ? "إلغاء" : "Cancel"}</Button>
                <Button onClick={() => setOpen(false)}>{isAr ? "حفظ" : "Save"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="overview"><Building2 className="size-3.5 mr-1" />{isAr ? "نظرة عامة" : "Overview"}</TabsTrigger>
          <TabsTrigger value="transfers"><ArrowRightLeft className="size-3.5 mr-1" />{isAr ? "التحويلات" : "Transfers"}</TabsTrigger>
          <TabsTrigger value="reports"><BarChart3 className="size-3.5 mr-1" />{isAr ? "التقارير" : "Reports"}</TabsTrigger>
          <TabsTrigger value="zatca"><Shield className="size-3.5 mr-1" />{isAr ? "ZATCA" : "ZATCA"}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg"><Building2 className="size-5 text-blue-600" /></div>
                  <div>
                    <p className="text-xs text-slate-500">{isAr ? "إجمالي الفروع" : "Total Branches"}</p>
                    <p className="text-2xl font-bold">{branches.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg"><CheckCircle2 className="size-5 text-green-600" /></div>
                  <div>
                    <p className="text-xs text-slate-500">{isAr ? "الفرع النشط" : "Active Branches"}</p>
                    <p className="text-2xl font-bold">{activeBranches.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg"><Store className="size-5 text-purple-600" /></div>
                  <div>
                    <p className="text-xs text-slate-500">{isAr ? "نقاط البيع" : "POS Terminals"}</p>
                    <p className="text-2xl font-bold">{totalPos}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-lg"><Warehouse className="size-5 text-orange-600" /></div>
                  <div>
                    <p className="text-xs text-slate-500">{isAr ? "المستودعات" : "Warehouses"}</p>
                    <p className="text-2xl font-bold">{branches.filter(b => b.warehouse).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Branches List */}
          <div className="grid gap-4">
            {branches.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-slate-500">{isAr ? "لا توجد فروع" : "No branches found"}</CardContent></Card>
            ) : branches.map((branch) => (
              <Card key={branch.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {branch.code}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{branch.nameEn}</h3>
                          <Badge variant={branch.isActive ? "default" : "secondary"}>
                            {branch.isActive ? (isAr ? "نشط" : "Active") : (isAr ? "غير نشط" : "Inactive")}
                          </Badge>
                        </div>
                        {branch.nameAr && <p className="text-sm text-slate-500" dir="rtl">{branch.nameAr}</p>}
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
                          <span className="flex items-center gap-1"><MapPin className="size-3.5" />{branch.address}</span>
                          <span className="flex items-center gap-1"><Phone className="size-3.5" />{branch.phone}</span>
                          <span className="flex items-center gap-1"><Mail className="size-3.5" />{branch.email}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <Badge variant="outline" className="text-xs"><Users className="size-3 mr-1" />{branch.manager}</Badge>
                          <Badge variant="outline" className="text-xs"><Store className="size-3 mr-1" />{branch.posTerminals} POS</Badge>
                          {branch.warehouse && <Badge variant="outline" className="text-xs"><Warehouse className="size-3 mr-1" />{branch.warehouse}</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon"><Eye className="size-4" /></Button>
                      <Button variant="ghost" size="icon"><Edit className="size-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600"><Trash2 className="size-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Stock Transfers Tab */}
        <TabsContent value="transfers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="size-4" />
                {isAr ? "تحويل المخزون بين الفروع" : "Inter-Branch Stock Transfer"}
              </CardTitle>
              <CardDescription>{isAr ? "نقل البضائع بين فروعك" : "Move goods between your branches"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isAr ? "من فرع" : "From Branch"}</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder={isAr ? "اختر الفرع" : "Select branch"} /></SelectTrigger>
                    <SelectContent>
                      {activeBranches.map(b => (
                        <SelectItem key={b.id} value={String(b.id)}>{b.nameEn}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{isAr ? "إلى فرع" : "To Branch"}</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder={isAr ? "اختر الفرع" : "Select branch"} /></SelectTrigger>
                    <SelectContent>
                      {activeBranches.map(b => (
                        <SelectItem key={b.id} value={String(b.id)}>{b.nameEn}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button asChild>
                <Link to="/app/inventory/transfers">
                  <ArrowRightLeft className="size-4 mr-2" />
                  {isAr ? "إجراة تحويل" : "Initiate Transfer"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="size-4" />
                {isAr ? "تقارير الفروع" : "Branch Reports"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: isAr ? "مبيعات حسب الفرع" : "Sales by Branch", path: "/app/reports", icon: TrendingUp },
                { label: isAr ? "أرباح وخسائر الفروع" : "Branch Profit & Loss", path: "/app/accounting/reports", icon: BarChart3 },
                { label: isAr ? "المخزون حسب الفرع" : "Stock by Branch", path: "/app/inventory/stock", icon: Package },
                { label: isAr ? "رواتب حسب الفرع" : "Payroll by Branch", path: "/app/hrm/payroll", icon: CreditCard },
              ].map((report) => (
                <Link key={report.path} to={report.path} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <report.icon className="size-4 text-blue-600" />
                    <span className="text-sm font-medium">{report.label}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{isAr ? "عرض" : "View"}</Badge>
                </Link>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ZATCA Tab */}
        <TabsContent value="zatca" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="size-4" />
                {isAr ? "حالة ZATCA حسب الفرع" : "ZATCA Status per Branch"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {branches.filter(b => b.isActive).length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">{isAr ? "لا توجد فروع نشطة" : "No active branches"}</p>
              ) : branches.filter(b => b.isActive).map((branch) => (
                <div key={branch.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">{branch.code}</div>
                    <div>
                      <p className="text-sm font-medium">{branch.nameEn}</p>
                      <p className="text-xs text-slate-500">{isAr ? "CSID:" : "CSID:"} 31012345678900{branch.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">
                      <CheckCircle2 className="size-3 mr-1" />
                      {isAr ? "نشط" : "Active"}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
