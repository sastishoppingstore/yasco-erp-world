import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const yascoLetters = ["Y", "A", "S", "C", "O"];
const techLetters = ["T", "E", "C", "H"];

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [showYasco, setShowYasco] = useState(false);
  const [showTech, setShowTech] = useState(false);
  const [showTagline, setShowTagline] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowYasco(true), 200);
    const t2 = setTimeout(() => setShowTech(true), 1800);
    const t3 = setTimeout(() => setShowTagline(true), 3200);
    const t4 = setTimeout(() => onFinish(), 5000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-950" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="relative flex flex-col items-center gap-2">
        <motion.img
          src="/logo-40.png"
          alt="YASCO"
          initial={{ opacity: 0, scale: 0.3 }}
          animate={showYasco ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-16 h-16 sm:w-20 sm:h-20 mb-4 rounded-2xl object-contain"
        />
        
        <div className="flex items-center gap-1">
          {yascoLetters.map((letter, i) => (
            <motion.span
              key={`yasco-${i}`}
              initial={{ opacity: 0, y: 80, rotateX: -90 }}
              animate={showYasco ? { opacity: 1, y: 0, rotateX: 0 } : {}}
              transition={{ delay: i * 0.12, duration: 0.6, ease: "easeOut" }}
              className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight"
              style={{
                background: "linear-gradient(135deg, #60a5fa, #818cf8, #a78bfa)",
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
            >
              <motion.div className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-blue-400/50" />
              <div className="flex items-center gap-0.5">
                {techLetters.map((letter, i) => (
                  <motion.span
                    key={`tech-${i}`}
                    initial={{ opacity: 0, y: -60, rotateX: 90 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ delay: i * 0.1 + 0.1, duration: 0.5, ease: "easeOut" }}
                    className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-300/80 tracking-widest"
                  >
                    {letter}
                  </motion.span>
                ))}
              </div>
              <motion.div className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-blue-400/50" />
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
              className="text-xs sm:text-sm text-blue-400/60 mt-4 tracking-[0.3em] uppercase"
            >
              Global Smart ERP
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={showYasco ? { scaleX: 1 } : {}}
        transition={{ duration: 1.5, delay: 0.8 }}
        className="absolute bottom-20 h-[2px] w-48 bg-gradient-to-r from-transparent via-blue-400/40 to-transparent"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={showTagline ? { opacity: 1 } : {}}
        transition={{ duration: 0.3 }}
        className="absolute bottom-32"
      >
        <div className="flex gap-1">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-blue-400/60"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
