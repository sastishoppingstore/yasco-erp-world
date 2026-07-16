import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedGradientProps {
  /**
   * Gradient colors (Tailwind CSS classes)
   */
  colors: string[];
  /**
   * Animation speed in seconds (default: 8)
   */
  speed?: number;
  /**
   * Whether to animate
   */
  animate?: boolean;
  /**
   * CSS class names for the container
   */
  className?: string;
  /**
   * Children to render inside the gradient
   */
  children?: React.ReactNode;
}

/**
 * A component that creates an animated gradient background
 * Uses CSS animations for smooth gradient transitions
 */
export function AnimatedGradient({
  colors,
  speed = 8,
  animate = true,
  className,
  children
}: AnimatedGradientProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Generate CSS variables for the gradient colors
  const colorStops = colors.map((color, index) => {
    const position = ((100 / (colors.length - 1)) * index).toFixed(1);
    return `${color} ${position}%`;
  }).join(", ");

  const animatedClass = animate && isMounted 
    ? "animate-gradient-x" 
    : "";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-gradient-to-r",
        `bg-[linear-gradient-to-right_${colorStops}]`,
        "bg-[length:200%_200%]",
        animate && "transition-all duration-2000 ease-in-out",
        animatedClass,
        className
      )}
    >
      {children}
    </div>
  );
}