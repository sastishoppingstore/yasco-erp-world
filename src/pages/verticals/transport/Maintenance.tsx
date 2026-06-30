import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Wrench } from "lucide-react";

export default function VehicleMaintenancePage() {
  const { data: maintenance } = trpc.assets.vehicleMaintenanceList.useQuery(undefined);
  const { data: fuelAnalytics } = trpc.transport.fuelAnalyticsList.useQuery(undefined);

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Vehicle Maintenance</h2><p className="text-slate-500">Maintenance records and fuel analytics</p></div>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Maintenance Records</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Vehicle</TableHead><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Cost</TableHead><TableHead>Provider</TableHead><TableHead>Next Service</TableHead></TableRow></TableHeader>
            <TableBody>
              {maintenance?.map(m => (
                <TableRow key={m.id}>
                  <TableCell className="font-mono">{m.vehicleId}</TableCell>
                  <TableCell>{m.date}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{m.maintenanceType.replace("_", " ")}</Badge></TableCell>
                  <TableCell className="text-sm max-w-xs truncate">{m.description || "—"}</TableCell>
                  <TableCell className="text-right font-mono">{Number(m.cost).toLocaleString()} SAR</TableCell>
                  <TableCell className="text-sm">{m.serviceProvider || "—"}</TableCell>
                  <TableCell className="text-sm">{m.nextServiceDate || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Fuel Cost Analytics</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Vehicle</TableHead><TableHead>Period</TableHead><TableHead className="text-right">Liters</TableHead><TableHead className="text-right">Cost</TableHead><TableHead className="text-right">Distance</TableHead><TableHead className="text-right">km/L</TableHead><TableHead className="text-right">Cost/km</TableHead></TableRow></TableHeader>
            <TableBody>
              {fuelAnalytics?.map(f => (
                <TableRow key={f.id}>
                  <TableCell className="font-mono">{f.vehicleId}</TableCell>
                  <TableCell className="text-sm">{f.periodStart} → {f.periodEnd}</TableCell>
                  <TableCell className="text-right font-mono">{Number(f.totalLiters).toFixed(1)}</TableCell>
                  <TableCell className="text-right font-mono">{Number(f.totalCost).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{f.distanceCovered}</TableCell>
                  <TableCell className="text-right font-mono">{f.kmPerLiter || "—"}</TableCell>
                  <TableCell className="text-right font-mono">{f.costPerKm || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
