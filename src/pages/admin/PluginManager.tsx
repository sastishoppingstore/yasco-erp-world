import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/providers/trpc";
import { Puzzle, ToggleLeft, ToggleRight, Trash2, Settings, Activity } from "lucide-react";

export default function PluginManager() {
  const { data: installed, refetch } = trpc.plugins.listInstalled.useQuery();
  const { data: hooks } = trpc.plugins.getHookDefinitions.useQuery();
  const togglePlugin = trpc.plugins.toggle.useMutation({ onSuccess: () => refetch() });
  const uninstallPlugin = trpc.plugins.uninstall.useMutation({ onSuccess: () => refetch() });
  const [tab, setTab] = useState("installed");

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Plugin Manager</h2><p className="text-sm text-slate-500">Manage installed plugins and hook configurations</p></div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="installed">Installed Plugins</TabsTrigger>
          <TabsTrigger value="hooks">Hook Points</TabsTrigger>
        </TabsList>

        <TabsContent value="installed" className="space-y-3">
          {!installed?.length ? (
            <Card><CardContent className="py-12 text-center text-slate-500">No plugins installed. Browse the marketplace to install plugins.</CardContent></Card>
          ) : installed.map(plugin => (
            <Card key={plugin.pluginName}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Puzzle className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{plugin.pluginName}</p>
                      <Badge variant="outline" className="text-xs">v{plugin.version}</Badge>
                      <Badge variant="outline" className={`text-xs ${plugin.isEnabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                        {plugin.isEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      Hooks: {plugin.manifest?.hooks?.join(", ") ?? "none"} · Installed: {new Date(plugin.installedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={plugin.isEnabled} onCheckedChange={(v) => togglePlugin.mutate({ name: plugin.pluginName, isEnabled: v })} />
                  <Button variant="ghost" size="sm" onClick={() => uninstallPlugin.mutate({ name: plugin.pluginName })}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="hooks" className="space-y-3">
          <Card>
            <CardHeader><CardTitle>Available Hook Points</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {hooks?.map(hook => (
                <div key={hook.name} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">{hook.name}</p>
                    <p className="text-xs text-slate-500">{hook.description}</p>
                  </div>
                  <Badge variant="outline" className="text-xs bg-slate-50">system</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
