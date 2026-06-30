import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/providers/trpc";
import { Upload, FileText, CheckCircle2 } from "lucide-react";

export default function DocumentUpload() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get("documentId");
  const { data: categories } = trpc.documents.getCategories.useQuery();
  const { data: docTypes } = trpc.documents.getDocumentTypes.useQuery();
  const createDoc = trpc.documents.create.useMutation({ onSuccess: () => navigate("/app/documents") });
  const updateDoc = trpc.documents.update.useMutation({ onSuccess: () => navigate("/app/documents") });

  const [form, setForm] = useState({ categoryId: "", title: "", description: "", fileName: "", fileSize: 0, mimeType: "", relatedType: "", relatedId: "" });
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm(f => ({ ...f, fileName: file.name, fileSize: file.size, mimeType: file.type }));
    setUploaded(true);
  };

  const handleSubmit = () => {
    if (editId) {
      updateDoc.mutate({ id: Number(editId), title: form.title, description: form.description, categoryId: form.categoryId ? Number(form.categoryId) : undefined });
    } else {
      createDoc.mutate({
        title: form.title, description: form.description, fileName: form.fileName,
        fileSize: form.fileSize, mimeType: form.mimeType || "application/octet-stream",
        categoryId: form.categoryId ? Number(form.categoryId) : undefined,
        relatedType: form.relatedType || undefined, relatedId: form.relatedId ? Number(form.relatedId) : undefined,
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div><h2 className="text-2xl font-bold">{editId ? "Update Document" : "Upload Document"}</h2><p className="text-sm text-slate-500">Add a new document to the repository</p></div>

      <Card>
        <CardHeader><CardTitle>Document Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Category</Label>
            <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
              <option value="">No Category</option>
              {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <Label>Document Type</Label>
            <select value={form.relatedType} onChange={e => setForm(f => ({ ...f, relatedType: e.target.value }))} className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
              <option value="">General</option>
              {docTypes?.map(t => <option key={t.key} value={t.key}>{t.label} / {t.labelAr}</option>)}
            </select>
          </div>
          <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Document title" /></div>
          <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" /></div>

          {!editId && (
            <div>
              <Label>File</Label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-400" onClick={() => document.getElementById("file-input")?.click()}>
                <div className="text-center">
                  {uploaded ? <CheckCircle2 className="mx-auto w-8 h-8 text-green-500" /> : <Upload className="mx-auto w-8 h-8 text-slate-400" />}
                  <p className="text-sm text-slate-500 mt-2">{uploaded ? form.fileName : "Click to select a file"}</p>
                </div>
              </div>
              <input id="file-input" type="file" className="hidden" onChange={handleFile} />
            </div>
          )}

          {form.relatedType && (
            <div><Label>Related Record ID</Label><Input value={form.relatedId} onChange={e => setForm(f => ({ ...f, relatedId: e.target.value }))} placeholder="e.g. invoice number, employee ID" /></div>
          )}

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => navigate("/app/documents")}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!form.title || createDoc.isPending}>
              {editId ? "Update" : "Upload"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
