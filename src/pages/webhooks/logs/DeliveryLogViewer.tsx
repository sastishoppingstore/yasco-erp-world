import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { trpc } from '@/utils/trpc';
import { Search } from 'lucide-react';

export default function DeliveryLogViewer() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = trpc.webhook.listDeliveryLogs.useQuery({ limit: 50 });
  const logs = data?.items || [];

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Delivery Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Last Attempt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
              ) : !logs?.length ? (
                <TableRow><TableCell colSpan={4} className="text-center">No logs found</TableCell></TableRow>
              ) : logs.map((log: any) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.event}</TableCell>
                  <TableCell>
                    <Badge variant={log.status === 'delivered' ? 'success' : log.status === 'failed' ? 'destructive' : 'warning'}>
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.attempts}</TableCell>
                  <TableCell>{log.lastAttempt ? new Date(log.lastAttempt).toLocaleString() : '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
