import * as React from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
  noDivider?: boolean;
}

export function FormSection({
  title,
  description,
  children,
  columns = 2,
  className,
  noDivider = false,
}: FormSectionProps) {
  const gridClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  }[columns];

  return (
    <div className={cn("space-y-6", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-lg font-semibold">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      <div className={cn("grid gap-6", gridClass)}>
        {children}
      </div>

      {!noDivider && <Separator className="my-8" />}
    </div>
  );
}
