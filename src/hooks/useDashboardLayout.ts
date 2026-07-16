import { useState, useEffect, useCallback } from "react";

export type DashboardPreset = "default" | "minimal" | "executive" | "operational";

export interface DashboardLayout {
  preset: DashboardPreset;
  widgets: string[];
}

const DASHBOARD_KEY = "yasco-dashboard-layout";

const allWidgets = [
  "quickActions", "alerts", "kpiCards", "statsRow",
  "charts", "recentInvoices", "topCustomers", "exceptionQueue",
];

const presetWidgets: Record<DashboardPreset, string[]> = {
  default: allWidgets,
  minimal: ["kpiCards", "quickActions"],
  executive: ["kpiCards", "charts", "statsRow"],
  operational: ["alerts", "quickActions", "recentInvoices", "exceptionQueue"],
};

const defaultLayout: DashboardLayout = {
  preset: "default",
  widgets: allWidgets,
};

export function useDashboardLayout() {
  const [layout, setLayout] = useState<DashboardLayout>(defaultLayout);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DASHBOARD_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setLayout(parsed);
      }
    } catch {}
  }, []);

  const saveLayout = useCallback((newLayout: DashboardLayout) => {
    localStorage.setItem(DASHBOARD_KEY, JSON.stringify(newLayout));
    setLayout(newLayout);
  }, []);

  const setPreset = useCallback((preset: DashboardPreset) => {
    const newLayout = { preset, widgets: presetWidgets[preset] };
    saveLayout(newLayout);
  }, [saveLayout]);

  const toggleWidget = useCallback((widgetKey: string) => {
    setLayout(prev => {
      const exists = prev.widgets.includes(widgetKey);
      const newWidgets = exists
        ? prev.widgets.filter(w => w !== widgetKey)
        : [...prev.widgets, widgetKey];
      const newLayout = { ...prev, widgets: newWidgets };
      localStorage.setItem(DASHBOARD_KEY, JSON.stringify(newLayout));
      return newLayout;
    });
  }, []);

  const reorderWidgets = useCallback((newWidgets: string[]) => {
    const newLayout = { ...layout, widgets: newWidgets };
    localStorage.setItem(DASHBOARD_KEY, JSON.stringify(newLayout));
    setLayout(newLayout);
  }, [layout]);

  return { layout, setPreset, toggleWidget, reorderWidgets, allWidgets };
}
