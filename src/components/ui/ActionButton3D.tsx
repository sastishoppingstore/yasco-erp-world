import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ActionButton3DProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  color?: "blue" | "amber" | "red" | "emerald" | "purple";
  disabled?: boolean;
  size?: "sm" | "default" | "lg";
  variant?: "solid" | "outline";
}

const colorMap = {
  blue: "bg-blue-600 shadow-blue-600/30 hover:bg-blue-700 text-white border-blue-600",
  amber: "bg-amber-500 shadow-amber-500/30 hover:bg-amber-600 text-white border-amber-500",
  red: "bg-red-600 shadow-red-600/30 hover:bg-red-700 text-white border-red-600",
  emerald: "bg-emerald-600 shadow-emerald-600/30 hover:bg-emerald-700 text-white border-emerald-600",
  purple: "bg-purple-600 shadow-purple-600/30 hover:bg-purple-700 text-white border-purple-600",
};

const outlineColorMap = {
  blue: "bg-white text-blue-700 border-blue-300 hover:bg-blue-50 shadow-blue-200/30",
  amber: "bg-white text-amber-700 border-amber-300 hover:bg-amber-50 shadow-amber-200/30",
  red: "bg-white text-red-700 border-red-300 hover:bg-red-50 shadow-red-200/30",
  emerald: "bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50 shadow-emerald-200/30",
  purple: "bg-white text-purple-700 border-purple-300 hover:bg-purple-50 shadow-purple-200/30",
};

export default function ActionButton3D({
  icon, label, onClick, color = "blue", disabled = false, size = "sm", variant = "solid"
}: ActionButton3DProps) {
  const colors = variant === "solid" ? colorMap[color] : outlineColorMap[color];
  return (
    <Button
      size={size}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "relative transform-gpu transition-all duration-150",
        "hover:-translate-y-0.5 active:translate-y-[2px]",
        "shadow-[0_4px_0_rgba(0,0,0,0.15)] active:shadow-[0_2px_0_rgba(0,0,0,0.15)]",
        "font-semibold tracking-wide",
        colors
      )}
    >
      <span className="flex items-center gap-1.5">
        {icon}
        <span className="hidden sm:inline">{label}</span>
      </span>
    </Button>
  );
}
