import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const yascoLetters = ["Y", "A", "S", "C", "O"];
const techLetters = ["T", "E", "C", "H"];

const bismillah = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [phase, setPhase] = useState<"bismillah" | "yasco" | "done">("bismillah");
  const [showYasco, setShowYasco] = useState(false);
  const [showTech, setShowTech] = useState(false);
  const [showTagline, setShowTagline] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("yasco"), 2800);
    const t2 = setTimeout(() => setShowYasco(true), 3000);
    const t3 = setTimeout(() => setShowTech(true), 4500);
    const t4 = setTimeout(() => setShowTagline(true), 5800);
    const t5 = setTimeout(() => onFinish(), 7000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-950 via-slate-950 to-yellow-950" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="relative flex flex-col items-center gap-2">
        {/* Phase 1: Bismillah */}
        <AnimatePresence mode="wait">
          {phase === "bismillah" && (
            <motion.div
              key="bismillah"
              initial={{ opacity: 0, x: 200 }}
              animate={{
                opacity: 1,
                x: 0,
                y: [0, -15, 0, -8, 0],
              }}
              exit={{ opacity: 0, x: -200 }}
              transition={{
                x: { duration: 1.2, ease: "easeOut" },
                y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 0.6 },
              }}
              className="mb-4"
            >
              <span
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-amber-300 leading-relaxed"
                style={{
                  fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif",
                  textShadow: "0 0 40px rgba(251, 191, 36, 0.3), 0 0 80px rgba(251, 191, 36, 0.15)",
                }}
              >
                {bismillah}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase 2: YASCO TECH */}
        <AnimatePresence>
          {phase === "yasco" && (
            <motion.div
              key="brand"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-2"
            >
              <motion.img
                src="/logo-40.png"
                alt="YASCO"
                initial={{ opacity: 0, scale: 0.3 }}
                animate={showYasco ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-16 h-16 sm:w-20 sm:h-20 mb-4 rounded-2xl object-contain"
              />

              <div className="flex items-center gap-1" style={{ direction: "ltr" }}>
                {yascoLetters.map((letter, i) => (
                  <motion.span
                    key={`yasco-${i}`}
                    initial={{ opacity: 0, y: 80, rotateX: -90 }}
                    animate={showYasco ? { opacity: 1, y: 0, rotateX: 0 } : {}}
                    transition={{ delay: i * 0.12, duration: 0.6, ease: "easeOut" }}
                    className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight"
                    style={{
                      background: "linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </div>

              <AnimatePresence>
                {showTech && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex items-center gap-1 mt-1"
                    style={{ direction: "ltr" }}
                  >
                    <motion.div className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-amber-400/50" />
                    <div className="flex items-center gap-0.5" style={{ direction: "ltr" }}>
                      {techLetters.map((letter, i) => (
                        <motion.span
                          key={`tech-${i}`}
                          initial={{ opacity: 0, y: -60, rotateX: 90 }}
                          animate={{ opacity: 1, y: 0, rotateX: 0 }}
                          transition={{ delay: i * 0.1 + 0.1, duration: 0.5, ease: "easeOut" }}
                          className="text-2xl sm:text-3xl md:text-4xl font-bold text-amber-300/80 tracking-widest"
                        >
                          {letter}
                        </motion.span>
                      ))}
                    </div>
                    <motion.div className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-amber-400/50" />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showTagline && (
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6 }}
                    className="text-xs sm:text-sm text-amber-400/60 mt-4 tracking-[0.3em] uppercase"
                  >
                    Enterprise Resource Planning
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={phase === "yasco" && showYasco ? { scaleX: 1 } : {}}
        transition={{ duration: 1.5, delay: 0.8 }}
        className="absolute bottom-20 h-[2px] w-48 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent"
      />

      {phase === "bismillah" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-32"
        >
          <div className="flex gap-1.5">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-amber-400/60"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
