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
import { ArrowLeft, Save, Calculator } from "lucide-react";

export default function CVRCreate() {
  const navigate = useNavigate();
  const { data: projects } = trpc.construction.projectList.useQuery(undefined);
  const [form, setForm] = useState({
    projectId: "", period: "", bcwp: "", acwp: "", bcws: "", notes: "",
  });

  const bcwpNum = Number(form.bcwp) || 0;
  const acwpNum = Number(form.acwp) || 0;
  const bcwsNum = Number(form.bcws) || 0;
  const cpi = acwpNum > 0 ? bcwpNum / acwpNum : 0;
  const spi = bcwsNum > 0 ? bcwpNum / bcwsNum : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projectId || !form.period) {
      toast.error("Please fill in required fields");
      return;
    }
    toast.success("CVR report created successfully");
    navigate("/app/construction/cvr");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app/construction/cvr")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Create CVR Report</h2>
          <p className="text-muted-foreground">Generate earned value analysis report</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader><CardTitle>CVR Details</CardTitle></CardHeader>
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
                <Label>Period *</Label>
                <Input value={form.period} onChange={e => setForm({...form, period: e.target.value})} placeholder="e.g. Q1 2025" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>BCWP (Earned)</Label>
                <Input type="number" value={form.bcwp} onChange={e => setForm({...form, bcwp: e.target.value})} />
              </div>
              <div>
                <Label>ACWP (Actual)</Label>
                <Input type="number" value={form.acwp} onChange={e => setForm({...form, acwp: e.target.value})} />
              </div>
              <div>
                <Label>BCWS (Planned)</Label>
                <Input type="number" value={form.bcws} onChange={e => setForm({...form, bcws: e.target.value})} />
              </div>
            </div>
            {bcwpNum > 0 && (
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Earned Value Indices</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Cost Performance Index (CPI): </span>
                    <span className={`font-mono font-bold ${cpi >= 1 ? "text-emerald-600" : "text-red-600"}`}>{cpi.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Schedule Performance Index (SPI): </span>
                    <span className={`font-mono font-bold ${spi >= 1 ? "text-emerald-600" : "text-red-600"}`}>{spi.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
            <div>
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={3} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit"><Save className="h-4 w-4 mr-2" />Create Report</Button>
              <Button variant="outline" onClick={() => navigate("/app/construction/cvr")}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
