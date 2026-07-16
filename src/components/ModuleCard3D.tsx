import { useRef, useCallback } from "react";
import { useLanguage } from "@/providers/language";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import * as Icons from "lucide-react";
import { Link } from "react-router";

interface ModuleCard3DProps {
  icon: string;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  featureCount?: number;
  gradientFrom?: string;
  gradientTo?: string;
  detailUrl?: string;
  isLoggedIn?: boolean;
  moduleKey: string;
  language?: "en" | "ar";
}

export function ModuleCard3D({
  icon: iconName,
  name,
  nameAr,
  description,
  descriptionAr,
  featureCount,
  gradientFrom = "from-emerald-500",
  gradientTo = "to-green-700",
  detailUrl,
  isLoggedIn,
  moduleKey: _moduleKey,
  language: propLanguage,
}: ModuleCard3DProps) {
  const ctx = useLanguage();
  const lang = propLanguage ?? ctx.language;
  const rtl = lang === "ar";

  const cardRef = useRef<HTMLDivElement>(null);

  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }> | undefined>)[iconName];

  const displayName = rtl && nameAr ? nameAr : name;
  const displayDesc = rtl && descriptionAr ? descriptionAr : description;

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(10px)`;
    const glare = card.querySelector(".glare") as HTMLElement;
    if (glare) {
      glare.style.background = `radial-gradient(circle at ${(e.clientX - rect.left) / rect.width * 100}% ${(e.clientY - rect.top) / rect.height * 100}%, rgba(52,211,153,0.15) 0%, transparent 60%)`;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0px)`;
    const glare = card.querySelector(".glare") as HTMLElement;
    if (glare) glare.style.background = "transparent";
  }, []);

  return (
    <div
      ref={cardRef}
      className={cn(
        "group relative overflow-hidden rounded-2xl p-6",
        "bg-white/5 backdrop-blur-xl border border-white/10",
        "hover:bg-white/10 hover:border-white/20",
        "transition-all duration-500 ease-out",
        "hover:shadow-2xl hover:shadow-emerald-500/5",
        "before:pointer-events-none before:absolute before:-inset-[1px]",
        "before:rounded-2xl before:opacity-0 before:transition-opacity before:duration-500",
        "group-hover:before:opacity-100",
        "before:bg-gradient-to-br before:from-emerald-400/20 before:to-green-400/5",
      )}
      style={{
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glare effect */}
      <div
        className="glare absolute inset-0 rounded-2xl pointer-events-none transition-all duration-300 z-20"
        style={{ background: "transparent" }}
      />

      {/* Glow border */}
      <div
        className={cn(
          "absolute -inset-0.5 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 pointer-events-none",
          "group-hover:opacity-70",
          "bg-gradient-to-br",
          gradientFrom,
          gradientTo,
        )}
      />

      <div
        className="relative z-10 flex flex-col gap-4 h-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Icon + badge row */}
        <div
          className="flex items-start justify-between gap-3"
          style={{ transform: "translateZ(30px)" }}
        >
          <div
            className={cn(
              "flex items-center justify-center",
              "w-14 h-14 rounded-2xl shrink-0",
              "bg-gradient-to-br shadow-lg shadow-emerald-500/10",
              gradientFrom,
              gradientTo,
              "group-hover:scale-110 transition-transform duration-500",
            )}
          >
            {IconComponent ? (
              <IconComponent className="size-7 text-white" />
            ) : (
              <Icons.Box className="size-7 text-white" />
            )}
          </div>

          {featureCount !== undefined && featureCount > 0 && (
            <Badge
              variant="secondary"
              className="bg-white/10 text-white/70 border-white/10 backdrop-blur-sm shrink-0"
            >
              {featureCount}
            </Badge>
          )}
        </div>

        {/* Text content */}
        <div
          className="flex-1"
          style={{ transform: "translateZ(20px)" }}
        >
          <h3 className="text-lg font-bold text-white group-hover:text-emerald-200 transition-colors duration-300">
            {displayName}
          </h3>
          {displayDesc && (
            <p className="text-sm text-white/60 mt-1.5 line-clamp-2 leading-relaxed">
              {displayDesc}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div
          className={cn(
            "flex items-center gap-2 pt-3",
            rtl ? "flex-row-reverse" : "flex-row",
          )}
          style={{ transform: "translateZ(40px)" }}
        >
          {detailUrl && (
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/10 backdrop-blur-sm"
            >
              <Link to={detailUrl}>
                {rtl ? "عرض التفاصيل" : "View Details"}
              </Link>
            </Button>
          )}
          {isLoggedIn && (
            <Button
              asChild
              size="sm"
              className={cn(
                "text-white border-0",
                "bg-gradient-to-r",
                gradientFrom,
                gradientTo,
                "hover:opacity-90",
              )}
            >
              <Link to={detailUrl || `/app/${_moduleKey}`}>
                {rtl ? "فتح الوحدة" : "Open Module"}
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Decorative ghost icon */}
      <div
        className="absolute -bottom-8 -right-8 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none"
        style={{ transform: "translateZ(-20px)" }}
      >
        {IconComponent ? (
          <IconComponent className="size-32 text-white" />
        ) : (
          <Icons.Box className="size-32 text-white" />
        )}
      </div>
    </div>
  );
}
