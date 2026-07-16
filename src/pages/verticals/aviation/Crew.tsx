import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/providers/trpc";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserCheck } from "lucide-react";

export default function CrewPage() {
  const { data: certifications } = trpc.aviation.crewCertificationList.useQuery(undefined);

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Crew Certifications</h2><p className="text-slate-500">Track pilot and crew certifications</p></div>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Certifications</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>Certification</TableHead><TableHead>Number</TableHead><TableHead>Issued By</TableHead><TableHead>Issue Date</TableHead><TableHead>Expiry</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {certifications?.map(c => (
                <TableRow key={c.id}>
                  <TableCell><div className="flex items-center gap-2"><UserCheck className="w-4 h-4 text-slate-400" /><span className="font-medium">EMP-{c.employeeId}</span></div></TableCell>
                  <TableCell>{c.certificationType}</TableCell>
                  <TableCell className="font-mono text-sm">{c.certificationNumber || "—"}</TableCell>
                  <TableCell className="text-sm">{c.issuedBy || "—"}</TableCell>
                  <TableCell>{c.issueDate || "—"}</TableCell>
                  <TableCell>{c.expiryDate || "—"}</TableCell>
                  <TableCell><Badge variant={c.isActive ? "default" : "secondary"}>{c.isActive ? "Valid" : "Expired"}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
