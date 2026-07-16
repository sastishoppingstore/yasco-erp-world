import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { TrendingUp, Bell, Users, Clock, Activity } from "lucide-react";

export default function MobileDashboard() {
  const { data: stats } = trpc.mobile.getDashboard.useQuery();
  const { data: notifications } = trpc.notifications2.listTemplates.useQuery();

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">YASCO ERP</h1>
        <Badge variant="outline" className="bg-blue-100 text-blue-800">
          <Activity className="w-3 h-3 mr-1" />Live
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-1" />
            <p className="text-lg font-bold">{stats?.todaySalesAmount?.toFixed(0) ?? 0} SAR</p>
            <p className="text-xs text-slate-500">Today's Sales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 text-amber-500 mx-auto mb-1" />
            <p className="text-lg font-bold">{stats?.pendingApprovals ?? 0}</p>
            <p className="text-xs text-slate-500">Approvals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Bell className="w-6 h-6 text-blue-500 mx-auto mb-1" />
            <p className="text-lg font-bold">{stats?.unreadNotifications ?? 0}</p>
            <p className="text-xs text-slate-500">Notifications</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 text-purple-500 mx-auto mb-1" />
            <p className="text-lg font-bold">{stats?.todayPresent ?? 0}</p>
            <p className="text-xs text-slate-500">Present Today</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <p className="font-medium text-sm mb-3">Quick Actions</p>
          <div className="grid grid-cols-2 gap-2">
            <a href="/app/mobile/approvals" className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-center text-sm font-medium text-blue-700 dark:text-blue-300">
              Approvals
            </a>
            <a href="/app/mobile/attendance" className="p-3 rounded-lg bg-green-50 dark:bg-green-900/30 text-center text-sm font-medium text-green-700 dark:text-green-300">
              Clock In/Out
            </a>
            <a href="/app/mobile/sales" className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-center text-sm font-medium text-amber-700 dark:text-amber-300">
              Quick Sale
            </a>
            <a href="/app/mobile/technician-jobs" className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-center text-sm font-medium text-purple-700 dark:text-purple-300">
              My Jobs
            </a>
            <a href="/app/mobile/site-expense" className="p-3 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-center text-sm font-medium text-rose-700 dark:text-rose-300">
              Site Expense
            </a>
            <a href="/app/notifications/preferences" className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/30 text-center text-sm font-medium text-slate-700 dark:text-slate-300">
              Settings
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
