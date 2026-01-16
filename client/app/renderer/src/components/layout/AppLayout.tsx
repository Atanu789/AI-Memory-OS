import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FloatingDock } from '../ui/floating-dock';
import { LayoutDashboard, Clock, Network, Brain, Settings as SettingsIcon } from 'lucide-react';

export default function AppLayout() {
  const dockItems = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/" },
    { title: "Timeline", icon: Clock, path: "/timeline" },
    { title: "Mind Map", icon: Network, path: "/mindmap" },
    { title: "Ask Brain", icon: Brain, path: "/ask" },
    { title: "Settings", icon: SettingsIcon, path: "/settings" },
  ];

  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 overflow-hidden relative">
      {/* Animated background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-900/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Sidebar Navigation */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Page Content */}
        <main className="flex-1 overflow-auto pb-24">
          <Outlet />
        </main>
      </div>

      {/* Floating Dock */}
      <FloatingDock items={dockItems} />
    </div>
  );
}
