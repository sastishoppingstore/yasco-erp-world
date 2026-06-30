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
import { ArrowLeft, Save } from "lucide-react";

export default function AdvancePaymentCreate() {
  const navigate = useNavigate();
  const { data: projects } = trpc.construction.projectList.useQuery(undefined);
  const { data: subs } = trpc.construction.subcontractorList.useQuery(undefined);
  const [form, setForm] = useState({
    projectId: "", payeeType: "contractor" as string,
    payeeName: "", amount: "", notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projectId || !form.amount) {
      toast.error("Please fill in required fields");
      return;
    }
    toast.success("Advance payment recorded successfully");
    navigate("/app/construction/advance-payments");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app/construction/advance-payments")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Create Advance Payment</h2>
          <p className="text-muted-foreground">Record an advance payment against a project</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader><CardTitle>Payment Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Project *</Label>
                <Select value={form.projectId} onValueChange={v => setForm({...form, projectId: v})}>
                  <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent>
                    {projects?.map(p => (
                      <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Payee Type</Label>
                <Select value={form.payeeType} onValueChange={v => setForm({...form, payeeType: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contractor">Contractor</SelectItem>
                    <SelectItem value="subcontractor">Subcontractor</SelectItem>
                    <SelectItem value="supplier">Supplier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Payee Name</Label>
              <Input value={form.payeeName} onChange={e => setForm({...form, payeeName: e.target.value})} placeholder="Name of payee" />
            </div>
            <div>
              <Label>Amount (SAR) *</Label>
              <Input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={3} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit"><Save className="h-4 w-4 mr-2" />Record Payment</Button>
              <Button variant="outline" onClick={() => navigate("/app/construction/advance-payments")}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
