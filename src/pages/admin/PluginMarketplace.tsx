import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { Download, CheckCircle2, ExternalLink, Puzzle, Star } from "lucide-react";

export default function PluginMarketplace() {
  const { data: store, refetch } = trpc.plugins.getStore.useQuery();
  const { data: installed } = trpc.plugins.listInstalled.useQuery();
  const installPlugin = trpc.plugins.install.useMutation({ onSuccess: () => refetch() });

  const isInstalled = (name: string) => installed?.some(p => p.pluginName === name);

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Plugin Marketplace</h2><p className="text-sm text-slate-500">Browse and install plugins to extend YASCO ERP</p></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {store?.map(plugin => (
          <Card key={plugin.name} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Puzzle className="w-5 h-5 text-white" />
                </div>
                {isInstalled(plugin.name) && <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />Installed</Badge>}
              </div>
              <CardTitle className="mt-3 text-lg">{plugin.name}</CardTitle>
              <CardDescription>{plugin.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>v{plugin.version}</span>
                <span>by {plugin.author}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {plugin.hooks.map(hook => (
                  <Badge key={hook} variant="outline" className="text-xs bg-slate-50">{hook}</Badge>
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Star className="w-3 h-3" />
                <span>{plugin.permissions.length} permissions required</span>
              </div>
              <Button
                className="w-full"
                variant={isInstalled(plugin.name) ? "outline" : "default"}
                disabled={isInstalled(plugin.name) || installPlugin.isPending}
                onClick={() => installPlugin.mutate({ name: plugin.name })}
              >
                {isInstalled(plugin.name) ? (
                  <><CheckCircle2 className="w-4 h-4 mr-2" />Installed</>
                ) : (
                  <><Download className="w-4 h-4 mr-2" />Install</>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
