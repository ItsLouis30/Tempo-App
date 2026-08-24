"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function TempoIntro() {
  const [isVisible, setIsVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const hasSeen = localStorage.getItem("tempo-intro-seen");

    if (hasSeen) {
      setIsVisible(false);
      document.documentElement.style.setProperty('--hero-delay', '0s');
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
        localStorage.setItem("tempo-intro-seen", "true");
      }, 1600);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            try {
              if(localStorage.getItem('tempo-intro-seen')) {
                document.documentElement.style.setProperty('--intro-display', 'none');
                document.documentElement.style.setProperty('--hero-delay', '0s');
              } else {
                document.documentElement.style.setProperty('--intro-display', 'flex');
                document.documentElement.style.setProperty('--hero-delay', '1.5s');
              }
            } catch(e) {}
          `,
        }}
      />
      <AnimatePresence>
        {isVisible && (
          <motion.div
            key="tempo-intro-overlay"
            className="fixed inset-0 z-[200] bg-[#0a0a0a] flex-col items-center justify-center pointer-events-none"
            style={{ display: "var(--intro-display, flex)" }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(5px)" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Solid background for maximum performance */}
            <div className="absolute inset-0 bg-[#0a0a0a] pointer-events-none" />

            {/* Logo Reveal simulating FLIP animation */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.85, filter: "blur(10px)", y: 0 }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
                exit={{ opacity: 0, scale: 0.7, y: -250, filter: "blur(5px)" }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                <div className="absolute inset-0 bg-white/10 blur-2xl rounded-full opacity-50" />
                <img 
                  src="/logo.png" 
                  alt="Tempo Logo" 
                  className="w-28 h-28 md:w-32 md:h-32 object-contain drop-shadow-[0_0_25px_rgba(255,255,255,0.4)] relative z-10" 
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
