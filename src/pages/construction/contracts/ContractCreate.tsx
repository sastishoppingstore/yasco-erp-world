import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

export default function ContractCreate() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const createProject = trpc.construction.projectCreate.useMutation({
    onSuccess: () => {
      utils.construction.projectList.invalidate();
      toast.success("Contract created successfully");
      navigate("/app/construction/contracts");
    },
  });
  const [form, setForm] = useState({
    projectCode: "", name: "", projectType: "residential" as const,
    location: "", startDate: "", endDate: "", contractValue: "", budget: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projectCode || !form.name) {
      toast.error("Project code and name are required");
      return;
    }
    createProject.mutate(form);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app/construction/contracts")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Create Contract</h2>
          <p className="text-muted-foreground">Set up a new construction contract</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader><CardTitle>Contract Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Contract Code *</Label>
                <Input value={form.projectCode} onChange={e => setForm({...form, projectCode: e.target.value})} placeholder="e.g. CON-001" />
              </div>
              <div>
                <Label>Project Type</Label>
                <Select value={form.projectType} onValueChange={(v: any) => setForm({...form, projectType: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="renovation">Renovation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Project Name *</Label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Contract name" />
            </div>
            <div>
              <Label>Location</Label>
              <Input value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Project location" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Contract Value (SAR)</Label>
                <Input type="number" value={form.contractValue} onChange={e => setForm({...form, contractValue: e.target.value})} />
              </div>
              <div>
                <Label>Budget (SAR)</Label>
                <Input type="number" value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={createProject.isPending}>
                <Save className="h-4 w-4 mr-2" />{createProject.isPending ? "Creating..." : "Create Contract"}
              </Button>
              <Button variant="outline" onClick={() => navigate("/app/construction/contracts")}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
