import { forwardRef, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MotionProps, Variants, motion, VariantsLabel } from "framer-motion";

interface Card3DProps extends React.ComponentProps<typeof Card> {
  /**
   * Tilt intensity on hover
   */
  tiltIntensity?: number;
  /**
   * Whether to enable the 3D effect
   */
  enabled?: boolean;
  /**
   * Children elements
   */
  children?: React.ReactNode;
  /**
   * Header content
   */
  header?: React.ReactNode;
  /**
   * Title
   */
  title?: string;
  /**
   * Description
   */
  description?: string;
  /**
   * Footer content
   */
  footer?: React.ReactNode;
}

/**
 * A 3D tilted card component that responds to mouse movement
 * Creates an immersive, interactive experience
 */
const Card3D = forwardRef<
  HTMLDivElement,
  Card3DProps
>(({
  className,
  tiltIntensity = 10,
  enabled = true,
  children,
  header,
  title,
  description,
  footer,
  ...props
}, ref) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Handle mouse move for 3D tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enabled || !cardRef.current) return;
    
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / (width / 2);
    const y = (e.clientY - top - height / 2) / (height / 2);
    
    const rotateX = (y * tiltIntensity) * -1;
    const rotateY = (x * tiltIntensity);
    
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  // Reset transform on mouse leave
  const handleMouseLeave = () => {
    if (!enabled || !cardRef.current) return;
    cardRef.current.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)";
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transition: "transform 0.2s ease-out",
        willChange: "transform"
      }}
      className={className}
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-lg backdrop-blur"
      >
        {header || (
          <>
            {title && <CardTitle className="mb-2">{title}</CardTitle>}
            {description && <CardDescription className="mb-4">{description}</CardDescription>}
          </>
        )}
        <CardContent className="p-6">{children}</CardContent>
        {footer && <CardFooter>{footer}</CardFooter>}
      </motion.div>
    </div>
  );
});

Card3D.displayName = "Card3D";

export { Card3D };