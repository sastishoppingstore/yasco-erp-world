import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { Search, Plus, Minus, ShoppingCart, CheckCircle2, X } from "lucide-react";

export default function MobileQuickSales() {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<{ productId: number; name: string; qty: number; price: number }[]>([]);
  const [customer, setCustomer] = useState("");
  const { data: products } = trpc.mobile.quickSaleProducts.useQuery({ search: search || undefined, limit: 20 });
  const { data: customers } = trpc.mobile.getCustomers.useQuery({ search: "" });
  const createSale = trpc.mobile.quickSaleCreate.useMutation();

  const addToCart = (p: any) => {
    setCart(c => {
      const existing = c.find(item => item.productId === p.id);
      if (existing) return c.map(item => item.productId === p.id ? { ...item, qty: item.qty + 1 } : item);
      return [...c, { productId: p.id, name: p.name, qty: 1, price: Number(p.salePrice) }];
    });
  };

  const removeFromCart = (productId: number) => setCart(c => c.filter(item => item.productId !== productId));
  const total = cart.reduce((s, i) => s + i.qty * i.price, 0);

  const handleCheckout = () => {
    createSale.mutate({
      customerId: customer ? Number(customer) : undefined,
      items: cart.map(i => ({ productId: i.productId, quantity: i.qty, unitPrice: i.price })),
    });
    setCart([]);
  };

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold">Quick Sales</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input placeholder="Search products by name, SKU, or barcode..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {products?.slice(0, 8).map(p => (
          <Card key={p.id} className="cursor-pointer hover:shadow-md" onClick={() => addToCart(p)}>
            <CardContent className="p-3">
              <p className="font-medium text-sm">{p.name}</p>
              <p className="text-xs text-slate-500">{p.sku}</p>
              <p className="text-sm font-bold text-blue-600 mt-1">{Number(p.salePrice).toFixed(2)} SAR</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {cart.length > 0 && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <span><ShoppingCart className="w-4 h-4 inline mr-1" />Cart ({cart.length})</span>
              <span className="text-blue-600">{total.toFixed(2)} SAR</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {cart.map(item => (
              <div key={item.productId} className="flex items-center justify-between text-sm">
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.qty} x {item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{(item.qty * item.price).toFixed(2)}</span>
                  <Button variant="ghost" size="sm" onClick={() => removeFromCart(item.productId)}><X className="w-3 h-3" /></Button>
                </div>
              </div>
            ))}
            <div className="pt-2 space-y-2">
              <select value={customer} onChange={e => setCustomer(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                <option value="">Walk-in Customer</option>
                {customers?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <Button className="w-full" onClick={handleCheckout} disabled={!cart.length}>
                <CheckCircle2 className="w-4 h-4 mr-2" />Complete Sale ({total.toFixed(2)} SAR)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
