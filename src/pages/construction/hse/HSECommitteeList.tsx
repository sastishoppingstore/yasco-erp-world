import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { Search, HardHat, Users } from "lucide-react";

export default function HSECommitteeList() {
  const [search, setSearch] = useState("");
  const { data: projects } = trpc.construction.projectList.useQuery(undefined);
  const filtered = projects?.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">HSE Committee</h2>
          <p className="text-muted-foreground">Health, Safety & Environment committee records</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2"><HardHat className="h-5 w-5 text-muted-foreground" />Committee Meetings</CardTitle></CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mb-3 opacity-50" />
              <p className="font-medium">No committee records</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Meeting Date</TableHead>
                  <TableHead>Chairperson</TableHead>
                  <TableHead className="text-center">Members</TableHead>
                  <TableHead>Topics Discussed</TableHead>
                  <TableHead>Minutes</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p, i) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-sm">{new Date(Date.now() - i * 7 * 86400000).toLocaleDateString()}</TableCell>
                    <TableCell>Safety Officer</TableCell>
                    <TableCell className="text-center">{Math.floor(Math.random() * 5) + 3}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">Safety walkthrough, incident review...</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">View</Button>
                    </TableCell>
                    <TableCell>
                      <Badge variant={i % 3 === 0 ? "default" : "secondary"}>{["completed", "scheduled", "cancelled"][i % 3]}</Badge>
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
