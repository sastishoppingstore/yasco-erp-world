import { cn } from "@/lib/utils";

interface GlassmorphismProps {
  /**
   * Blur intensity (default: 8)
   */
  blur?: number;
  /**
   * Opacity of the glass (default: 0.8)
   */
  opacity?: number;
  /**
   * Border opacity (default: 0.1)
   */
  borderOpacity?: number;
  /**
   * CSS class names
   */
  className?: string;
  /**
   * Children elements
   */
  children?: React.ReactNode;
}

/**
 * A component that applies glassmorphism effect using CSS backdrop-filter
 * Provides a frosted glass appearance with blur and transparency
 */
export function Glassmorphism({
  blur = 8,
  opacity = 0.8,
  borderOpacity = 0.1,
  className,
  children
}: GlassmorphismProps) {
  return (
    <div
      className={cn(
        "relative isolation",
        "bg-white/[var(--glass-opacity,0.8)]",
        "backdrop-blur-[var(--glass-blur,8px)]",
        "border-[var(--glass-border-opacity,0.1)]",
        "border-white/[var(--glass-border-opacity,0.1)]",
        "shadow-[0_8px_32px_rgba(0,0,0,0.1)]",
        style={{
          "--glass-blur": `${blur}px`,
          "--glass-opacity": `${opacity}`,
          "--glass-border-opacity": `${borderOpacity}`
        }},
        className
      )}
    >
      {children}
    </div>
  );
}