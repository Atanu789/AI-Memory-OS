import { Link } from 'react-router-dom';
import { Network, Clock, Github, ArrowRight } from 'lucide-react';
import { GlowingCard } from '../ui/glowing-card';

const quickLinks = [
  { to: '/mindmap', icon: Network, label: 'Mind Map', description: 'Visualize memory graph' },
  { to: '/timeline', icon: Clock, label: 'Timeline', description: 'View memory evolution' },
  { to: '/github', icon: Github, label: 'GitHub', description: 'Code intelligence' },
];

export default function QuickAccessPanel() {
  return (
    <GlowingCard className="p-6" glowColor="orange">
      <h3 className="text-sm font-medium text-slate-300 mb-4">Quick Access</h3>
      
      <div className="space-y-2">
        {quickLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="flex items-center justify-between p-3 bg-bg-elevated hover:bg-bg-primary border border-border-default hover:border-border-hover rounded transition-colors group"
          >
            <div className="flex items-center gap-3">
              <link.icon size={18} className="text-text-secondary group-hover:text-accent-blue transition-colors" />
              <div>
                <div className="text-sm text-text-primary">{link.label}</div>
                <div className="text-xs text-text-muted">{link.description}</div>
              </div>
            </div>
            <ArrowRight size={16} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
          </Link>
        ))}
      </div>
    </GlowingCard>
  );
}
