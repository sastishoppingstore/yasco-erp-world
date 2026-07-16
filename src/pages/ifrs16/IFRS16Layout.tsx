import { useState } from "react";
import { NavLink, Outlet } from "react-router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard, Menu, Building2, CreditCard, CalendarCheck,
  ChevronDown, ChevronRight,
} from "lucide-react";

const navSections = [
  {
    label: "Leases",
    items: [
      { label: "All Leases", path: "/app/ifrs16/leases", icon: Building2 },
    ],
  },
  {
    label: "Assets",
    items: [
      { label: "ROU Assets", path: "/app/ifrs16/assets", icon: CreditCard },
    ],
  },
  {
    label: "Payments",
    items: [
      { label: "Schedule", path: "/app/ifrs16/payments", icon: CalendarCheck },
    ],
  },
];

function Sidebar() {
  const [expanded, setExpanded] = useState<string[]>(navSections.map(s => s.label));
  const toggle = (label: string) => {
    setExpanded(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]);
  };
  return (
    <div className="flex h-full flex-col gap-1 py-2">
      <NavLink to="/app/ifrs16" end className="mx-3 mb-2">
        <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">
          <Building2 className="h-4 w-4" />
          IFRS 16 Leases
        </div>
      </NavLink>
      <ScrollArea className="flex-1 px-3">
        <nav className="flex flex-col gap-1">
          <NavLink to="/app/ifrs16" end className={({ isActive }) => cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}>
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </NavLink>
          {navSections.map(section => (
            <div key={section.label}>
              <button onClick={() => toggle(section.label)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground">
                {expanded.includes(section.label) ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                {section.label}
              </button>
              {expanded.includes(section.label) && section.items.map(item => (
                <NavLink key={item.path} to={item.path} className={({ isActive }) => cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 pl-8 text-sm transition-colors",
                  isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}>
                  <item.icon className="h-4 w-4" /> {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}

export default function IFRS16Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <aside className="hidden w-64 shrink-0 border-r bg-card lg:block"><Sidebar /></aside>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed left-2 top-2 z-50 lg:hidden"><Menu className="h-5 w-5" /></Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0"><Sidebar /></SheetContent>
      </Sheet>
      <main className="flex-1 overflow-auto p-6"><Outlet /></main>
    </div>
  );
}
