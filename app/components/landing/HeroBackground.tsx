"use client";

import { motion } from "framer-motion";

const GRID_SIZE = 48;

export function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Animated grid */}
      <motion.div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #06B6D4 1px, transparent 1px),
            linear-gradient(to bottom, #06B6D4 1px, transparent 1px)
          `,
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
        }}
        animate={{ backgroundPosition: ["0px 0px", `${GRID_SIZE}px ${GRID_SIZE}px`] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      {/* Energy particles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 4 + (i % 3) * 2,
            height: 4 + (i % 3) * 2,
            left: `${8 + (i * 7.5) % 85}%`,
            top: `${12 + (i * 11) % 70}%`,
            background: i % 2 === 0 ? "#06B6D4" : "#22C55E",
            boxShadow: `0 0 12px ${i % 2 === 0 ? "#06B6D4" : "#22C55E"}80`,
          }}
          animate={{
            y: [0, -30 - (i % 4) * 10, 0],
            x: [0, (i % 2 === 0 ? 1 : -1) * 15, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 4 + (i % 5),
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}

      {/* Gradient orbs */}
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#06B6D4]/15 blur-3xl" />
      <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-[#22C55E]/10 blur-3xl" />
      <div className="absolute right-1/4 top-1/3 h-64 w-64 rounded-full bg-[#0F172A]/5 blur-3xl dark:bg-[#06B6D4]/10" />
    </div>
  );
}
