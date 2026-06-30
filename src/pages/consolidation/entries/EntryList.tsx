import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/providers/trpc";
import { Badge } from "@/components/ui/badge";

export default function EntryList() {
  const { data: entries } = trpc.consolidation.consolidationEntryList.useQuery(undefined);

  const entryTypeColors: Record<string, string> = {
    elimination: "bg-red-100 text-red-800", reclassification: "bg-blue-100 text-blue-800",
    adjustment: "bg-amber-100 text-amber-800", translation: "bg-purple-100 text-purple-800",
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Consolidation Entries</h2><p className="text-slate-500">All entries across consolidation groups</p></div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left"><th className="p-3 font-medium">Type</th><th className="p-3 font-medium">Description</th><th className="p-3 font-medium">Amount</th><th className="p-3 font-medium">Currency</th><th className="p-3 font-medium">Status</th></tr></thead>
            <tbody>
              {entries?.map(e => (
                <tr key={e.id} className="border-b last:border-0">
                  <td className="p-3"><Badge variant="outline" className={entryTypeColors[e.entryType]}>{e.entryType}</Badge></td>
                  <td className="p-3">{e.description}</td>
                  <td className="p-3">{e.amount}</td>
                  <td className="p-3">{e.currency}</td>
                  <td className="p-3 capitalize">{e.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
