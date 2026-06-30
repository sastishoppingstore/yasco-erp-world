import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";
import { Plus, X } from "lucide-react";

export default function RfqCreate() {
  const nav = useNavigate();
  const { data: suppliers } = trpc.purchase.supplierList.useQuery();
  const { data: products } = trpc.inventory.productList.useQuery();
  const [form, setForm] = useState({ rfqNumber: `RFQ-${Date.now()}`, title: "", description: "", deadlineDate: "", expectedDeliveryDate: "", notes: "" });
  const [items, setItems] = useState([{ productId: undefined as number | undefined, productName: "", quantity: "1", unit: "pcs", targetPrice: "" }]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<number[]>([]);
  const create = trpc.scm.rfqCreate.useMutation({ onSuccess: () => nav("/app/scm/rfq") });
  const addItem = () => setItems([...items, { productId: undefined, productName: "", quantity: "1", unit: "pcs", targetPrice: "" }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold">Create RFQ</h2>
      <Card><CardContent className="p-6 space-y-4">
        <div><Label>RFQ Number</Label><Input value={form.rfqNumber} onChange={e => setForm({...form, rfqNumber: e.target.value})} /></div>
        <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
        <div><Label>Description</Label><textarea className="w-full border rounded p-2" rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
        <div className="grid grid-cols-2 gap-4"><div><Label>Deadline</Label><Input type="date" value={form.deadlineDate} onChange={e => setForm({...form, deadlineDate: e.target.value})} /></div><div><Label>Expected Delivery</Label><Input type="date" value={form.expectedDeliveryDate} onChange={e => setForm({...form, expectedDeliveryDate: e.target.value})} /></div></div>
        <div><Label className="block mb-2">Items</Label>
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-2 mb-2 items-end">
              <select className="border rounded p-2 text-sm flex-1" value={item.productId || ''} onChange={e => { const newItems = [...items]; newItems[idx].productId = e.target.value ? Number(e.target.value) : undefined; setItems(newItems); }}>
                <option value="">Select product...</option>
                {products?.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <Input placeholder="Product name" value={item.productName} onChange={e => { const n = [...items]; n[idx].productName = e.target.value; setItems(n); }} className="flex-1" />
              <Input type="number" placeholder="Qty" value={item.quantity} onChange={e => { const n = [...items]; n[idx].quantity = e.target.value; setItems(n); }} className="w-20" />
              <Input placeholder="Unit" value={item.unit} onChange={e => { const n = [...items]; n[idx].unit = e.target.value; setItems(n); }} className="w-20" />
              {items.length > 1 && <Button variant="ghost" size="sm" onClick={() => removeItem(idx)}><X className="w-4 h-4" /></Button>}
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addItem}><Plus className="w-4 h-4 mr-1" />Add Item</Button>
        </div>
        <div><Label className="block mb-2">Suppliers</Label>
          <div className="grid grid-cols-2 gap-2">
            {suppliers?.map((s: any) => (
              <label key={s.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={selectedSuppliers.includes(s.id)} onChange={e => { setSelectedSuppliers(e.target.checked ? [...selectedSuppliers, s.id] : selectedSuppliers.filter(id => id !== s.id)); }} />
                {s.name}
              </label>
            ))}
          </div>
        </div>
        <Button onClick={() => create.mutate({ ...form, items: items as any, supplierIds: selectedSuppliers })} disabled={create.isPending}>Create RFQ</Button>
      </CardContent></Card>
    </div>
  );
}
