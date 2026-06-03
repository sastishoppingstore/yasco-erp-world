import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles, Send, Bot, User, Loader2, ArrowRight, X } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestions?: string[];
}

export function AiAssistantPanel({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I am your YASCO AI Assistant. How can I help you today?",
      suggestions: [
        "total sales today",
        "profit this month",
        "low stock items",
        "pending invoices",
        "best selling item",
        "tax report"
      ]
    }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const askAssistant = trpc.aiAssistant.ask.useMutation();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    try {
      const data = await askAssistant.mutateAsync({ query: text });
      if (data) {
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.response,
            suggestions: data.suggestions
          }
        ]);
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I encountered an error: " + err.message
        }
      ]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="!max-w-[600px] h-[80vh] p-0 flex flex-col bg-slate-950 border-emerald-500/20 !rounded-2xl gap-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-white/10 bg-gradient-to-r from-emerald-950 to-green-950 flex flex-row items-center justify-between shrink-0">
          <DialogTitle className="flex items-center gap-2 text-white text-base">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <Sparkles className="size-4" />
            </div>
            YASCO AI Assistant
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="flex flex-col gap-4 pb-4">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                <Avatar className="h-8 w-8 shrink-0 border border-white/10 bg-slate-900">
                  <AvatarFallback className="bg-transparent">
                    {msg.role === "user" ? <User className="size-4 text-slate-300" /> : <Bot className="size-4 text-emerald-400" />}
                  </AvatarFallback>
                </Avatar>
                <div className={cn(
                  "flex flex-col gap-2 max-w-[80%]",
                  msg.role === "user" ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                    msg.role === "user"
                      ? "bg-emerald-600 text-white"
                      : "bg-white/10 text-slate-200"
                  )}>
                    {msg.content}
                  </div>

                  {msg.suggestions && msg.suggestions.length > 0 && msg.role === "assistant" && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {msg.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(suggestion)}
                          className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-300 transition-colors hover:bg-emerald-500/20"
                        >
                          {suggestion}
                          <ArrowRight className="size-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {askAssistant.isPending && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 shrink-0 border border-white/10 bg-slate-900">
                  <AvatarFallback className="bg-transparent">
                    <Bot className="size-4 text-emerald-400" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-2xl bg-white/10 px-4 py-2.5">
                  <Loader2 className="size-4 animate-spin text-emerald-400" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-white/10 bg-slate-950 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="relative flex items-center"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="pr-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
              disabled={askAssistant.isPending}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || askAssistant.isPending}
              className="absolute right-1 h-8 w-8 bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
