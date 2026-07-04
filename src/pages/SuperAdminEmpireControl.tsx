import { useState } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2, Users, DollarSign, Activity, Crown, Shield, Database,
  TrendingUp, AlertTriangle, CheckCircle, XCircle, Globe, Zap,
  Server, HardDrive, Cpu, BarChart3, Eye, Settings, Lock, Unlock
} from "lucide-react";

// SUPER ADMIN EMPIRE CONTROL DASHBOARD
export default function SuperAdminEmpireControl() {
  const { data: stats } = trpc.superAdmin.stats.dashboard.useQuery();
  const { data: health } = trpc.superAdmin.health.system.useQuery();
  const { data: companies } = trpc.superAdmin.companies.list.useQuery({ limit: 10 });
  
  const empireMetrics = [
    { label: "Total Companies", value: stats?.totalCompanies || 0, icon: Building2, color: "from-blue-500 to-blue-600", change: "+12" },
    { label: "Active Users", value: stats?.totalUsers || 0, icon: Users, color: "from-emerald-500 to-emerald-600", change: "+245" },
    { label: "Monthly Revenue", value: `$${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: "from-purple-500 to-purple-600", change: "+18%" },
    { label: "Total Invoices", value: stats?.totalInvoices || 0, icon: BarChart3, color: "from-orange-500 to-orange-600", change: "+1.2K" },
    { label: "Failed ZATCA", value: stats?.failedZatca || 0, icon: AlertTriangle, color: "from-red-500 to-red-600", change: "-5" },
    { label: "System Health", value: "98.5%", icon: Activity, color: "from-cyan-500 to-cyan-600", change: "Stable" },
  ];
  
  const systemMetrics = [
    { label: "CPU Usage", value: health?.cpuUsage || 0, max: 100, icon: Cpu, color: "text-blue-600" },
    { label: "Memory", value: health?.memoryUsage || 0, max: 100, icon: HardDrive, color: "text-purple-600" },
    { label: "Database", value: health?.dbSize || 0, max: 100, icon: Database, color: "text-orange-600" },
    { label: "API Load", value: health?.apiLoad || 0, max: 100, icon: Server, color: "text-emerald-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      {/* Empire Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <Crown className="size-10 text-yellow-500" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Empire Control Center
          </h1>
        </div>
        <p className="text-slate-600 flex items-center gap-2">
          <Shield className="size-4" />
          Full control over all companies, subscriptions, and system health
        </p>
      </motion.div>

      {/* Empire Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {empireMetrics.map((metric, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <Card className="border-2 hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${metric.color}`}>
                    <metric.icon className="size-6 text-white" />
                  </div>
                  <Badge variant="outline" className="text-emerald-600 border-emerald-600">
                    {metric.change}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mb-1">{metric.label}</p>
                <p className="text-3xl font-bold">{metric.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* System Health */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-5 text-emerald-600" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemMetrics.map((sys, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm flex items-center gap-2">
                    <sys.icon className={`size-4 ${sys.color}`} />
                    {sys.label}
                  </span>
                  <span className="text-sm font-bold">{sys.value}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${sys.value}%` }}
                    transition={{ duration: 1, delay: idx * 0.2 }}
                    className={`h-full bg-gradient-to-r ${sys.value > 80 ? 'from-red-500 to-red-600' : 'from-emerald-500 to-emerald-600'}`}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Companies */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Building2 className="size-5 text-blue-600" />
                Recent Companies
              </span>
              <Button size="sm" variant="outline">View All</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {companies?.map((company: any, idx: number) => (
                <motion.div
                  key={company.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Building2 className="size-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{company.name}</p>
                      <p className="text-xs text-slate-500">{company.plan} • {company.users} users</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
                      {company.status}
                    </Badge>
                    <Button size="sm" variant="ghost">
                      <Eye className="size-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <Button className="h-20 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
          <Building2 className="size-5 mr-2" />
          Companies
        </Button>
        <Button className="h-20 bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800">
          <DollarSign className="size-5 mr-2" />
          Billing
        </Button>
        <Button className="h-20 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
          <Shield className="size-5 mr-2" />
          Compliance
        </Button>
        <Button className="h-20 bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800">
          <Settings className="size-5 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  );
}
