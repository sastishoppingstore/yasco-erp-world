import { useState, type ReactNode } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function LicenseGate({ children }: { children: ReactNode }) {
  const [key, setKey] = useState("");
  const status = trpc.license.status.useQuery(undefined, { retry: false });
  const activate = trpc.license.activate.useMutation({
    onSuccess: () => status.refetch(),
  });

  if (status.isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50">
        <Loader2 className="size-6 animate-spin text-slate-500" />
      </div>
    );
  }

  if (!status.data?.desktopMode || status.data.activated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen grid place-items-center bg-slate-100 px-4">
      <Card className="w-full max-w-md rounded-lg">
        <CardHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-md bg-slate-900 text-white">
            <KeyRound className="size-5" />
          </div>
          <CardTitle>Desktop license required</CardTitle>
          <CardDescription>Enter the license key generated from Super Admin to activate this Windows app.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={key}
            onChange={(event) => setKey(event.target.value)}
            placeholder="YASCO-..."
            autoFocus
          />
          {status.data.error ? <p className="text-sm text-red-600">{status.data.error}</p> : null}
          {activate.error ? <p className="text-sm text-red-600">{activate.error.message}</p> : null}
          <Button
            className="w-full"
            disabled={activate.isPending || key.trim().length < 20}
            onClick={() => activate.mutate({ key })}
          >
            {activate.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <KeyRound className="mr-2 size-4" />}
            Activate
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
