import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/providers/trpc";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Award, Search } from "lucide-react";

export default function ReportCardsPage() {
  const { data: cards } = trpc.education.reportCardList.useQuery(undefined);
  const [search, setSearch] = useState("");

  const filtered = cards?.filter(c => !search || c.subject.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Report Cards</h2><p className="text-slate-500">Student academic performance records</p></div>
        <div className="relative"><Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" /><Input className="pl-9 w-64" placeholder="Search subject..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Academic Records</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Student ID</TableHead><TableHead>Year</TableHead><TableHead>Term</TableHead><TableHead>Subject</TableHead><TableHead className="text-right">Score</TableHead><TableHead>Grade</TableHead><TableHead>Remarks</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map(c => (
                <TableRow key={c.id}>
                  <TableCell>{c.studentId}</TableCell>
                  <TableCell>{c.academicYear}</TableCell>
                  <TableCell>{c.term}</TableCell>
                  <TableCell><div className="flex items-center gap-2"><Award className="w-4 h-4 text-slate-400" />{c.subject}</div></TableCell>
                  <TableCell className="text-right font-mono">{c.score !== null ? c.score : "—"}</TableCell>
                  <TableCell><Badge variant={Number(c.score) >= 80 ? "default" : Number(c.score) >= 50 ? "secondary" : "destructive"}>{c.grade || "—"}</Badge></TableCell>
                  <TableCell className="text-sm text-slate-600 max-w-xs truncate">{c.remarks || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
