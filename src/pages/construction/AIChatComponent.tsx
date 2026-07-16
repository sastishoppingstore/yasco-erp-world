import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

/**
 * AI CONSTRUCTION ASSISTANT - Beautiful Chat Interface
 */
export function AIConstructionAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Assalam-o-Alaikum! 👋 I'm your AI Construction Assistant. I can help with budget analysis, scheduling, compliance checks, quality recommendations, and more. What would you like help with?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async (userMessage: string) => {
      return await trpc.ai.chatWithAI.mutate({
        message: userMessage,
        context: {
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
      });
    },
    onSuccess: (data) => {
      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.reply,
            timestamp: new Date(),
          },
        ]);
      }
    },
    onError: (error: any) => {
      toast.error("Failed to get response");
    },
  });

  const handleSendMessage = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = input;
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      },
    ]);

    // Send to AI
    sendMessage(userMessage);
    setInput("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 shadow-lg"
      >
        <h1 className="text-3xl font-bold flex items-center gap-2">
          🤖 AI Construction Assistant
        </h1>
        <p className="text-sm text-purple-100 mt-1">Powered by Claude AI • Real-time Project Intelligence</p>
      </motion.div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence>
          {messages.map((message, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-md lg:max-w-2xl p-4 rounded-lg ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-none shadow-lg"
                    : "bg-white/10 text-white backdrop-blur-sm border border-white/20 rounded-bl-none"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p className={`text-xs mt-2 ${message.role === "user" ? "text-blue-100" : "text-gray-300"}`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white/10 text-white p-4 rounded-lg backdrop-blur-sm border border-white/20">
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce delay-100" />
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce delay-200" />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="px-6 py-4 border-t border-white/10"
      >
        <p className="text-xs text-gray-400 mb-3">Quick actions:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            "💰 Budget Analysis",
            "📅 Schedule Review",
            "✅ Quality Check",
            "🛡️ Safety Report",
            "📋 Compliance Status",
            "⚠️ Risk Analysis",
            "🏗️ Progress Update",
            "📊 Analytics",
          ].map((action, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setInput(action);
                handleSendMessage();
              }}
              className="text-xs p-2 bg-white/10 hover:bg-white/20 text-white rounded border border-white/20 transition-all"
            >
              {action}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Input Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/10 backdrop-blur-md border-t border-white/20 p-6"
      >
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Ask me about budget, schedule, quality, compliance..."
            className="bg-white/20 text-white placeholder-gray-300 border-white/30"
            disabled={isPending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isPending || !input.trim()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isPending ? "..." : "Send"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * INSIGHTS & RECOMMENDATIONS PANEL
 */
export function AIInsightsPanel() {
  const [metrics, setMetrics] = useState({
    budget: 48,
    schedule: 45,
    quality: 94.5,
    safety: 98.2,
  });

  const { data: insights, isPending } = useQuery({
    queryKey: ["aiInsights", metrics],
    queryFn: () =>
      trpc.ai.generateConstructionInsights.query({
        metrics,
        projectContext: "Large commercial construction project in Riyadh",
      }),
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: risks } = useQuery({
    queryKey: ["projectRisks"],
    queryFn: () =>
      trpc.ai.analyzeProjectRisks.query({
        projectId: 1,
        factors: ["Weather delays", "Material shortage", "Labor availability", "Inspection failures"],
      }),
  });

  return (
    <div className="space-y-6 p-6">
      {/* AI Insights */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧠 AI Insights
          </CardTitle>
          <CardDescription>Real-time project analysis and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">Analyzing project...</p>
            </div>
          ) : insights?.data?.insights ? (
            <div className="space-y-3">
              {insights.data.insights.map((insight: string, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex gap-3 p-3 bg-white rounded-lg border-l-4 border-purple-500"
                >
                  <span className="text-xl">💡</span>
                  <p className="text-sm text-gray-700">{insight}</p>
                </motion.div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Risk Analysis */}
      {risks?.risks && (
        <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ⚠️ Risk Analysis
            </CardTitle>
            <CardDescription>Potential project risks and mitigation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(risks.risks).map(([risk, details]: [string, any], idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-3 bg-white rounded-lg border-r-4 border-red-500"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">{risk}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      details.riskLevel > 7 ? "bg-red-500 text-white" :
                      details.riskLevel > 4 ? "bg-yellow-500 text-white" :
                      "bg-green-500 text-white"
                    }`}>
                      {details.riskLevel}/10
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{details.impact}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {insights?.data?.recommendations && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ✅ Recommendations
            </CardTitle>
            <CardDescription>Actions to improve project performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {insights.data.recommendations.map((rec: string, idx: number) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex gap-2 text-sm"
                >
                  <span className="text-green-600 font-bold">{idx + 1}.</span>
                  <span className="text-gray-700">{rec}</span>
                </motion.li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
