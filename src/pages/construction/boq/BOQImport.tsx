import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, Upload, FileSpreadsheet, Download } from "lucide-react";

export default function BOQImport() {
  const navigate = useNavigate();
  const { data: projects } = trpc.construction.projectList.useQuery(undefined);
  const [projectId, setProjectId] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !file) {
      toast.error("Please select a project and upload a file");
      return;
    }
    toast.success("BOQ imported successfully");
    navigate("/app/construction/boq");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app/construction/boq")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Import BOQ from Excel</h2>
          <p className="text-muted-foreground">Upload an Excel file with BOQ items</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Upload File</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label>Excel File *</Label>
                <div className="mt-1 flex justify-center rounded-lg border border-dashed px-6 py-10">
                  <div className="text-center">
                    <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div className="mt-4 flex text-sm leading-6 text-muted-foreground">
                      <label className="relative cursor-pointer rounded-md font-semibold text-primary hover:text-primary/80">
                        <span>Click to upload</span>
                        <input type="file" className="sr-only" accept=".xlsx,.xls" onChange={handleFileChange} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-muted-foreground">XLSX or XLS up to 10MB</p>
                    {file && <p className="mt-2 text-sm font-medium">{file.name}</p>}
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full"><Upload className="h-4 w-4 mr-2" />Import BOQ</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Import Instructions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <h4 className="font-medium mb-2">Required Columns</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• <strong>Code</strong> — BOQ item code</li>
                <li>• <strong>Description</strong> — Item description</li>
                <li>• <strong>Unit</strong> — Unit of measure (m&sup2;, m&sup3;, each, etc.)</li>
                <li>• <strong>Quantity</strong> — Quantity of item</li>
                <li>• <strong>Unit Price</strong> — Price per unit in SAR</li>
              </ul>
            </div>
            <Button variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />Download Template
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
