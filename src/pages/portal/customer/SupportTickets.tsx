import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, HeadphonesIcon, MessageSquare, Send } from "lucide-react";

const priorityColors: Record<string, string> = { low: "bg-slate-100", medium: "bg-blue-100 text-blue-700", high: "bg-amber-100 text-amber-700", urgent: "bg-red-100 text-red-700" };
const statusColors: Record<string, string> = { open: "bg-red-100 text-red-700", in_progress: "bg-blue-100 text-blue-700", waiting: "bg-amber-100 text-amber-700", resolved: "bg-emerald-100 text-emerald-700", closed: "bg-slate-100 text-slate-700" };

export default function CustomerSupportTickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [viewTicket, setViewTicket] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [form, setForm] = useState({ subject: "", description: "", priority: "medium" as const });
  const token = localStorage.getItem("portal_token_customer");

  const loadTickets = () => {
    if (!token) return;
    fetch("/api/trpc/portalCustomer.ticketList", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) })
      .then(r => r.json()).then(j => setTickets(j.result?.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { loadTickets(); }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/trpc/portalCustomer.ticketCreate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, ...form }),
    });
    const json = await res.json();
    if (json.result?.data?.success) {
      setOpen(false);
      setForm({ subject: "", description: "", priority: "medium" });
      loadTickets();
    }
  };

  const handleViewTicket = async (id: number) => {
    const res = await fetch("/api/trpc/portalCustomer.ticketComments", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, ticketId: id }),
    });
    const json = await res.json();
    const tkt = tickets.find(t => t.id === id);
    setViewTicket(tkt || null);
    setComments(json.result?.data || []);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !viewTicket) return;
    await fetch("/api/trpc/portalCustomer.addComment", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, ticketId: viewTicket.id, comment: newComment }),
    });
    setNewComment("");
    handleViewTicket(viewTicket.id);
  };

  if (loading) return <div className="flex justify-center py-20 text-slate-400">Loading tickets...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Support Tickets</h2><p className="text-slate-500">Raise and track support requests</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Ticket</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Raise a Support Ticket</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-3">
              <div><Label>Subject</Label><Input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required /></div>
              <div><Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v: any) => setForm({...form, priority: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Description</Label><Textarea rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} required /></div>
              <Button type="submit" className="w-full">Submit Ticket</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Ticket #</TableHead><TableHead>Subject</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead>Created</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {tickets.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-sm">{t.ticketNumber}</TableCell>
                  <TableCell className="font-medium">{t.subject}</TableCell>
                  <TableCell><span className={`text-xs px-2 py-1 rounded-full ${priorityColors[t.priority] || ""}`}>{t.priority}</span></TableCell>
                  <TableCell><span className={`text-xs px-2 py-1 rounded-full ${statusColors[t.status] || ""}`}>{t.status.replace("_", " ")}</span></TableCell>
                  <TableCell className="text-sm">{new Date(t.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell><Button variant="ghost" size="sm" onClick={() => handleViewTicket(t.id)}><MessageSquare className="w-4 h-4 mr-1" />View</Button></TableCell>
                </TableRow>
              ))}
              {tickets.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-slate-400 py-8">No tickets yet</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!viewTicket} onOpenChange={next => !next && setViewTicket(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HeadphonesIcon className="w-5 h-5" />
              {viewTicket?.ticketNumber} - {viewTicket?.subject}
            </DialogTitle>
          </DialogHeader>
          {viewTicket && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-slate-50 text-sm">
                <p>{viewTicket.description}</p>
                <div className="flex gap-2 mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[viewTicket.priority] || ""}`}>{viewTicket.priority}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColors[viewTicket.status] || ""}`}>{viewTicket.status.replace("_", " ")}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Comments</p>
                {comments.map((c: any) => (
                  <div key={c.id} className="p-3 rounded-lg bg-slate-50 text-sm">
                    <p>{c.comment}</p>
                    <p className="text-xs text-slate-400 mt-1">{new Date(c.createdAt).toLocaleString()}</p>
                  </div>
                ))}
                {comments.length === 0 && <p className="text-sm text-slate-400">No comments yet</p>}
              </div>

              <div className="flex gap-2">
                <Input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Type your reply..." />
                <Button size="sm" onClick={handleAddComment}><Send className="w-4 h-4" /></Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
