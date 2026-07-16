import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/providers/trpc";
import { FileText, Search, Upload, Download, Clock, Eye, History, FileSignature } from "lucide-react";
import { Link } from "react-router";

export default function DocumentRepository() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<number | undefined>();
  const { data, refetch } = trpc.documents.list.useQuery({ search: search || undefined, categoryId: category, limit: 50 });
  const { data: categories } = trpc.documents.getCategories.useQuery();
  const { data: docTypes } = trpc.documents.getDocumentTypes.useQuery();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Document Repository</h2><p className="text-sm text-slate-500">Manage contracts, IDs, certificates, and more</p></div>
        <Link to="/app/documents/upload"><Button><Upload className="w-4 h-4 mr-2" />Upload Document</Button></Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <select value={category ?? ""} onChange={e => setCategory(e.target.value ? Number(e.target.value) : undefined)} className="rounded-lg border bg-background px-3 py-2 text-sm">
          <option value="">All Categories</option>
          {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
          <TabsTrigger value="signatures">E-Signatures</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          {!data?.items.length ? (
            <Card><CardContent className="py-12 text-center text-slate-500">No documents found. Upload your first document.</CardContent></Card>
          ) : data.items.map(doc => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-xs text-slate-500">{doc.fileName} · {(doc.fileSize ? (doc.fileSize / 1024).toFixed(1) : "0")} KB · v{doc.version}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{new Date(doc.createdAt).toLocaleDateString()}</span>
                  <Link to={`/app/documents/upload?documentId=${doc.id}`}>
                    <Button variant="ghost" size="sm"><Upload className="w-4 h-4" /></Button>
                  </Link>
                  <Dialog>
                    <DialogTrigger asChild><Button variant="ghost" size="sm"><History className="w-4 h-4" /></Button></DialogTrigger>
                    <DialogContent><DocumentVersions documentId={doc.id} /></DialogContent>
                  </Dialog>
                  <Link to={`/app/documents/signature?documentId=${doc.id}`}>
                    <Button variant="ghost" size="sm"><FileSignature className="w-4 h-4" /></Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="expiring">
          <Card><CardContent className="py-8 text-center text-slate-500">Expiry alerts will appear here.</CardContent></Card>
        </TabsContent>

        <TabsContent value="signatures">
          <Card><CardContent className="py-8 text-center text-slate-500">E-signature requests will appear here.</CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DocumentVersions({ documentId }: { documentId: number }) {
  const { data: versions } = trpc.documents.getVersions.useQuery({ documentId });
  return (
    <>
      <DialogHeader><DialogTitle>Version History</DialogTitle></DialogHeader>
      <div className="space-y-3">
        {!versions?.length ? <p className="text-sm text-slate-500">No versions found.</p> :
          versions.map(v => (
            <div key={v.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div>
                <p className="font-medium text-sm">v{v.versionNumber}</p>
                <p className="text-xs text-slate-500">{v.fileName} · {(v.fileSize ? (v.fileSize / 1024).toFixed(1) : "0")} KB</p>
              </div>
              <span className="text-xs text-slate-400">{new Date(v.createdAt).toLocaleString()}</span>
            </div>
          ))}
      </div>
    </>
  );
}
