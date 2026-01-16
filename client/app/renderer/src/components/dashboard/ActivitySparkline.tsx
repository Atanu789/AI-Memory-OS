import { Github, TrendingUp } from 'lucide-react';
import { GlowingCard } from '../ui/glowing-card';

export default function ActivitySparkline() {
  return (
    <GlowingCard className="p-6" glowColor="green">
      <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
        <Github size={16} />
        GitHub Activity
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">Commits Today</span>
          <span className="text-2xl font-semibold">12</span>
        </div>

        {/* Simple bar chart */}
        <div className="flex items-end gap-1 h-16">
          {[4, 7, 3, 9, 12, 8, 11].map((height, i) => (
            <div
              key={i}
              className="flex-1 bg-accent-green rounded-t transition-all hover:bg-accent-blue"
              style={{ height: `${(height / 12) * 100}%` }}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-green-400">
          <TrendingUp size={12} />
          <span>+20% from last week</span>
        </div>
      </div>
    </GlowingCard>
  );
}
