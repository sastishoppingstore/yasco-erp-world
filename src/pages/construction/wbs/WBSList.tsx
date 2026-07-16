import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";
import { Plus, Search, ClipboardList, GitBranch } from "lucide-react";

export default function WBSList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: projects, isLoading } = trpc.construction.projectList.useQuery(undefined);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-64 mt-1" /></div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card><CardContent className="p-6"><div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div></CardContent></Card>
      </div>
    );
  }

  const filtered = projects?.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.projectCode.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold">Work Breakdown Structure</h2>
          <p className="text-muted-foreground">Hierarchical decomposition of project work</p>
        </div>
        <Button onClick={() => navigate("/app/construction/wbs/new")}>
          <Plus className="h-4 w-4 mr-2" />New WBS
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-muted-foreground" />
            WBS Items by Project
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mb-3 opacity-50" />
              <p className="font-medium">No projects found</p>
              <p className="text-sm">{search ? "Try a different search term" : "Create a project to add WBS items"}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Code</TableHead>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Contract Value</TableHead>
                  <TableHead className="text-right">Progress</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(p => (
                  <TableRow key={p.id} className="cursor-pointer" onClick={() => navigate(`/app/construction/wbs/${p.id}`)}>
                    <TableCell className="font-mono text-sm">{p.projectCode}</TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{p.status.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">{Number(p.contractValue).toLocaleString()}</TableCell>
                    <TableCell className="text-right">{p.progress}%</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); navigate(`/app/construction/wbs/${p.id}`); }}>
                        <GitBranch className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
