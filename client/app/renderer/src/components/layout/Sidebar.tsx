import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Network, 
  Clock, 
  Github, 
  Lightbulb, 
  MessageSquare, 
  Settings 
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/mindmap', icon: Network, label: 'Mind Map' },
  { to: '/timeline', icon: Clock, label: 'Timeline' },
  { to: '/github', icon: Github, label: 'GitHub' },
  { to: '/insights', icon: Lightbulb, label: 'Insights' },
  { to: '/ask', icon: MessageSquare, label: 'Ask Brain' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  return (
    <aside className="w-60 bg-bg-secondary border-r border-border-default flex flex-col">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-border-default">
        <h1 className="text-lg font-semibold">AI Memory OS</h1>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                isActive
                  ? 'bg-bg-elevated text-accent-blue border-r-2 border-accent-blue'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
              }`
            }
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      {/* Version Info */}
      <div className="p-4 text-xs text-text-muted border-t border-border-default">
        v1.0.0
      </div>
    </aside>
  );
}
