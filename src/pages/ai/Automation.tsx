import { useState } from "react";
import { trpc } from "../../providers/trpc";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Switch } from "../../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Separator } from "../../components/ui/separator";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Spinner } from "../../components/ui/spinner";
import { toast } from "sonner";
import { Zap, Lightbulb, Settings2, Play, CheckCircle2, XCircle, AlertTriangle, Sparkles, ArrowRight } from "lucide-react";

export default function AutomationPage() {
  const [activeTab, setActiveTab] = useState("rules");

  const { data: rules, isLoading: rulesLoading, refetch: refetchRules } = trpc.aiAutomation.listRules.useQuery();
  const { data: suggestions, isLoading: suggestionsLoading, refetch: refetchSuggestions } = trpc.aiAutomation.suggestions.useQuery();
  const toggleMutation = trpc.aiAutomation.toggleRule.useMutation();
  const deleteMutation = trpc.aiAutomation.deleteRule.useMutation();
  const applyMutation = trpc.aiAutomation.applySuggestion.useMutation();
  const dismissMutation = trpc.aiAutomation.dismissSuggestion.useMutation();
  const runMutation = trpc.aiAutomation.runRule.useMutation();

  async function handleToggle(id: number, enabled: boolean) {
    try {
      await toggleMutation.mutateAsync({ id, enabled });
      toast.success(enabled ? "Rule enabled" : "Rule disabled");
      refetchRules();
    } catch (err: any) { toast.error(err.message); }
  }

  async function handleDelete(id: number) {
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Rule deleted");
      refetchRules();
    } catch (err: any) { toast.error(err.message); }
  }

  async function handleApplySuggestion(id: number) {
    try {
      await applyMutation.mutateAsync({ id });
      toast.success("Suggestion applied as rule");
      refetchSuggestions();
      refetchRules();
    } catch (err: any) { toast.error(err.message); }
  }

  async function handleDismissSuggestion(id: number) {
    try {
      await dismissMutation.mutateAsync({ id });
      refetchSuggestions();
    } catch (err: any) { toast.error(err.message); }
  }

  async function handleRunRule(id: number) {
    try {
      await runMutation.mutateAsync({ id });
      toast.success("Rule executed");
    } catch (err: any) { toast.error(err.message); }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Sparkles className="size-6 text-primary" /> AI Automation</h1>
          <p className="text-sm text-muted-foreground mt-1">Automate repetitive tasks like expense categorization, bank reconciliation, and anomaly detection</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="rules"><Zap className="size-4 mr-2" /> Rules ({rules?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="suggestions">
            <Lightbulb className="size-4 mr-2" /> Suggestions
            {suggestions && suggestions.length > 0 && <Badge className="ml-2" variant="secondary">{suggestions.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="logs"><Settings2 className="size-4 mr-2" /> Execution Log</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          {rulesLoading ? (
            <div className="flex items-center justify-center py-12"><Spinner className="size-6" /></div>
          ) : rules && rules.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Run</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rules.map((rule: any) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">{rule.name}</TableCell>
                        <TableCell><Badge variant="outline">{rule.ruleType}</Badge></TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{rule.condition}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{rule.action}</TableCell>
                        <TableCell>
                          <Switch checked={rule.enabled} onCheckedChange={(v) => handleToggle(rule.id, v)} />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {rule.lastRunAt ? new Date(rule.lastRunAt).toLocaleDateString() : "Never"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleRunRule(rule.id)} title="Run now"><Play className="size-3" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(rule.id)} title="Delete"><XCircle className="size-3 text-destructive" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Zap className="size-12 text-muted-foreground mb-4" />
                <h3 className="font-medium mb-1">No automation rules yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Switch to the Suggestions tab to see AI-generated rule suggestions based on your usage patterns.</p>
                <Button onClick={() => setActiveTab("suggestions")}><Lightbulb className="size-4 mr-2" /> View Suggestions</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="suggestions">
          {suggestionsLoading ? (
            <div className="flex items-center justify-center py-12"><Spinner className="size-6" /></div>
          ) : suggestions && suggestions.length > 0 ? (
            <div className="grid gap-3">
              {suggestions.map((s: any) => (
                <Card key={s.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary">{s.ruleType}</Badge>
                          <span className="text-xs text-muted-foreground">{s.confidence}% confidence</span>
                        </div>
                        <h4 className="font-medium">{s.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{s.description}</p>
                        {s.sampleData && (
                          <div className="mt-2 p-2 bg-muted rounded text-xs font-mono">{JSON.stringify(s.sampleData).substring(0, 200)}</div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" onClick={() => handleApplySuggestion(s.id)}>
                          <CheckCircle2 className="size-3 mr-1" /> Apply
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDismissSuggestion(s.id)}>
                          <XCircle className="size-3 mr-1" /> Dismiss
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Lightbulb className="size-12 text-muted-foreground mb-4" />
                <h3 className="font-medium mb-1">No suggestions yet</h3>
                <p className="text-sm text-muted-foreground">AI needs more transaction data to generate useful automation suggestions. Continue using the system normally.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardContent className="flex items-center justify-center py-12 text-center">
              <Settings2 className="size-12 text-muted-foreground mb-4" />
              <h3 className="font-medium mb-1">Execution History</h3>
              <p className="text-sm text-muted-foreground">Automation execution logs will appear here as rules are triggered.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
