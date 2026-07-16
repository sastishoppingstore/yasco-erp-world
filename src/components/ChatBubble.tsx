import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/providers/trpc";
import { MessageCircle, X, Send, MinusCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function ChatBubble() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [activeConv, setActiveConv] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  const { data: conversations, refetch: refetchConvs } = trpc.chat.myConversations.useQuery(undefined, {
    enabled: open, refetchInterval: 5000,
  });
  const { data: unread } = trpc.chat.unreadCount.useQuery(undefined, { refetchInterval: 5000 });
  const { data: messages, refetch: refetchMsgs } = trpc.chat.messages.useQuery(
    { conversationId: activeConv! }, { enabled: !!activeConv, refetchInterval: 3000 }
  );

  const startConv = useMutation(trpc.chat.startConversation.mutationOptions({
    onSuccess: (data) => { setActiveConv(data.id); refetchConvs(); },
  }));
  const sendMsg = useMutation(trpc.chat.sendMessage.mutationOptions({
    onSuccess: () => { setMessage(""); refetchMsgs(); refetchConvs(); },
  }));
  const markRead = useMutation(trpc.chat.markRead.mutationOptions());
  const resolveConv = useMutation(trpc.chat.resolveConversation.mutationOptions({
    onSuccess: () => { setActiveConv(null); refetchConvs(); },
  }));

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);
  useEffect(() => {
    if (activeConv) markRead.mutate({ conversationId: activeConv });
  }, [activeConv]);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 size-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 flex items-center justify-center transition-all hover:scale-110"
      >
        <MessageCircle className="size-6" />
        {unread ? <span className="absolute -top-1 -right-1 size-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">{unread > 9 ? "9+" : unread}</span> : null}
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 shadow-xl rounded-lg border bg-card">
      <div className="flex items-center justify-between p-3 border-b bg-primary text-primary-foreground rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageCircle className="size-5" />
          <span className="font-semibold">{activeConv ? "Chat" : "Support"}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setMinimized(!minimized)} className="p-1 hover:bg-primary-foreground/20 rounded"><MinusCircle className="size-4" /></button>
          <button onClick={() => { setOpen(false); setActiveConv(null); }} className="p-1 hover:bg-primary-foreground/20 rounded"><X className="size-4" /></button>
        </div>
      </div>

      {!minimized && (
        <>
          <div className="h-80 overflow-y-auto p-3" ref={scrollRef}>
            {!activeConv ? (
              <div className="space-y-2">
                {conversations?.length ? conversations.map((conv) => (
                  <button key={conv.id} onClick={() => setActiveConv(conv.id)}
                    className="w-full text-left p-2 rounded hover:bg-muted transition-colors"
                  >
                    <div className="font-medium text-sm">{conv.subject || "General Inquiry"}</div>
                    <div className="text-xs text-muted-foreground">{new Date(conv.lastMessageAt || conv.createdAt).toLocaleString()}</div>
                  </button>
                )) : (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    <p>No conversations yet.</p>
                    <p className="mt-1">Start a new chat below.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {messages?.map((msg) => (
                  <div key={msg.id} className={cn("max-w-[80%] rounded-lg px-3 py-2 text-sm", msg.senderType === "tenant" ? "ml-auto bg-primary text-primary-foreground" : "mr-auto bg-muted")}>
                    <div className="text-xs opacity-70 mb-0.5">{msg.senderName}</div>
                    <div>{msg.message}</div>
                    <div className="text-xs opacity-50 mt-0.5 text-right">{new Date(msg.createdAt).toLocaleTimeString()}</div>
                  </div>
                ))}
                {(!messages || messages.length === 0) && <p className="text-center text-sm text-muted-foreground py-4">No messages yet</p>}
              </div>
            )}
          </div>

          <div className="p-3 border-t">
            {activeConv ? (
              <div className="flex gap-2">
                <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..."
                  onKeyDown={(e) => { if (e.key === "Enter" && message.trim() && !sendMsg.isPending) sendMsg.mutate({ conversationId: activeConv, message: message.trim() }); }}
                />
                <Button size="icon" onClick={() => { if (message.trim() && activeConv) sendMsg.mutate({ conversationId: activeConv, message: message.trim() }); }}
                  disabled={!message.trim() || sendMsg.isPending}>
                  {sendMsg.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How can we help?"
                  onKeyDown={(e) => { if (e.key === "Enter" && message.trim() && !startConv.isPending) startConv.mutate({ message: message.trim() }); }}
                />
                <Button onClick={() => { if (message.trim()) startConv.mutate({ message: message.trim() }); }}
                  disabled={!message.trim() || startConv.isPending}>
                  {startConv.isPending ? <Loader2 className="size-4 animate-spin" /> : "Start"}
                </Button>
              </div>
            )}
          </div>

          {activeConv ? (
            <div className="p-2 border-t flex justify-between text-xs text-muted-foreground">
              <button onClick={() => setActiveConv(null)} className="hover:underline">Back</button>
              <button onClick={() => resolveConv.mutate({ conversationId: activeConv })} className="hover:underline text-green-600">Resolve</button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
