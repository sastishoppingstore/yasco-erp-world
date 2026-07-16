import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Truck, Users, ArrowLeft, Eye, EyeOff } from "lucide-react";

const portalConfig = {
  customer: { title: "Customer Portal", icon: Building2, color: "from-blue-700 via-blue-600 to-indigo-700", badge: "bg-blue-100 text-blue-700" },
  vendor:   { title: "Vendor Portal", icon: Truck, color: "from-emerald-700 via-emerald-600 to-teal-700", badge: "bg-emerald-100 text-emerald-700" },
  employee: { title: "Employee Self-Service", icon: Users, color: "from-purple-700 via-purple-600 to-violet-700", badge: "bg-purple-100 text-purple-700" },
};

export default function PortalLogin() {
  const { portalType } = useParams<{ portalType: string }>();
  const navigate = useNavigate();
  const config = portalConfig[portalType as keyof typeof portalConfig] || portalConfig.customer;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/trpc/portalAuth.login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          portalType,
        }),
      });
      const json = await res.json();
      if (json.result?.data?.token) {
        localStorage.setItem(`portal_token_${portalType}`, json.result.data.token);
        navigate(`/portal/${portalType}`);
      } else {
        setError("Invalid credentials");
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const Icon = config.icon;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.color} flex items-center justify-center p-4`}>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center">
              <Icon className={`w-8 h-8 ${config.badge.replace("bg-", "text-").replace("100", "700")}`} />
            </div>
          </div>
          <CardTitle className="text-2xl">{config.title}</CardTitle>
          <CardDescription>Sign in to access your portal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Button variant="link" size="sm" className="text-slate-500" onClick={() => navigate("/login")}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Main Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
