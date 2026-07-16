import { useState } from "react";
import { motion, Variants } from "framer-motion";

interface MicroInteractionProps {
  /**
   * Children elements
   */
  children: React.ReactNode;
  /**
   * Type of interaction effect
   */
  type?: "pulse" | "float" | "shake" | "wiggle" | "hover-lift" | "hover-scale" | "hover-rotate" | "press";
  /**
   * Intensity of the effect (0-1)
   */
  intensity?: number;
  /**
   * Whether the effect is enabled
   */
  enabled?: boolean;
  /**
   * Custom hover styles
   */
  hoverStyle?: React.CSSProperties;
  /**
   * Custom press styles
   */
  pressStyle?: React.CSSProperties;
  /**
   * Additional class names
   */
  className?: string;
}

/**
 * A component that adds subtle micro-interactions to elements
 * Enhances user experience with responsive animations
 */
export function MicroInteraction({
  children,
  type = "hover-lift",
  intensity = 0.1,
  enabled = true,
  hoverStyle,
  pressStyle,
  className
}: MicroInteractionProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Define animation variants based on type
  const variants: Record<string, Variants> = {
    pulse: {
      initial: { scale: 1 },
      animate: { 
        scale: [1, 1 + intensity, 1], 
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      }
    },
    float: {
      initial: { y: 0 },
      animate: { 
        y: [0, -10 * intensity, 0], 
        transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
      }
    },
    shake: {
      initial: { rotate: 0 },
      animate: { 
        rotate: [0, -5 * intensity, 5 * intensity, -5 * intensity, 5 * intensity, 0], 
        transition: { duration: 0.8, repeat: Infinity }
      }
    },
    wiggle: {
      initial: { x: 0 },
      animate: { 
        x: [0, -10 * intensity, 10 * intensity, -10 * intensity, 10 * intensity, 0], 
        transition: { duration: 2, repeat: Infinity }
      }
    },
    "hover-lift": {
      initial: { y: 0, scale: 1 },
      whileHover: { y: -8 * intensity, scale: 1 + (0.05 * intensity) },
      whileTap: { y: -4 * intensity, scale: 0.95 }
    },
    "hover-scale": {
      initial: { scale: 1 },
      whileHover: { scale: 1 + (0.1 * intensity) },
      whileTap: { scale: 0.95 }
    },
    "hover-rotate": {
      initial: { rotate: 0 },
      whileHover: { rotate: `${5 * intensity}deg` },
      whileTap: { rotate: `${2 * intensity}deg` }
    },
    press: {
      initial: { scale: 1 },
      whileTap: { scale: 0.95 }
    }
  };

  const getVariants = () => {
    if (!enabled) return undefined;
    return variants[type] ?? variants["hover-lift"];
  };

  return (
    <motion.div
      variants={getVariants()}
      whileHover={!enabled ? undefined : 
        type === "hover-lift" || type === "hover-scale" || type === "hover-rotate" 
          ? undefined : { ...(hoverStyle || {}) }
      }
      whileTap={!enabled ? undefined : 
        type === "press" || type === "hover-lift" || type === "hover-scale" || type === "hover-rotate"
          ? undefined : { ...(pressStyle || {}) }
      }
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      className={className}
    >
      {children}
    </motion.div>
  );
}