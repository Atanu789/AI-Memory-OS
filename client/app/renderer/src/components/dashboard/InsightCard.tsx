import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { Insight } from '../../types/electron.d';

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
  critical: 'border-accent-red text-accent-red',
  warning: 'border-accent-yellow text-accent-yellow',
  info: 'border-accent-blue text-accent-blue',
  positive: 'border-accent-green text-accent-green',
};

export default function InsightCard({ insight }: Props) {
  const Icon = iconMap[insight.type];
  const colorClass = colorMap[insight.type];

  const timeAgo = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };

  return (
    <div className={`bg-bg-secondary border-l-4 ${colorClass} border-r border-t border-b border-border-default rounded-lg p-4 hover:bg-bg-elevated transition-colors cursor-pointer`}>
      <div className="flex items-start gap-3">
        <Icon size={20} className="flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-text-primary mb-1">{insight.title}</h4>
          <p className="text-xs text-text-secondary mb-2 line-clamp-2">{insight.description}</p>
          <div className="text-xs text-text-muted">{timeAgo(insight.timestamp)}</div>
        </div>
      </div>
    </div>
  );
}
