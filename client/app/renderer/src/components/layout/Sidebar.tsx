import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Network, 
  Clock, 
  MessageSquare, 
  Settings,
  Brain,
  Zap,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', gradient: 'from-blue-500 to-cyan-500' },
  { to: '/mindmap', icon: Network, label: 'Mind Map', gradient: 'from-purple-500 to-pink-500' },
  { to: '/timeline', icon: Clock, label: 'Timeline', gradient: 'from-orange-500 to-yellow-500' },
  { to: '/ask', icon: Brain, label: 'Ask Brain', gradient: 'from-green-500 to-emerald-500' },
  { to: '/settings', icon: Settings, label: 'Settings', gradient: 'from-slate-500 to-slate-600' },
];

export default function Sidebar() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <aside className="w-64 bg-slate-900/30 backdrop-blur-2xl border-r border-white/10 flex flex-col relative overflow-visible">
    
      
      {/* Outer glow effect */}
      <div className="absolute top-0 -right-[1px] w-[2px] h-full">
        <motion.div
          animate={{ 
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500 to-transparent blur-sm"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/50 to-transparent" />
      </div>
      
      {/* Extended outer glow */}
      <motion.div
        animate={{ 
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-0 -right-2 w-8 h-full bg-gradient-to-l from-blue-500/20 via-blue-500/5 to-transparent blur-xl pointer-events-none"
      />
      
      {/* Logo Section */}
      <div className="h-16 flex items-center px-5 relative z-10">
        <motion.div 
          className="flex items-center gap-3 w-full group cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="relative">
            <motion.div
              animate={{ 
                rotate: [0, 360],
              }}
              transition={{ 
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              }}
              className="w-10 h-10 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center"
            >
              <Brain className="w-5 h-5 text-blue-400" />
            </motion.div>
          </div>
          <div className="flex-1">
            <h1 className="text-base font-bold text-slate-200">
              AI Memory OS
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">Intelligent Knowledge Graph</p>
          </div>
        </motion.div>
      </div>
      
      {/* Navigation Section */}
      <nav className="flex-1 py-6 px-3 relative z-10 space-y-1">
        {navItems.map((item, idx) => (
          <NavLink
            key={item.to}
            to={item.to}
            onMouseEnter={() => setHoveredItem(item.to)}
            onMouseLeave={() => setHoveredItem(null)}
            className="block"
          >
            {({ isActive }) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative"
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 -mt-0.5 w-2 h-8 rounded-r-full bg-blue-500/80"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                <div className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group
                  ${isActive 
                    ? 'bg-slate-800/50 border border-slate-700/50' 
                    : 'hover:bg-slate-800/30 border border-transparent hover:border-slate-700/30'
                  }
                `}>
                  {/* Icon */}
                  <div className={`
                    relative p-2 rounded-lg transition-all duration-300
                    ${isActive 
                      ? 'bg-slate-700/50 border border-slate-600/50' 
                      : 'bg-slate-800/50 group-hover:bg-slate-700/50'
                    }
                  `}>
                    <item.icon 
                      className={`w-4 h-4 relative z-10 transition-colors ${
                        isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                  </div>
                  
                  {/* Label */}
                  <span className={`
                    text-sm font-medium flex-1 transition-colors relative z-10
                    ${isActive 
                      ? 'text-slate-50' 
                      : 'text-slate-400 group-hover:text-slate-200'
                    }
                  `}>
                    {item.label}
                  </span>
                  
                  
                  {/* Arrow indicator */}
                  <AnimatePresence>
                    {(isActive || hoveredItem === item.to) && (
                      <motion.div
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className={`
                          w-7 h-7 transition-colors
                          ${isActive ? 'text-blue-400' : 'text-slate-500'}
                        `} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                </div>
                
              </motion.div>
              
            )}
            
          </NavLink>
          
        ))}
        
      </nav>
      
      
      
    </aside>
  );
}