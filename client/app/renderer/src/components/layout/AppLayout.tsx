import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FloatingDock } from '../ui/floating-dock';
import { LayoutDashboard, Clock, Network, Brain, Settings as SettingsIcon, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const dockItems = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/" },
    { title: "Timeline", icon: Clock, path: "/timeline" },
    { title: "Mind Map", icon: Network, path: "/mindmap" },
    { title: "Ask Brain", icon: Brain, path: "/ask" },
    { title: "Profile", icon: User, path: "/profile" },
    { title: "Settings", icon: SettingsIcon, path: "/settings" },
  ];

  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 overflow-hidden relative">
      {/* Animated background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-900/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Sidebar Navigation */}
      <Sidebar 
        collapsed={sidebarCollapsed}
        open={sidebarOpen}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Backdrop for mobile when sidebar is open */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          />
        )}
      </AnimatePresence>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Page Content */}
        <main className="flex-1 overflow-auto pb-24">
          <Outlet />
        </main>
      </div>

      {/* Open sidebar button when closed */}
      <AnimatePresence>
        {!sidebarOpen && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={() => setSidebarOpen(true)}
            className="fixed left-4 bottom-4 z-30 rounded-full px-4 py-2 bg-white/10 border border-white/20 backdrop-blur-xl text-slate-100 shadow-lg hover:bg-white/15 transition-colors"
          >
            Open Sidebar
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating Dock */}
      <FloatingDock items={dockItems} />
    </div>
  );
}
