import { useState, useRef, useCallback } from "react";
import { trpc } from "../../providers/trpc";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Spinner } from "../../components/ui/spinner";
import { Mic, MicOff, Play, Square, Command, List, Volume2, Globe, Ear, Speech } from "lucide-react";
import { toast } from "sonner";

interface TranscriptEntry {
  id: string;
  text: string;
  response: string;
  timestamp: Date;
  action?: string;
}

export default function VoicePage() {
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const commandsQuery = trpc.aiVoice.commands.useQuery({ language });
  const processMutation = trpc.aiVoice.process.useMutation();
  const transcribeMutation = trpc.aiVoice.transcribe.useMutation();
  const synthesizeMutation = trpc.aiVoice.synthesize.useMutation();

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch (err: any) {
      toast.error("Microphone access denied. Please allow microphone permissions.");
    }
  }, [language]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  async function processAudio(audioBlob: Blob) {
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64 = (reader.result as string)?.split(",")[1] || "";

        if (SpeechRecognition) {
          try {
            const recognition = new SpeechRecognition();
            recognition.lang = language === "ar" ? "ar-SA" : "en-US";
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onresult = async (event: any) => {
              const transcript = event.results[0][0].transcript;
              await processTranscript(transcript);
            };

            recognition.onerror = () => {
              transcribeAndProcess(base64);
            };

            recognition.start();
            recognitionRef.current = recognition;
          } catch {
            await transcribeAndProcess(base64);
          }
        } else {
          await transcribeAndProcess(base64);
        }
      };
    } catch (err: any) {
      toast.error("Audio processing failed");
      setIsProcessing(false);
    }
  }

  async function transcribeAndProcess(audioBase64: string) {
    try {
      const transcribeResult = await transcribeMutation.mutateAsync({
        audioBase64,
        language,
      });
      if (transcribeResult.success && transcribeResult.transcript) {
        await processTranscript(transcribeResult.transcript);
      } else {
        toast.error("Could not recognize speech");
        setIsProcessing(false);
      }
    } catch (err: any) {
      toast.error("Transcription failed");
      setIsProcessing(false);
    }
  }

  async function processTranscript(transcript: string) {
    try {
      const result = await processMutation.mutateAsync({ transcript, language });

      const entry: TranscriptEntry = {
        id: `t-${Date.now()}`,
        text: transcript,
        response: result.response,
        timestamp: new Date(),
        action: result.action || undefined,
      };

      setTranscripts(prev => [entry, ...prev]);

      const utterance = new SpeechSynthesisUtterance(result.response);
      utterance.lang = language === "ar" ? "ar-SA" : "en-US";
      utterance.rate = 1.0;
      speechSynthesis.speak(utterance);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsProcessing(false);
    }
  }

  function toggleListening() {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  }

  function speakText(text: string) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "ar" ? "ar-SA" : "en-US";
    speechSynthesis.speak(utterance);
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4 p-4">
      <div className="flex-1 flex flex-col gap-4">
        <Card className="flex flex-col items-center justify-center py-12">
          <CardContent className="text-center">
            <div className={`relative inline-flex mb-6 ${isListening ? "animate-pulse" : ""}`}>
              <Button
                size="lg"
                variant={isListening ? "destructive" : "default"}
                className="size-24 rounded-full"
                onClick={toggleListening}
              >
                {isListening ? <MicOff className="size-8" /> : <Mic className="size-8" />}
              </Button>
              {isListening && (
                <span className="absolute -top-1 -right-1 size-4 bg-red-500 rounded-full animate-ping" />
              )}
            </div>
            <h2 className="text-xl font-semibold mb-2">
              {isListening ? "Listening..." : isProcessing ? "Processing..." : "Click to Start"}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {language === "en"
                ? 'Say a command like "open sales", "create invoice", or "quick summary"'
                : 'قل أمراً مثل "فتح المبيعات" أو "إنشاء فاتورة" أو "ملخص سريع"'}
            </p>
            <div className="flex items-center justify-center gap-2">
              <Button
                variant={language === "en" ? "default" : "outline"}
                size="sm"
                onClick={() => setLanguage("en")}
              >
                <Globe className="size-3 mr-1" /> English
              </Button>
              <Button
                variant={language === "ar" ? "default" : "outline"}
                size="sm"
                onClick={() => setLanguage("ar")}
              >
                <Globe className="size-3 mr-1" /> العربية
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="border-b px-4 py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Speech className="size-4" /> Voice Transcripts ({transcripts.length})
            </CardTitle>
          </CardHeader>
          <ScrollArea className="h-[300px]">
            <CardContent className="p-4 space-y-3">
              {transcripts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No voice commands yet. Start speaking to see transcriptions.</p>
              ) : (
                transcripts.map((entry) => (
                  <div key={entry.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="secondary" className="text-xs">You said</Badge>
                      <span className="text-xs text-muted-foreground">{entry.timestamp.toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm font-medium mb-2">"{entry.text}"</p>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Badge variant="outline" className="text-xs mb-1">Response</Badge>
                        <p className="text-sm text-muted-foreground">{entry.response}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="shrink-0 ml-2" onClick={() => speakText(entry.response)}>
                        <Volume2 className="size-3" />
                      </Button>
                    </div>
                    {entry.action && <Badge className="mt-2 text-xs">{entry.action}</Badge>}
                  </div>
                ))
              )}
            </CardContent>
          </ScrollArea>
        </Card>
      </div>

      <Card className="w-72 hidden xl:flex flex-col">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm flex items-center gap-2"><Command className="size-4" /> Voice Commands</CardTitle>
          <CardDescription className="text-xs">Say these commands</CardDescription>
        </CardHeader>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {commandsQuery.data?.map((cmd: any) => (
              <div key={cmd.command} className="p-2 rounded hover:bg-muted cursor-pointer" onClick={() => speakText(cmd.command)}>
                <p className="text-sm font-medium">{cmd.command}</p>
                <p className="text-xs text-muted-foreground">{cmd.description}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
