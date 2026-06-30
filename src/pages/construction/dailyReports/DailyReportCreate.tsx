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

export default function DailyReportCreate() {
  const navigate = useNavigate();
  const { data: projects } = trpc.construction.projectList.useQuery(undefined);
  const [form, setForm] = useState({
    projectId: "", reportDate: new Date().toISOString().split("T")[0],
    weather: "sunny" as string, temperature: "", workersCount: "",
    supervisor: "", activities: "", notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projectId || !form.reportDate) {
      toast.error("Please fill in required fields");
      return;
    }
    toast.success("Daily report created successfully");
    navigate("/app/construction/daily-reports");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app/construction/daily-reports")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Create Daily Report</h2>
          <p className="text-muted-foreground">Record daily site activities and conditions</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader><CardTitle>Report Details</CardTitle></CardHeader>
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
                <Label>Date *</Label>
                <Input type="date" value={form.reportDate} onChange={e => setForm({...form, reportDate: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Weather</Label>
                <Select value={form.weather} onValueChange={v => setForm({...form, weather: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sunny">Sunny</SelectItem>
                    <SelectItem value="cloudy">Cloudy</SelectItem>
                    <SelectItem value="rainy">Rainy</SelectItem>
                    <SelectItem value="dusty">Dusty</SelectItem>
                    <SelectItem value="hot">Hot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Temperature (&deg;C)</Label>
                <Input type="number" value={form.temperature} onChange={e => setForm({...form, temperature: e.target.value})} />
              </div>
              <div>
                <Label>Workers On-site</Label>
                <Input type="number" value={form.workersCount} onChange={e => setForm({...form, workersCount: e.target.value})} />
              </div>
            </div>
            <div>
              <Label>Supervisor</Label>
              <Input value={form.supervisor} onChange={e => setForm({...form, supervisor: e.target.value})} />
            </div>
            <div>
              <Label>Activities Performed</Label>
              <Textarea value={form.activities} onChange={e => setForm({...form, activities: e.target.value})} rows={3} placeholder="Describe the day's activities" />
            </div>
            <div>
              <Label>Notes / Issues</Label>
              <Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={3} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit"><Save className="h-4 w-4 mr-2" />Create Report</Button>
              <Button variant="outline" onClick={() => navigate("/app/construction/daily-reports")}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
