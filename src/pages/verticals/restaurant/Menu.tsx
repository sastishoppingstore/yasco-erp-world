import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/providers/language";
import ActionButton3D from "@/components/ui/ActionButton3D";
import { BookOpen, PlusCircle, Search, Trash2, Edit, AlertCircle } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  cost: number;
  category: string;
  isAvailable: boolean;
}

const initialMenu: MenuItem[] = [
  { id: "M1", name: "Kabsa Chicken", nameAr: "كبسة دجاج", price: 35, cost: 12, category: "Mains", isAvailable: true },
  { id: "M2", name: "Mandi Meat", nameAr: "مندي لحم", price: 65, cost: 24, category: "Mains", isAvailable: true },
  { id: "M3", name: "Shawarma Plate", nameAr: "صحن شاورما", price: 25, cost: 8, category: "Mains", isAvailable: true },
  { id: "S1", name: "Hummus", nameAr: "حمص", price: 12, cost: 3, category: "Sides", isAvailable: true },
  { id: "D1", name: "Mint Lemonade", nameAr: "ليمون بالنعناع", price: 15, cost: 2, category: "Drinks", isAvailable: true }
];

export default function RestaurantMenuPage() {
  const { language, dir } = useLanguage();
  const isAr = language === "ar";
  const [menu, setMenu] = useState<MenuItem[]>(initialMenu);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [newOpen, setNewOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [price, setPrice] = useState(15);
  const [cost, setCost] = useState(5);
  const [category, setCategory] = useState("Mains");

  const filteredMenu = menu.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.nameAr.includes(search);
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !nameAr) return;

    const newItem: MenuItem = {
      id: `M${menu.length + 1}`,
      name,
      nameAr,
      price,
      cost,
      category,
      isAvailable: true
    };

    setMenu([...menu, newItem]);
    setNewOpen(false);
    setName("");
    setNameAr("");
    setPrice(15);
    setCost(5);
  };

  const deleteItem = (id: string) => {
    setMenu(prev => prev.filter(item => item.id !== id));
  };

  const toggleAvailability = (id: string) => {
    setMenu(prev => prev.map(item => item.id === id ? { ...item, isAvailable: !item.isAvailable } : item));
  };

  return (
    <div className="space-y-6" dir={dir}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="size-6 text-red-600" />
            {isAr ? "إدارة قائمة الطعام والأسعار" : "Menu & Pricing Management"}
          </h2>
          <p className="text-slate-500">
            {isAr ? "إعداد الأصناف وتكلفة الأطعمة وهامش الربح للمطعم" : "Manage food catalog items, recipe costs, and restaurant profit margins"}
          </p>
        </div>
        <ActionButton3D
          icon={<PlusCircle className="size-4" />}
          label={isAr ? "صنف جديد" : "New Menu Item"}
          color="red"
          onClick={() => setNewOpen(true)}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Menu list */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3 flex-wrap">
              <div>
                <CardTitle className="text-base">{isAr ? "أصناف المنيو" : "Menu Catalog"}</CardTitle>
                <CardDescription>{isAr ? "عروض الأطعمة والمشروبات النشطة" : "Active food and beverage choices"}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-40">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input
                    placeholder={isAr ? "بحث..." : "Search..."}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="h-8 pl-8 text-xs"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-8 text-xs w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isAr ? "الكل" : "All Categories"}</SelectItem>
                    <SelectItem value="Mains">{isAr ? "الأطباق الرئيسية" : "Mains"}</SelectItem>
                    <SelectItem value="Sides">{isAr ? "الأطباق الجانبية" : "Sides"}</SelectItem>
                    <SelectItem value="Drinks">{isAr ? "المشروبات" : "Drinks"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {filteredMenu.map(item => {
                  const profit = item.price - item.cost;
                  const profitMargin = ((profit / item.price) * 100).toFixed(0);
                  return (
                    <div key={item.id} className="py-3.5 flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm">{isAr ? item.nameAr : item.name}</span>
                          <Badge variant="outline" className="text-[9px]">{item.category}</Badge>
                          {!item.isAvailable && (
                            <Badge className="bg-rose-100 text-rose-700 text-[9px]">{isAr ? "غير متوفر" : "Out of Stock"}</Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">ID: {item.id} · English: {item.name}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {isAr ? "التكلفة" : "Cost"}: {item.cost} SAR · {isAr ? "الهامش" : "Margin"}: <span className="text-emerald-600 font-bold">{profitMargin}%</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right mr-3">
                          <p className="text-sm font-bold">{item.price} SAR</p>
                          <span className="text-[10px] text-slate-400">{isAr ? "شامل الضريبة 15%" : "Incl. 15% VAT"}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAvailability(item.id)}
                          className={`h-8 text-xs ${item.isAvailable ? "text-slate-600" : "text-emerald-600 bg-emerald-50"}`}
                        >
                          {item.isAvailable ? (isAr ? "إيقاف" : "Disable") : (isAr ? "تفعيل" : "Enable")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteItem(item.id)}
                          className="h-8 w-8 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {filteredMenu.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <BookOpen className="size-12 mx-auto mb-2 text-slate-300" />
                    <p>{isAr ? "لا توجد أصناف تطابق معايير البحث" : "No items match your criteria"}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form panel */}
        <div>
          {newOpen ? (
            <Card className="border-red-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-base text-red-800">{isAr ? "إضافة صنف جديد" : "Add Menu Item"}</CardTitle>
                <CardDescription>{isAr ? "سجل بيانات الصنف ليكون متاحاً في كاشير المبيعات" : "Register and configure item in POS cashier catalog"}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateItem} className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-xs">{isAr ? "الاسم بالإنجليزي" : "Name (EN)"} *</Label>
                    <Input required placeholder="Hummus" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{isAr ? "الاسم بالعربي" : "Name (AR)"} *</Label>
                    <Input required placeholder="حمص" value={nameAr} onChange={e => setNameAr(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">{isAr ? "سعر البيع" : "Price (SAR)"} *</Label>
                      <Input type="number" min="1" required value={price} onChange={e => setPrice(Number(e.target.value))} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{isAr ? "التكلفة" : "Food Cost (SAR)"} *</Label>
                      <Input type="number" min="0" required value={cost} onChange={e => setCost(Number(e.target.value))} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{isAr ? "التصنيف" : "Category"}</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mains">{isAr ? "الأطباق الرئيسية" : "Mains"}</SelectItem>
                        <SelectItem value="Sides">{isAr ? "الأطباق الجانبية" : "Sides"}</SelectItem>
                        <SelectItem value="Drinks">{isAr ? "المشروبات" : "Drinks"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setNewOpen(false)}>{isAr ? "إلغاء" : "Cancel"}</Button>
                    <Button type="submit" size="sm" className="bg-red-600 hover:bg-red-700 text-white">{isAr ? "حفظ الصنف" : "Save Item"}</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{isAr ? "مراقبة تكلفة الغذاء" : "Food Cost Control"}</CardTitle>
                <CardDescription>{isAr ? "مراقبة تكاليف المكونات لرفع هامش الربح" : "Monitor ingredient pricing to maintain high profit margins"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="rounded-lg bg-red-50 p-3 border border-red-100 flex gap-2">
                  <AlertCircle className="size-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-red-700">
                    <p className="font-bold">{isAr ? "نسبة تكلفة الغذاء المثالية" : "Ideal Food Cost Ratio"}</p>
                    <p className="mt-1">{isAr ? "يُنصح بالحفاظ على نسبة تكلفة الغذاء بين 28% و 35% لضمان استدامة الأرباح." : "Keeping food cost ratio between 28% and 35% is standard for maximum cash sustainability."}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
