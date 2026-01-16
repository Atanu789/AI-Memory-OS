import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { Insight } from '../../types/electron.d';
import { motion } from 'framer-motion';
import { GlowingCard } from '../ui/glowing-card';

interface Props {
  insight: Insight;
}

const iconMap = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  positive: CheckCircle,
};

const colorMap = {
  critical: { border: 'border-red-500/50', bg: 'bg-red-500/10', text: 'text-red-400', glow: 'shadow-red-500/20' },
  warning: { border: 'border-yellow-500/50', bg: 'bg-yellow-500/10', text: 'text-yellow-400', glow: 'shadow-yellow-500/20' },
  info: { border: 'border-blue-500/50', bg: 'bg-blue-500/10', text: 'text-blue-400', glow: 'shadow-blue-500/20' },
  positive: { border: 'border-green-500/50', bg: 'bg-green-500/10', text: 'text-green-400', glow: 'shadow-green-500/20' },
};

export default function InsightCard({ insight }: Props) {
  const Icon = iconMap[insight.type];
  const colors = colorMap[insight.type];

  const timeAgo = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };

  const glowColor = insight.type === 'critical' ? 'pink' : insight.type === 'warning' ? 'yellow' : insight.type === 'positive' ? 'green' : 'blue';

  return (
    <GlowingCard className="p-5 cursor-pointer border-l-4" glowColor={glowColor as any}>
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${colors.border}`} />
      {/* Animated gradient background on hover */}
      <div className={`absolute inset-0 ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />
      
      <div className="flex items-start gap-4 relative z-10">
        <motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
          className={`p-2 rounded-lg ${colors.bg} border ${colors.border} flex-shrink-0`}
        >
          <Icon size={20} className={colors.text} />
        </motion.div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-slate-200 mb-2">{insight.title}</h4>
          <p className="text-xs text-slate-400 mb-3 line-clamp-2 leading-relaxed">{insight.description}</p>
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">{timeAgo(insight.timestamp)}</div>
            {!insight.isRead && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`w-2 h-2 rounded-full ${colors.text.replace('text-', 'bg-')}`}
              />
            )}
          </div>
        </div>
      </div>
    </GlowingCard>
  );
}
