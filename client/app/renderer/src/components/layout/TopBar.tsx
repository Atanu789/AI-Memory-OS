import { Activity, Wifi, Database, Cpu, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TopBar() {
  return (
    <header className="h-10 bg-slate-900/30 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between px-6 text-xs relative overflow-hidden z-50">
      {/* Animated gradient line */}
      <motion.div 
        className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
        animate={{ width: ["0%", "100%"] }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
      />
      
      <div className="flex items-center gap-6 relative z-10">
        <motion.div 
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Circle size={8} className="text-green-400 fill-green-400" />
          </motion.div>
          <span className="text-slate-300 font-medium">System Status</span>
          <span className="text-green-400 font-semibold">Online</span>
        </motion.div>
        
        <div className="h-4 w-px bg-slate-700/50" />
        
        <span className="text-slate-500">v1.0.0 • Powered by AI</span>
      </div>
      
      <div className="flex items-center gap-6 relative z-10">
        <motion.div 
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Activity size={12} className="text-green-400" />
          </motion.div>
          <span className="text-slate-300">Agents Active</span>
        </motion.div>
        
        <motion.div 
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
        >
          <Cpu size={12} className="text-blue-400" />
          <span className="text-slate-300">CPU: <span className="text-blue-400 font-semibold">23%</span></span>
        </motion.div>
        
        <motion.div 
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
        >
          <Database size={12} className="text-purple-400" />
          <span className="text-slate-300"><span className="text-purple-400 font-semibold">2.4k</span> memories</span>
        </motion.div>

        <div className="h-4 w-px bg-slate-700/50" />
        
        <motion.div 
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
        >
          <Wifi size={12} className="text-green-400" />
          <span className="text-slate-300">Memory Sync</span>
        </motion.div>
      </div>
    </header>
  );
}
