import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";

interface BOQItem {
  code: string;
  description: string;
  unit: string;
  quantity: string;
  unitPrice: string;
}

export default function BOQCreate() {
  const navigate = useNavigate();
  const { data: projects } = trpc.construction.projectList.useQuery(undefined);
  const [projectId, setProjectId] = useState("");
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<BOQItem[]>([{ code: "", description: "", unit: "each", quantity: "0", unitPrice: "0" }]);

  const addItem = () => setItems([...items, { code: "", description: "", unit: "each", quantity: "0", unitPrice: "0" }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof BOQItem, value: string) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: value };
    setItems(updated);
  };

  const totalValue = items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !title) {
      toast.error("Please fill in required fields");
      return;
    }
    toast.success("BOQ created successfully");
    navigate("/app/construction/boq");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app/construction/boq")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Create Bill of Quantities</h2>
          <p className="text-muted-foreground">Define BOQ items with quantities and pricing</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>BOQ Header</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Project *</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent>
                    {projects?.map(p => (
                      <SelectItem key={p.id} value={String(p.id)}>{p.name} ({p.projectCode})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>BOQ Title *</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Main Building Works" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>BOQ Items</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" />Add Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-6 gap-3 items-end rounded-lg border p-3">
                <div>
                  <Label className="text-xs">Code</Label>
                  <Input value={item.code} onChange={e => updateItem(i, "code", e.target.value)} placeholder="BOQ-001" />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Description</Label>
                  <Input value={item.description} onChange={e => updateItem(i, "description", e.target.value)} placeholder="Item description" />
                </div>
                <div>
                  <Label className="text-xs">Unit</Label>
                  <Select value={item.unit} onValueChange={v => updateItem(i, "unit", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="each">Each</SelectItem>
                      <SelectItem value="m2">m&sup2;</SelectItem>
                      <SelectItem value="m3">m&sup3;</SelectItem>
                      <SelectItem value="lm">Linear m</SelectItem>
                      <SelectItem value="kg">Kg</SelectItem>
                      <SelectItem value="ton">Ton</SelectItem>
                      <SelectItem value="lump">Lump Sum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Qty</Label>
                  <Input type="number" value={item.quantity} onChange={e => updateItem(i, "quantity", e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-xs">Unit Price</Label>
                    <Input type="number" value={item.unitPrice} onChange={e => updateItem(i, "unitPrice", e.target.value)} />
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="mt-6" onClick={() => removeItem(i)} disabled={items.length === 1}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex justify-end pt-2">
              <div className="text-right">
                <span className="text-sm text-muted-foreground">Total Estimated Value:</span>
                <p className="text-xl font-bold">{totalValue.toLocaleString()} SAR</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit"><Save className="h-4 w-4 mr-2" />Create BOQ</Button>
          <Button type="button" variant="outline" onClick={() => navigate("/app/construction/boq")}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
