import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { trpc } from "@/providers/trpc";
import { Send, Loader2, MessageCircle, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function AdminChatPage() {
  const [selectedConv, setSelectedConv] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const utils = trpc.useUtils();

  const { data: conversations, refetch: refetchConvs } = trpc.chat.adminConversations.useQuery(undefined, { refetchInterval: 5000 });
  const { data: messages, refetch: refetchMsgs } = trpc.chat.messages.useQuery(
    { conversationId: selectedConv! }, { enabled: !!selectedConv, refetchInterval: 3000 }
  );

  const sendMsg = useMutation(trpc.chat.sendMessage.mutationOptions({
    onSuccess: () => { setMessage(""); refetchMsgs(); refetchConvs(); },
  }));
  const resolveConv = useMutation(trpc.chat.resolveConversation.mutationOptions({
    onSuccess: () => { setSelectedConv(null); refetchConvs(); },
  }));

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <Card className="w-80 shrink-0">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><MessageCircle className="size-5" /> Conversations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[calc(100vh-16rem)] overflow-y-auto">
            {conversations?.length ? conversations.map((conv) => (
              <button key={conv.id} onClick={() => setSelectedConv(conv.id)}
                className={cn("w-full text-left p-3 border-b hover:bg-muted transition-colors", selectedConv === conv.id && "bg-muted")}
              >
                <div className="font-medium text-sm">{conv.subject || `Chat #${conv.id}`}</div>
                <div className="text-xs text-muted-foreground mt-1">Tenant #{conv.tenantId}</div>
                {conv.lastMessageAt && <div className="text-xs text-muted-foreground">{new Date(conv.lastMessageAt).toLocaleString()}</div>}
              </button>
            )) : <div className="p-4 text-center text-sm text-muted-foreground">No active conversations</div>}
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1 flex flex-col">
        {selectedConv ? (
          <>
            <CardHeader className="border-b shrink-0 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Chat #{selectedConv}</CardTitle>
              <Button variant="outline" size="sm" onClick={() => resolveConv.mutate({ conversationId: selectedConv })}>
                <CheckCheck className="size-4 mr-1" /> Resolve
              </Button>
            </CardHeader>
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-3">
                {messages?.map((msg) => (
                  <div key={msg.id} className={cn("max-w-[70%] rounded-lg px-3 py-2 text-sm",
                    msg.senderType === "admin" || msg.senderType === "support"
                      ? "ml-auto bg-primary text-primary-foreground" : "mr-auto bg-muted"
                  )}>
                    <div className="text-xs opacity-70 mb-0.5">{msg.senderName}</div>
                    <div>{msg.message}</div>
                    <div className="text-xs opacity-50 mt-0.5 text-right">{new Date(msg.createdAt).toLocaleTimeString()}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-3 border-t flex gap-2">
              <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type reply..."
                onKeyDown={(e) => { if (e.key === "Enter" && message.trim() && !sendMsg.isPending) sendMsg.mutate({ conversationId: selectedConv, message: message.trim() }); }}
              />
              <Button size="icon" onClick={() => { if (message.trim() && selectedConv) sendMsg.mutate({ conversationId: selectedConv, message: message.trim() }); }}
                disabled={!message.trim() || sendMsg.isPending}>
                {sendMsg.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">Select a conversation to start chatting</div>
        )}
      </Card>
    </div>
  );
}
