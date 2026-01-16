"use client";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export interface TimelineEntry {
  title: string;
  description: string;
  time: string;
  icon?: React.ReactNode;
  badge?: string;
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  return (
    <div className="relative max-w-4xl mx-auto">
      {data.map((item, index) => (
        <div key={index} className="flex gap-6 relative group">
          {/* Timeline line */}
          <div className="flex flex-col items-center flex-shrink-0">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
              className={cn(
                "w-3 h-3 rounded-full border-2 border-slate-700 bg-slate-900 z-10",
                "group-hover:border-blue-500 group-hover:bg-blue-500/20 transition-colors duration-300"
              )}
            />
            {index !== data.length - 1 && (
              <div className="w-[2px] h-full bg-gradient-to-b from-slate-700 via-slate-800 to-transparent" />
            )}
          </div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 0.1 }}
            className="pb-8 flex-1"
          >
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 group-hover:bg-white/10">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {item.icon && (
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 flex items-center justify-center backdrop-blur-xl"
                    >
                      {item.icon}
                    </motion.div>
                  )}
                  <div>
                    <h3 className="text-slate-100 font-semibold text-lg">{item.title}</h3>
                    {item.badge && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>
                <time className="text-sm text-slate-500 font-mono whitespace-nowrap">
                  {item.time}
                </time>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
            </div>
          </motion.div>
        </div>
      ))}
    </div>
  );
};
