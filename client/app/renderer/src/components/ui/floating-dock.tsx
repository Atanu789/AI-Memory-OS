"use client";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { useState } from "react";

export const FloatingDock = ({
  items,
  className,
}: {
  items: { title: string; icon: LucideIcon; path: string }[];
  className?: string;
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <>
      {/* Blur glass background line */}
      <div className="fixed bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-slate-950/80 via-slate-900/40 to-transparent backdrop-blur-md pointer-events-none z-40" />
      
      <div
        className={cn(
          "fixed bottom-7 left-1/2 -translate-x-1/2 z-50",
          "flex items-center gap-2 px-4 py-3 rounded-2xl",
          "bg-slate-900/30 backdrop-blur-2xl border border-white/10",
          "shadow-xl shadow-slate-950/50",
          className
        )}
      >
      {items.map((item, idx) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <div
            key={item.path}
            className="relative"
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <AnimatePresence>
              {hoveredIndex === idx && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900/50 backdrop-blur-2xl text-slate-200 text-xs font-medium rounded-lg whitespace-nowrap border border-white/10"
                >
                  {item.title}
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(item.path)}
              className={cn(
                "relative p-3 rounded-xl transition-all duration-300",
                isActive 
                  ? "bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/20 shadow-lg shadow-blue-500/20 backdrop-blur-xl" 
                  : "bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-xl"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon 
                className={cn(
                  "w-5 h-5 relative z-10",
                  isActive ? "text-blue-400" : "text-slate-400"
                )} 
              />
            </motion.button>
          </div>
        );
      })}
      </div>
    </>
  );
};
