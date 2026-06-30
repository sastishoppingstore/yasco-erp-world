import { useState, useEffect, useCallback, useRef } from "react";
import { useLanguage } from "@/providers/language";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Grid3X3, Users, Utensils, ChefHat, Timer, Printer,
  Move, SplitSquareVertical, PauseCircle, Play, Percent,
  Search, Plus, Trash2, ShoppingCart, DollarSign, QrCode,
  Map, Table2, Coffee, Wine, Sandwich, Pizza,
} from "lucide-react";

const courseIcons: Record<string, any> = {
  appetizer: Coffee, main: Utensils, dessert: Wine, drinks: Wine, other: Pizza,
};

const statusColors: Record<string, string> = {
  vacant: "bg-green-100 border-green-400 text-green-800",
  occupied: "bg-blue-100 border-blue-400 text-blue-800",
  ordered: "bg-yellow-100 border-yellow-400 text-yellow-800",
  served: "bg-purple-100 border-purple-400 text-purple-800",
  paid: "bg-gray-100 border-gray-400 text-gray-800",
  reserved: "bg-orange-100 border-orange-400 text-orange-800",
  cleaning: "bg-red-100 border-red-400 text-red-800",
};

export default function RestaurantPOSPage() {
  const { language, dir } = useLanguage();
  const rtl = language === "ar";

  const [activeTab, setActiveTab] = useState("floor");
  const [floorPlans, setFloorPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [orderModal, setOrderModal] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [guestCount, setGuestCount] = useState(1);
  const [kotView, setKotView] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [selectedStation, setSelectedStation] = useState<number | null>(null);

  const trpcUtils = trpc.useUtils();

  // Load floor plans
  useEffect(() => {
    trpcUtils.posRestaurant.floorPlanList.fetch().then(setFloorPlans);
    trpcUtils.posRestaurant.kdsStationList.fetch().then(setStations);
  }, []);

  const loadTables = useCallback(async (planId: number) => {
    const data = await trpcUtils.posRestaurant.tableList.fetch({ floorPlanId: planId });
    setTables(data || []);
  }, [trpcUtils]);

  const handleSelectPlan = useCallback((plan: any) => {
    setSelectedPlan(plan);
    loadTables(plan.id);
  }, [loadTables]);

  const handleTableClick = useCallback((table: any) => {
    setSelectedTable(table);
    if (table.status === "vacant" || table.status === "reserved") {
      setCart([]);
      setGuestCount(1);
    }
    setOrderModal(true);
  }, []);

  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q);
    if (q.length < 1) { setItems([]); return; }
    const result = await trpcUtils.pos.itemSearch.fetch({ query: q });
    setItems(result || []);
  }, [trpcUtils]);

  const handleAddItem = useCallback((item: any) => {
    setCart(prev => {
      const existing = prev.find((i: any) => i.productId === item.id);
      if (existing) {
        return prev.map((i: any) =>
          i.productId === item.id ? { ...i, quantity: i.quantity + 1, totalAmount: (i.quantity + 1) * i.unitPrice } : i
        );
      }
      return [...prev, { productId: item.id, name: item.name, quantity: 1, unitPrice: Number(item.salePrice || 0), totalAmount: Number(item.salePrice || 0), course: "main", modifiers: [], instructions: "" }];
    });
    setSearchQuery("");
    setItems([]);
  }, []);

  const handleCreateOrder = useCallback(async () => {
    if (!selectedTable || cart.length === 0) return;
    try {
      await trpcUtils.posRestaurant.tableOrderCreate.mutate({
        restaurantTableId: selectedTable.id,
        guestCount,
        items: cart.map((i: any) => ({
          productId: i.productId, productName: i.name,
          quantity: i.quantity, unitPrice: String(i.unitPrice),
          course: i.course || "main", modifiers: i.modifiers,
          instructions: i.instructions,
        })),
      });
      toast.success("Order created and sent to KDS");
      setOrderModal(false);
      setCart([]);
      loadTables(selectedPlan.id);
    } catch (e: any) {
      toast.error(e.message || "Order failed");
    }
  }, [selectedTable, cart, guestCount, selectedPlan, loadTables, trpcUtils]);

  const handleTransferTable = useCallback(async (targetTableId: number) => {
    if (!selectedTable || !selectedTable.currentOrderId) return;
    try {
      await trpcUtils.posRestaurant.tableOrderTransfer.mutate({
        orderId: selectedTable.currentOrderId,
        fromTableId: selectedTable.id,
        toTableId: targetTableId,
      });
      toast.success("Order transferred");
      loadTables(selectedPlan.id);
    } catch (e: any) {
      toast.error(e.message);
    }
  }, [selectedTable, selectedPlan, loadTables, trpcUtils]);

  const loadKotView = useCallback(async () => {
    const data = await trpcUtils.posRestaurant.kotPendingTickets.fetch({ stationId: selectedStation || undefined });
    setKotView(data || []);
  }, [trpcUtils, selectedStation]);

  useEffect(() => { if (activeTab === "kds") loadKotView(); }, [activeTab, loadKotView]);

  const formatCurrency = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const subtotal = cart.reduce((s: number, i: any) => s + i.quantity * i.unitPrice, 0);

  return (
    <div dir={dir} className="h-full flex flex-col bg-gray-50">
      <div className="bg-[#123c2e] text-white px-4 py-3 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-lg px-3 py-1.5 text-sm font-bold flex items-center gap-2">
            <Utensils className="size-4" /> Restaurant POS
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-white/30 text-white text-xs">
            {new Date().toLocaleTimeString()}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <div className="bg-white border-b px-4 shrink-0">
          <TabsList>
            <TabsTrigger value="floor"><Map className="size-4 mr-2" /> Floor Plan</TabsTrigger>
            <TabsTrigger value="kds"><ChefHat className="size-4 mr-2" /> KDS</TabsTrigger>
            <TabsTrigger value="menu"><Search className="size-4 mr-2" /> Menu</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="floor" className="flex-1 flex flex-col min-h-0 p-0 m-0">
          <div className="flex gap-4 p-4 flex-1 min-h-0">
            <div className="flex-1 bg-white rounded-xl border p-4 overflow-auto">
              {!selectedPlan && (
                <div className="text-center py-12 text-gray-400">
                  <Map className="size-16 mx-auto mb-4 opacity-30" />
                  <p>Select a floor plan</p>
                  <div className="flex gap-2 justify-center mt-4">
                    {floorPlans.map(plan => (
                      <Button key={plan.id} variant="outline" onClick={() => handleSelectPlan(plan)}>
                        {plan.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              {selectedPlan && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">{selectedPlan.name}</h3>
                    <Button variant="outline" size="sm" onClick={() => setSelectedPlan(null)}>
                      {rtl ? "تغيير" : "Change"}
                    </Button>
                  </div>
                  <div className="relative" style={{ minHeight: selectedPlan.height || 600 }}>
                    {tables.map(table => (
                      <div
                        key={table.id}
                        className={`absolute border-2 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:shadow-lg ${statusColors[table.status] || "bg-gray-100 border-gray-300"}`}
                        style={{
                          left: table.posX, top: table.posY,
                          width: table.width || 80, height: table.height || 60,
                          borderRadius: table.shape === "circle" ? "50%" : table.shape === "square" ? "8px" : "8px",
                        }}
                        onClick={() => handleTableClick(table)}
                      >
                        <div className="text-center">
                          <p className="font-bold text-xs">{table.tableNumber}</p>
                          <p className="text-[10px] opacity-75">{table.capacity}<Users className="size-3 inline ml-1" /></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="w-72 shrink-0 space-y-3">
              <Card>
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm">{rtl ? "الحالة" : "Legend"}</CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-1 text-xs">
                  {Object.entries(statusColors).map(([key, cls]) => (
                    <div key={key} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border ${cls.split(" ").slice(0, 2).join(" ")}`} />
                      <span className="capitalize">{key}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="kds" className="flex-1 flex flex-col min-h-0 p-4 m-0">
          <div className="flex gap-2 mb-4">
            <Button variant={!selectedStation ? "default" : "outline"} size="sm" onClick={() => setSelectedStation(null)}>
              {rtl ? "الكل" : "All"}
            </Button>
            {stations.map(st => (
              <Button
                key={st.id} size="sm"
                variant={selectedStation === st.id ? "default" : "outline"}
                onClick={() => setSelectedStation(st.id)}
              >
                {st.name}
              </Button>
            ))}
            <div className="flex-1" />
            <Button variant="outline" size="sm" onClick={loadKotView}>
              <Timer className="size-4 mr-1" /> {rtl ? "تحديث" : "Refresh"}
            </Button>
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 overflow-auto">
            {kotView.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-400">
                <ChefHat className="size-16 mx-auto mb-4 opacity-30" />
                <p>{rtl ? "لا توجد طلبات معلقة" : "No pending orders"}</p>
              </div>
            )}
            {kotView.map(ticket => (
              <Card key={ticket.id} className="border-l-4" style={{ borderLeftColor: ticket.priority === "rush" ? "#ef4444" : ticket.priority === "vip" ? "#f59e0b" : "#22c55e" }}>
                <CardHeader className="p-3 pb-0 flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold">{ticket.kotNumber}</CardTitle>
                    <p className="text-xs text-gray-500">
                      {ticket.course} · Table #{ticket.restaurantTableId}
                    </p>
                  </div>
                  <Badge>{ticket.status}</Badge>
                </CardHeader>
                <CardContent className="p-3">
                  {ticket.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between py-1 border-b last:border-0 text-sm">
                      <span>{item.quantity}x {item.productName}</span>
                      {item.status === "held" && <Badge variant="outline" className="text-orange-500">{rtl ? "معلّق" : "Held"}</Badge>}
                    </div>
                  ))}
                  <div className="flex gap-2 mt-3">
                    {ticket.status === "pending" && (
                      <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600" onClick={() => trpcUtils.posRestaurant.kotUpdateStatus.mutate({ id: ticket.id, status: "preparing" }).then(loadKotView)}>
                        {rtl ? "قيد التحضير" : "Start"}
                      </Button>
                    )}
                    {ticket.status === "preparing" && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => trpcUtils.posRestaurant.kotUpdateStatus.mutate({ id: ticket.id, status: "ready" }).then(loadKotView)}>
                        <Play className="size-3 mr-1" /> {rtl ? "جاهز" : "Ready"}
                      </Button>
                    )}
                    {ticket.status === "ready" && (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => trpcUtils.posRestaurant.kotUpdateStatus.mutate({ id: ticket.id, status: "served" }).then(loadKotView)}>
                        {rtl ? "تم التقديم" : "Served"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="menu" className="flex-1 p-4 m-0 overflow-auto">
          <div className="max-w-3xl mx-auto">
            <Input
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              placeholder={rtl ? "بحث..." : "Search menu items..."}
              className="mb-4 h-12 text-lg"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {items.slice(0, 20).map(item => (
                <Card key={item.id} className="cursor-pointer hover:border-green-500 transition-all" onClick={() => handleAddItem(item)}>
                  <CardContent className="p-3 text-center">
                    <div className="w-12 h-12 mx-auto rounded-lg bg-green-100 flex items-center justify-center mb-2">
                      <Sandwich className="size-6 text-green-700" />
                    </div>
                    <p className="text-xs font-medium truncate">{rtl && item.nameAr ? item.nameAr : item.name}</p>
                    <p className="text-sm font-bold text-green-700 mt-1">{formatCurrency(Number(item.salePrice))}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Table Order Modal */}
      <Dialog open={orderModal} onOpenChange={setOrderModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              Table #{selectedTable?.tableNumber}
              <Badge className={statusColors[selectedTable?.status]?.split(" ")[0]}>{selectedTable?.status}</Badge>
            </DialogTitle>
          </DialogHeader>
          {(selectedTable?.status === "vacant" || selectedTable?.status === "reserved") ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <label className="text-sm">{rtl ? "عدد الضيوف" : "Guests"}:</label>
                <Input type="number" value={guestCount} onChange={e => setGuestCount(parseInt(e.target.value) || 1)} className="w-20" />
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={e => handleSearch(e.target.value)}
                  placeholder={rtl ? "ابحث عن منتج..." : "Search items..."}
                  className="pl-10 h-10"
                />
              </div>
              {items.length > 0 && (
                <div className="max-h-40 overflow-y-auto border rounded-lg">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer border-b last:border-0" onClick={() => handleAddItem(item)}>
                      <span className="text-sm">{rtl && item.nameAr ? item.nameAr : item.name}</span>
                      <span className="text-sm font-bold">{formatCurrency(Number(item.salePrice))}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="max-h-60 overflow-y-auto space-y-2">
                {cart.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 border rounded-lg p-2">
                    <div className="flex items-center border rounded">
                      <Button variant="ghost" size="icon" className="size-6" onClick={() => {
                        setCart(prev => prev.map((i: any, j: number) => j === idx ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i));
                      }}>-</Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="size-6" onClick={() => {
                        setCart(prev => prev.map((i: any, j: number) => j === idx ? { ...i, quantity: i.quantity + 1 } : i));
                      }}>+</Button>
                    </div>
                    <span className="flex-1 text-sm truncate">{item.name}</span>
                    <Select value={item.course || "main"} onValueChange={v => setCart(prev => prev.map((i: any, j: number) => j === idx ? { ...i, course: v } : i))}>
                      <SelectTrigger className="w-24 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="appetizer">{rtl ? "مقبلات" : "Appetizer"}</SelectItem>
                        <SelectItem value="main">{rtl ? "طبق رئيسي" : "Main"}</SelectItem>
                        <SelectItem value="dessert">{rtl ? "حلوى" : "Dessert"}</SelectItem>
                        <SelectItem value="drinks">{rtl ? "مشروبات" : "Drinks"}</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm font-bold w-16 text-right">{formatCurrency(item.unitPrice * item.quantity)}</span>
                    <Button variant="ghost" size="icon" className="size-6" onClick={() => setCart(prev => prev.filter((_: any, j: number) => j !== idx))}>
                      <Trash2 className="size-3 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>{rtl ? "المجموع" : "Total"}</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <Button className="w-full bg-green-700 hover:bg-green-800" onClick={handleCreateOrder} disabled={cart.length === 0}>
                <Utensils className="size-4 mr-2" /> {rtl ? "إرسال الطلب" : "Send Order to KDS"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">{rtl ? "الطلب قيد التنفيذ" : "Order in progress"}</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  const target = prompt(rtl ? "رقم الطاولة المستهدفة:" : "Target table number:");
                  if (target) handleTransferTable(parseInt(target));
                }}>
                  <Move className="size-4 mr-1" /> {rtl ? "نقل" : "Transfer"}
                </Button>
                <Button variant="outline">
                  <SplitSquareVertical className="size-4 mr-1" /> {rtl ? "تقسيم" : "Split"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
