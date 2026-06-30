import { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Pen, Type, Upload, CheckCircle2, History } from "lucide-react";

export default function SignaturePad() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestId = searchParams.get("requestId");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tab, setTab] = useState("draw");
  const [typedSig, setTypedSig] = useState("");
  const [uploadedSig, setUploadedSig] = useState("");
  const signMutation = trpc.documents.signDocument.useMutation({ onSuccess: () => navigate("/app/documents") });
  const { data: auditTrail } = trpc.documents.getSignatureAuditTrail.useQuery({ requestId: Number(requestId) }, { enabled: !!requestId });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
  }, []);

  const startDrawing = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const getSignatureData = (): string => {
    if (tab === "draw") return canvasRef.current?.toDataURL() ?? "";
    if (tab === "type") return typedSig;
    return uploadedSig;
  };

  const handleSign = () => {
    if (!requestId) return;
    signMutation.mutate({ requestId: Number(requestId), signatureData: getSignatureData(), signatureType: tab as any });
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div><h2 className="text-2xl font-bold">Sign Document</h2><p className="text-sm text-slate-500">Capture your electronic signature</p></div>

      <Card>
        <CardHeader><CardTitle>Signature Capture</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full">
              <TabsTrigger value="draw" className="flex-1"><Pen className="w-4 h-4 mr-2" />Draw</TabsTrigger>
              <TabsTrigger value="type" className="flex-1"><Type className="w-4 h-4 mr-2" />Type</TabsTrigger>
              <TabsTrigger value="upload" className="flex-1"><Upload className="w-4 h-4 mr-2" />Upload</TabsTrigger>
            </TabsList>

            <TabsContent value="draw">
              <div className="border-2 border-dashed rounded-lg p-1">
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={200}
                  className="w-full touch-none bg-white rounded cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
              </div>
              <Button variant="outline" size="sm" onClick={clearCanvas} className="mt-2">Clear</Button>
            </TabsContent>

            <TabsContent value="type">
              <Input
                value={typedSig}
                onChange={e => setTypedSig(e.target.value)}
                placeholder="Type your full name..."
                className="text-xl font-signature py-6"
              />
              {typedSig && (
                <div className="mt-4 p-4 border rounded-lg bg-white">
                  <p className="text-3xl font-signature" style={{ fontFamily: "'Brush Script MT', 'Dancing Script', cursive" }}>{typedSig}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="upload">
              <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-400"
                onClick={() => document.getElementById("sig-upload")?.click()}>
                <div className="text-center">
                  <Upload className="mx-auto w-8 h-8 text-slate-400" />
                  <p className="text-sm text-slate-500 mt-2">Click to upload signature image (PNG with transparent bg)</p>
                </div>
              </div>
              <input id="sig-upload" type="file" accept="image/png,image/jpeg" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = () => setUploadedSig(r.result as string); r.readAsDataURL(f); } }} />
              {uploadedSig && <img src={uploadedSig} alt="Uploaded signature" className="mt-4 max-h-32 border rounded" />}
            </TabsContent>
          </Tabs>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={() => navigate("/app/documents")}>Cancel</Button>
            <Button onClick={handleSign} disabled={!getSignatureData() || signMutation.isPending}>
              <CheckCircle2 className="w-4 h-4 mr-2" />Sign Document
            </Button>
          </div>
        </CardContent>
      </Card>

      {auditTrail && auditTrail.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><History className="w-4 h-4" />Audit Trail</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {auditTrail.map((log: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded text-sm">
                <span className="font-medium capitalize">{log.event}</span>
                <span className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
