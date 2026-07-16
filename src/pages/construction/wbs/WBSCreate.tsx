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

export default function WBSCreate() {
  const navigate = useNavigate();
  const { data: projects } = trpc.construction.projectList.useQuery(undefined);
  const [form, setForm] = useState({ projectId: "", code: "", name: "", description: "", parentId: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projectId || !form.code || !form.name) {
      toast.error("Please fill in required fields");
      return;
    }
    toast.success("WBS item created successfully");
    navigate("/app/construction/wbs");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app/construction/wbs")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Create WBS Item</h2>
          <p className="text-muted-foreground">Add a new work breakdown structure element</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>WBS Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Project *</Label>
              <Select value={form.projectId} onValueChange={v => setForm({...form, projectId: v})}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {projects?.map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.name} ({p.projectCode})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>WBS Code *</Label>
                <Input value={form.code} onChange={e => setForm({...form, code: e.target.value})} placeholder="e.g. 1.1.1" />
              </div>
              <div>
                <Label>Parent WBS</Label>
                <Input value={form.parentId} onChange={e => setForm({...form, parentId: e.target.value})} placeholder="Optional" />
              </div>
            </div>
            <div>
              <Label>Name *</Label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="WBS element name" />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Optional description" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit"><Save className="h-4 w-4 mr-2" />Create WBS</Button>
              <Button variant="outline" onClick={() => navigate("/app/construction/wbs")}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
