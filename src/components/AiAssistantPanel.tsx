import { useState, useRef, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles, Send, Bot, User, Loader2, ArrowRight, Mic, MicOff, Volume2 } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/language";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestions?: string[];
}

export function AiAssistantPanel({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "مرحباً! أنا مساعد YASCO الذكي. يمكنك كتابة سؤالك أو الضغط على زر الميكروفون للتحدث.\n\nHello! I'm your YASCO AI Assistant. Type or tap the mic to speak! 🎙️",
      suggestions: [
        "total sales today",
        "profit this month",
        "low stock items",
        "pending invoices",
        "best selling item",
        "tax report",
      ],
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { language } = useLanguage();
  const rtl = language === "ar";

  const askAssistant = trpc.aiAssistant.ask.useMutation();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const data = await askAssistant.mutateAsync({ query: text });
      if (data) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.response,
            suggestions: data.suggestions,
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "❌ " + (rtl ? "حدث خطأ: " : "Error: ") + err.message,
        },
      ]);
    }
  };

  const toggleVoice = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      handleSend(rtl ? "المتصفح لا يدعم التعرف على الصوت" : "Voice recognition is not supported in this browser.");
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = language === "ar" ? "ar-SA" : language === "ur" ? "ur-PK" : "en-US";
    rec.continuous = false;
    rec.interimResults = false;

    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
    };
    rec.onerror = () => setListening(false);
    rec.start();
    recognitionRef.current = rec;
  }, [listening, language, rtl]);

  // Text-to-speech for last assistant message
  const speakLastMessage = useCallback(() => {
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastAssistant) return;
    const utterance = new SpeechSynthesisUtterance(lastAssistant.content);
    utterance.lang = language === "ar" ? "ar-SA" : "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [messages, language]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="!max-w-[600px] h-[82vh] p-0 flex flex-col bg-slate-950 border-emerald-500/20 !rounded-2xl gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-4 border-b border-white/10 bg-gradient-to-r from-emerald-950 to-green-950 flex flex-row items-center justify-between shrink-0">
          <DialogTitle className="flex items-center gap-2 text-white text-base">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <Sparkles className="size-4" />
            </div>
            YASCO AI Assistant
          </DialogTitle>
          <div className="flex items-center gap-2">
            {/* TTS button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={speakLastMessage}
              title={rtl ? "استمع للإجابة" : "Speak last answer"}
              className="h-7 w-7 text-slate-400 hover:text-white hover:bg-white/10"
            >
              <Volume2 className="size-3.5" />
            </Button>
            {/* Voice input in header */}
            <button
              onClick={toggleVoice}
              title={rtl ? "التحدث" : "Voice input"}
              className={cn(
                "relative flex items-center justify-center w-8 h-8 rounded-full transition-all",
                listening
                  ? "bg-red-500/20 text-red-400 voice-listening"
                  : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
              )}
            >
              {listening && <span className="voice-ripple pointer-events-none" />}
              {listening ? <MicOff className="size-3.5 relative z-10" /> : <Mic className="size-3.5 relative z-10" />}
            </button>
          </div>
        </DialogHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="flex flex-col gap-4 pb-4">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                <Avatar className="h-8 w-8 shrink-0 border border-white/10 bg-slate-900">
                  <AvatarFallback className="bg-transparent">
                    {msg.role === "user" ? (
                      <User className="size-4 text-slate-300" />
                    ) : (
                      <Bot className="size-4 text-emerald-400" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className={cn("flex flex-col gap-2 max-w-[80%]", msg.role === "user" ? "items-end" : "items-start")}>
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                      msg.role === "user"
                        ? "bg-emerald-600 text-white"
                        : "bg-white/10 text-slate-200"
                    )}
                  >
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
                <div className="rounded-2xl bg-white/10 px-4 py-2.5 flex items-center gap-2">
                  <div className="flex items-end gap-0.5 h-4 text-emerald-400">
                    <span className="voice-bar" />
                    <span className="voice-bar" />
                    <span className="voice-bar" />
                    <span className="voice-bar" />
                  </div>
                  <span className="text-xs text-slate-400">{rtl ? "جاري المعالجة..." : "Thinking..."}</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-white/10 bg-slate-950 shrink-0">
          {/* Voice status indicator */}
          {listening && (
            <div className="mb-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-end gap-0.5 h-4 text-red-400">
                <span className="voice-bar" />
                <span className="voice-bar" />
                <span className="voice-bar" />
                <span className="voice-bar" />
              </div>
              <span className="text-xs text-red-300">{rtl ? "جاري الاستماع... تحدث الآن" : "Listening... speak now"}</span>
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="relative flex items-center gap-2"
          >
            {/* Voice button in input area */}
            <button
              type="button"
              onClick={toggleVoice}
              className={cn(
                "relative flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all",
                listening
                  ? "bg-red-500 text-white voice-listening"
                  : "bg-white/10 text-slate-400 hover:bg-white/20 hover:text-white"
              )}
              title={rtl ? "التحدث" : "Voice input"}
            >
              {listening && <span className="voice-ripple text-red-400 pointer-events-none" />}
              {listening ? <MicOff className="size-4 relative z-10" /> : <Mic className="size-4 relative z-10" />}
            </button>

            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={rtl ? "اكتب سؤالك أو تحدث..." : "Type or say your question..."}
              className="pr-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
              disabled={askAssistant.isPending || listening}
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
          <p className="text-center text-[10px] text-slate-600 mt-2">
            {rtl ? "مدعوم بـ Google Gemini AI · اضغط Mic للتحدث" : "Powered by Google Gemini AI · Tap Mic to speak"}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
