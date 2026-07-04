import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

export interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
  className?: string;
  iconClassName?: string;
  onClick?: () => void;
}

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  loading = false,
  className,
  iconClassName,
  onClick,
}: KPICardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all hover:shadow-lg",
        onClick && "cursor-pointer hover:-translate-y-1",
        className
      )}
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            {loading ? (
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            ) : (
              <p className="text-3xl font-bold tracking-tight">
                {value}
              </p>
            )}
            {subtitle && (
              <p className="text-xs text-muted-foreground">
                {subtitle}
              </p>
            )}
            {trend && (
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium",
                trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              )}>
                <span>{trend.isPositive ? "↑" : "↓"}</span>
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className={cn(
              "rounded-lg p-3 bg-primary/10",
              iconClassName
            )}>
              <Icon className="h-6 w-6 text-primary" />
            </div>
          )}
        </div>
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 pointer-events-none" />
    </Card>
  );
}
