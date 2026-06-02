import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, HeadphonesIcon, Clock, AlertCircle, CheckCircle, User } from "lucide-react";

export default function TicketsPage() {
  const { data: tickets, refetch } = trpc.helpdesk.ticketList.useQuery(undefined);
  const createTicket = trpc.helpdesk.ticketCreate.useMutation({ onSuccess: () => refetch() });
  const updateTicket = trpc.helpdesk.ticketUpdate.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [form, setForm] = useState({ ticketNumber: "", subject: "", description: "", category: "", priority: "medium" as const, requesterName: "", requesterEmail: "" });

  const filtered = tickets?.filter(t => !statusFilter || t.status === statusFilter) || [];

  const statusIcons: Record<string, any> = {
    open: AlertCircle,
    in_progress: Clock,
    waiting: Clock,
    resolved: CheckCircle,
    closed: CheckCircle,
    escalated: AlertCircle,
  };

  const priorityColors: Record<string, string> = {
    low: "bg-slate-100 text-slate-700",
    medium: "bg-blue-100 text-blue-700",
    high: "bg-orange-100 text-orange-700",
    urgent: "bg-red-100 text-red-700",
  };

  const statusColors: Record<string, string> = {
    open: "border-l-4 border-blue-500",
    in_progress: "border-l-4 border-amber-500",
    waiting: "border-l-4 border-slate-400",
    resolved: "border-l-4 border-emerald-500",
    closed: "border-l-4 border-gray-400",
    escalated: "border-l-4 border-red-500",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Help Desk</h2><p className="text-slate-500">Support ticket management and SLA tracking</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Ticket</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Ticket</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createTicket.mutate({ ...form }); setOpen(false); }} className="space-y-3">
              <div><Label>Subject</Label><Input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required /></div>
              <div><Label>Description</Label><Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Category</Label><Input value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="e.g. IT Support" /></div>
                <div><Label>Priority</Label>
                  <Select value={form.priority} onValueChange={(v: any) => setForm({...form, priority: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Requester Name</Label><Input value={form.requesterName} onChange={e => setForm({...form, requesterName: e.target.value})} /></div>
                <div><Label>Requester Email</Label><Input type="email" value={form.requesterEmail} onChange={e => setForm({...form, requesterEmail: e.target.value})} /></div>
              </div>
              <Button type="submit" className="w-full">Create Ticket</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => setStatusFilter("")} className={!statusFilter ? "bg-slate-100" : ""}>All ({tickets?.length || 0})</Button>
        {["open", "in_progress", "resolved", "escalated"].map(s => (
          <Button key={s} variant="outline" size="sm" onClick={() => setStatusFilter(s)} className={statusFilter === s ? "bg-slate-100 capitalize" : "capitalize"}>{s.replace("_", " ")} ({tickets?.filter(t => t.status === s).length || 0})</Button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(ticket => {
          const StatusIcon = statusIcons[ticket.status || ""] || AlertCircle;
          return (
            <Card key={ticket.id} className={`hover:shadow-md transition-shadow ${statusColors[ticket.status || ""] || ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1"><StatusIcon className="w-5 h-5 text-slate-400" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-slate-500">{ticket.ticketNumber}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[ticket.priority || ""] || ""}`}>{ticket.priority}</span>
                      {ticket.category && <Badge variant="outline" className="text-xs">{ticket.category}</Badge>}
                    </div>
                    <h3 className="font-semibold mb-1">{ticket.subject}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2">{ticket.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{ticket.requesterName || "Unknown"}</span>
                      <span>Created {new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    {ticket.status === "open" && (
                      <Button size="sm" variant="outline" onClick={() => updateTicket.mutate({ id: ticket.id, status: "in_progress" })}>Start</Button>
                    )}
                    {ticket.status === "in_progress" && (
                      <Button size="sm" variant="outline" onClick={() => updateTicket.mutate({ id: ticket.id, status: "resolved" })}>Resolve</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
