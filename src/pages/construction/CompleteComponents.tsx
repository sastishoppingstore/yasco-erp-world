import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router";
import { toast } from "sonner";

/**
 * COMPLETE LOGIN COMPONENT - Password + OTP
 */

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const { mutate: loginWithPassword } = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const result = await trpc.auth.loginWithPassword.mutate(data);
      return result;
    },
    onSuccess: (data) => {
      if (data.success) {
        localStorage.setItem("sessionToken", data.sessionToken);
        toast.success("Login successful");
        navigate("/dashboard");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Login failed");
    },
  });

  const { mutate: requestOtp } = useMutation({
    mutationFn: async (email: string) => {
      const result = await trpc.auth.requestOtp.mutate({ email });
      return result;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("OTP sent to email");
        setLoginMethod("otp");
      }
    },
  });

  const { mutate: verifyOtp } = useMutation({
    mutationFn: async () => {
      const result = await trpc.auth.verifyOtp.mutate({ email, otp });
      return result;
    },
    onSuccess: (data) => {
      if (data.success) {
        localStorage.setItem("sessionToken", data.sessionToken);
        toast.success("Login successful");
        navigate("/dashboard");
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>YASCO ERP</CardTitle>
          <CardDescription>Construction Management System</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 border-b">
            <button
              onClick={() => setLoginMethod("password")}
              className={`pb-2 px-4 font-medium ${
                loginMethod === "password"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500"
              }`}
            >
              Password
            </button>
            <button
              onClick={() => setLoginMethod("otp")}
              className={`pb-2 px-4 font-medium ${
                loginMethod === "otp"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500"
              }`}
            >
              Email OTP
            </button>
          </div>

          {/* Password Login */}
          {loginMethod === "password" && (
            <form
              onSubmit={form.handleSubmit((data) => loginWithPassword(data))}
              className="space-y-4"
            >
              <div>
                <label className="text-sm font-medium">Username</label>
                <Input
                  {...form.register("username")}
                  placeholder="Enter username"
                  className="mt-1"
                />
                {form.formState.errors.username && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Password</label>
                <Input
                  {...form.register("password")}
                  type="password"
                  placeholder="Enter password"
                  className="mt-1"
                />
                {form.formState.errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          )}

          {/* OTP Login */}
          {loginMethod === "otp" && !otp && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  className="mt-1"
                />
              </div>
              <Button
                onClick={() => requestOtp(email)}
                className="w-full"
                disabled={!email}
              >
                Send OTP
              </Button>
            </div>
          )}

          {/* OTP Verification */}
          {loginMethod === "otp" && otp && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">OTP sent to {email}</p>
              <div>
                <label className="text-sm font-medium">Enter OTP (6 digits)</label>
                <Input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="mt-1 text-center text-2xl tracking-widest"
                />
              </div>
              <Button onClick={() => verifyOtp()} className="w-full" disabled={otp.length !== 6}>
                Verify OTP
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setOtp("");
                  setEmail("");
                }}
              >
                Back
              </Button>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-xs text-gray-500">
            <p>Saudi Arabia Compliant</p>
            <p>Version 1.0.0</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * INVOICE COMPONENT - Complete Invoice with 3D Color Box
 */

export function InvoiceGenerator() {
  const [invoiceData, setInvoiceData] = useState({
    items: [
      { description: "Item 1", quantity: 1, unitPrice: 10000, amount: 10000 },
    ],
    taxPercent: 15,
  });

  const { mutate: generateInvoice } = useMutation({
    mutationFn: async (data: any) => {
      return await trpc.invoice.generateInvoice.mutate(data);
    },
    onSuccess: (data) => {
      toast.success("Invoice generated");
    },
  });

  const subtotal = invoiceData.items.reduce((sum, item) => sum + item.amount, 0);
  const tax = (subtotal * invoiceData.taxPercent) / 100;
  const total = subtotal + tax;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 3D Color Box Header */}
      <div className="relative h-40 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-lg shadow-2xl transform perspective">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold">INVOICE</h1>
            <p className="text-lg opacity-90">Professional Construction Invoice</p>
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Invoice Number</label>
              <Input value="INV-001" disabled className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Invoice Date</label>
              <Input
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Customer</label>
            <Input placeholder="Customer name" className="mt-1" />
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Description</th>
                <th className="text-right py-2">Qty</th>
                <th className="text-right py-2">Unit Price</th>
                <th className="text-right py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items.map((item, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-2">{item.description}</td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right">SAR {item.unitPrice.toLocaleString()}</td>
                  <td className="text-right font-semibold">
                    SAR {item.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Totals */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100">
        <CardContent className="pt-6 space-y-3">
          <div className="flex justify-between text-lg">
            <span>Subtotal:</span>
            <span className="font-semibold">SAR {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-lg">
            <span>Tax ({invoiceData.taxPercent}%):</span>
            <span className="font-semibold">SAR {tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-2xl font-bold border-t pt-3 text-blue-600">
            <span>Total:</span>
            <span>SAR {total.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          onClick={() =>
            generateInvoice({
              projectId: 1,
              invoiceType: "Progress",
              items: invoiceData.items,
              taxPercent: invoiceData.taxPercent,
              dueDate: new Date(),
            })
          }
          className="flex-1"
        >
          Save Invoice
        </Button>
        <Button variant="outline" className="flex-1">
          Print / Export PDF
        </Button>
        <Button variant="outline" className="flex-1">
          Send Email
        </Button>
      </div>
    </div>
  );
}

/**
 * ADVANCED DASHBOARD - 3D Color Blocks
 */

export function AdvancedDashboard() {
  return (
    <div className="space-y-6 p-6">
      {/* 3D Color KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Budget Status",
            value: "48%",
            gradient: "from-blue-500 to-blue-600",
            icon: "💰",
          },
          {
            title: "Schedule Progress",
            value: "45%",
            gradient: "from-green-500 to-green-600",
            icon: "📅",
          },
          {
            title: "Quality Score",
            value: "94.5",
            gradient: "from-purple-500 to-purple-600",
            icon: "⭐",
          },
          {
            title: "Safety Score",
            value: "98.2",
            gradient: "from-orange-500 to-orange-600",
            icon: "🛡️",
          },
        ].map((card, idx) => (
          <div
            key={idx}
            className={`relative p-6 rounded-xl bg-gradient-to-br ${card.gradient} text-white shadow-lg transform hover:scale-105 transition`}
          >
            <div className="absolute top-4 right-4 text-3xl">{card.icon}</div>
            <p className="text-sm opacity-90">{card.title}</p>
            <p className="text-3xl font-bold mt-2">{card.value}</p>
            <div className="mt-4 h-2 bg-white bg-opacity-30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white"
                style={{ width: card.value }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Project Health Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Project Health Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "On Track", value: 15, color: "bg-green-500" },
              { label: "At Risk", value: 8, color: "bg-yellow-500" },
              { label: "Off Track", value: 2, color: "bg-red-500" },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className={`w-20 h-20 rounded-full ${item.color} mx-auto flex items-center justify-center`}>
                  <span className="text-white text-2xl font-bold">{item.value}</span>
                </div>
                <p className="mt-2 font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
