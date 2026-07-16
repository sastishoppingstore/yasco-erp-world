import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Download, Plus } from "lucide-react";
import { toast } from "sonner";

export default function EmployeeDocuments() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", category: "personal", fileUrl: "" });
  const token = localStorage.getItem("portal_token_employee");

  const loadDocuments = () => {
    if (!token) return;
    fetch("/api/trpc/portalEmployee.documentList", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).then(r => r.json()).then(j => setDocuments(j.result?.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { loadDocuments(); }, [token]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/trpc/portalEmployee.documentUpload", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, ...form, fileSize: 0, mimeType: "application/pdf" }),
    });
    const json = await res.json();
    if (json.result?.data?.success) {
      toast.success("Document uploaded");
      setOpen(false);
      setForm({ name: "", category: "personal", fileUrl: "" });
      loadDocuments();
    } else {
      toast.error("Upload failed");
    }
  };

  if (loading) return <div className="flex justify-center py-20 text-slate-400">Loading documents...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">My Documents</h2><p className="text-slate-500">Upload and manage your documents</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Upload className="w-4 h-4 mr-2" />Upload Document</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
            <form onSubmit={handleUpload} className="space-y-3">
              <div><Label>Document Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div><Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="identification">Identification</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="certification">Certification</SelectItem>
                    <SelectItem value="payroll">Payroll</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>File URL</Label><Input type="url" value={form.fileUrl} onChange={e => setForm({...form, fileUrl: e.target.value})} placeholder="Paste file URL or upload" /></div>
              <Button type="submit" className="w-full">Upload</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map(doc => (
          <Card key={doc.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-100"><FileText className="w-5 h-5 text-blue-600" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{doc.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{doc.category}</p>
                  {doc.fileSize && <p className="text-xs text-slate-400">{(doc.fileSize / 1024).toFixed(1)} KB</p>}
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">{doc.status || "pending"}</Badge>
                    {doc.fileUrl && (
                      <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => window.open(doc.fileUrl, "_blank")}>
                        <Download className="w-3 h-3 mr-1" />Download
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{new Date(doc.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {documents.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No documents uploaded yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
