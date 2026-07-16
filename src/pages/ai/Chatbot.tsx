import { useState, useRef, useEffect } from "react";
import { trpc } from "../../providers/trpc";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Spinner } from "../../components/ui/spinner";
import { Bot, Send, User, MessageSquare, Plus, Ticket, X, BotMessageSquare } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  actions?: { label: string; action: string }[];
}

const SUGGESTIONS = [
  "What were my top 5 selling products last month?",
  "Show me my current cash position",
  "How many pending invoices do I have?",
  "What's my employee attendance rate this week?",
  "Summarize my recent sales",
  "Any overdue invoices?",
];

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "assistant", content: "Hello! I'm your AI assistant. Ask me anything about your business — sales, inventory, HR, accounting, or just navigate to a module.", timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatMutation = trpc.aiChatbot.message.useMutation();
  const createTicketMutation = trpc.aiChatbot.createTicket.useMutation();
  const faqQuery = trpc.aiChatbot.faq.useQuery(undefined, { staleTime: 600000 });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const result = await chatMutation.mutateAsync({
        message: text,
        sessionId: sessionId || undefined,
      });

      if (result.sessionId && !sessionId) setSessionId(result.sessionId);

      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: result.response,
        timestamp: new Date(),
        actions: result.needsHuman ? [{ label: "Create Support Ticket", action: "create_ticket" }] : undefined,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages(prev => [...prev, { id: `e-${Date.now()}`, role: "system", content: err.message || "Failed to get response", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTicket() {
    const lastAssistant = [...messages].reverse().find(m => m.role === "assistant");
    if (!lastAssistant) return;

    try {
      await createTicketMutation.mutateAsync({ description: lastAssistant.content });
      setMessages(prev => [...prev, { id: `s-${Date.now()}`, role: "system", content: "Support ticket created. Our team will follow up shortly.", timestamp: new Date() }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { id: `e-${Date.now()}`, role: "system", content: "Failed to create ticket.", timestamp: new Date() }]);
    }
  }

  function clearChat() {
    setMessages([{ id: "welcome", role: "assistant", content: "Chat cleared. How can I help you?", timestamp: new Date() }]);
    setSessionId(null);
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4 p-4">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b px-4 py-3 flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BotMessageSquare className="size-5 text-primary" />
            AI Assistant Chat
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{messages.length} messages</span>
            <Button variant="ghost" size="sm" onClick={clearChat}><X className="size-4" /></Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 flex flex-col">
          <ScrollArea ref={scrollRef} className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                  {msg.role !== "user" && (
                    <Avatar className="size-8"><AvatarFallback className="bg-primary/10 text-primary text-xs"><Bot className="size-4" /></AvatarFallback></Avatar>
                  )}
                  <div className={`max-w-[75%] rounded-lg px-4 py-2 text-sm ${
                    msg.role === "user" ? "bg-primary text-primary-foreground" :
                    msg.role === "system" ? "bg-yellow-50 text-yellow-800 border" :
                    "bg-muted"
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.actions && (
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline" onClick={handleCreateTicket}>
                          <Ticket className="size-3 mr-1" /> Create Ticket
                        </Button>
                      </div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <Avatar className="size-8"><AvatarFallback className="bg-primary text-primary-foreground text-xs"><User className="size-4" /></AvatarFallback></Avatar>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <Avatar className="size-8"><AvatarFallback className="bg-primary/10 text-primary text-xs"><Bot className="size-4" /></AvatarFallback></Avatar>
                  <div className="bg-muted rounded-lg px-4 py-2"><Spinner className="size-4" /></div>
                </div>
              )}
            </div>
          </ScrollArea>

          {messages.filter(m => m.role === "assistant").length <= 1 && (
            <div className="px-4 pb-3">
              <p className="text-xs text-muted-foreground mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <Button key={s} variant="outline" size="sm" className="text-xs" onClick={() => handleSend(s)}>
                    <MessageSquare className="size-3 mr-1" /> {s}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {faqQuery.data && faqQuery.data.length > 0 && (
            <div className="px-4 pb-3">
              <p className="text-xs text-muted-foreground mb-1">FAQ:</p>
              <div className="flex flex-wrap gap-1">
                {faqQuery.data.slice(0, 5).map((f: any) => (
                  <Badge key={f.id} variant="secondary" className="cursor-pointer text-xs" onClick={() => handleSend(f.question)}>
                    {f.question}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="border-t p-4">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="flex gap-2">
              <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything about your business..." disabled={loading} className="flex-1" />
              <Button type="submit" disabled={loading || !input.trim()}>
                {loading ? <Spinner className="size-4" /> : <Send className="size-4" />}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {faqQuery.data && faqQuery.data.length > 0 && (
        <Card className="w-72 hidden xl:flex flex-col">
          <CardHeader className="border-b px-4 py-3">
            <CardTitle className="text-sm flex items-center gap-2"><Bot className="size-4" /> Knowledge Base</CardTitle>
          </CardHeader>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {faqQuery.data.map((f: any) => (
                <Button key={f.id} variant="ghost" className="w-full justify-start text-xs h-auto py-2" onClick={() => handleSend(f.question)}>
                  <MessageSquare className="size-3 mr-2 shrink-0" />
                  <span className="text-left">{f.question}</span>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
}
