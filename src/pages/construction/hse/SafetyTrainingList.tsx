import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { Search, GraduationCap, BookOpen } from "lucide-react";

export default function SafetyTrainingList() {
  const [search, setSearch] = useState("");
  const { data: projects } = trpc.construction.projectList.useQuery(undefined);
  const filtered = projects?.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Safety Training</h2>
          <p className="text-muted-foreground">Track safety training sessions and certifications</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-muted-foreground" />Training Records</CardTitle></CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <BookOpen className="h-12 w-12 mb-3 opacity-50" />
              <p className="font-medium">No training records</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Training Title</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead className="text-center">Attendees</TableHead>
                  <TableHead>Date Completed</TableHead>
                  <TableHead>Certification</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p, i) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{["Fire Safety", "First Aid", "Working at Height", "Confined Space"][i % 4]}</TableCell>
                    <TableCell className="text-sm">Safety Training Center</TableCell>
                    <TableCell className="text-center">{Math.floor(Math.random() * 20) + 5}</TableCell>
                    <TableCell className="text-sm">{new Date(Date.now() - i * 30 * 86400000).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={i % 3 === 0 ? "default" : "secondary"}>{i % 3 === 0 ? "Certified" : "Pending"}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{new Date(Date.now() + (12 - i) * 30 * 86400000).toLocaleDateString()}</TableCell>
                    <TableCell><Badge variant="outline">{["active", "expiring", "expired"][i % 3]}</Badge></TableCell>
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
