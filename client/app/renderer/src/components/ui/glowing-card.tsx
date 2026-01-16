"use client";
import { cn } from "../../lib/utils";
import { motion } from "framer-motion";
import React from "react";

export const GlowingCard = ({
  children,
  className,
  glowColor = "blue",
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: "blue" | "purple" | "pink" | "green" | "yellow" | "cyan" | "orange";
}) => {
  const glowColors = {
    blue: "shadow-blue-500/50 hover:shadow-blue-500/70 border-blue-500/20 hover:border-blue-500/40",
    purple: "shadow-purple-500/50 hover:shadow-purple-500/70 border-purple-500/20 hover:border-purple-500/40",
    pink: "shadow-pink-500/50 hover:shadow-pink-500/70 border-pink-500/20 hover:border-pink-500/40",
    green: "shadow-green-500/50 hover:shadow-green-500/70 border-green-500/20 hover:border-green-500/40",
    yellow: "shadow-yellow-500/50 hover:shadow-yellow-500/70 border-yellow-500/20 hover:border-yellow-500/40",
    cyan: "shadow-cyan-500/50 hover:shadow-cyan-500/70 border-cyan-500/20 hover:border-cyan-500/40",
    orange: "shadow-orange-500/50 hover:shadow-orange-500/70 border-orange-500/20 hover:border-orange-500/40",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "relative rounded-2xl bg-white/5 backdrop-blur-2xl",
        "border border-white/10 shadow-lg transition-all duration-300",
        glowColors[glowColor],
        className
      )}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      {children}
    </motion.div>
  );
};
