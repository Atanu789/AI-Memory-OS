import { Clock, Zap } from 'lucide-react';
import { DashboardSummary } from '../../types/electron.d';

interface Props {
  summary: DashboardSummary;
}

export default function FocusSummaryCard({ summary }: Props) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="bg-bg-secondary border border-border-default rounded-lg p-6">
      <h3 className="text-sm font-medium text-text-secondary mb-4">Focus Summary</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-accent-blue" />
            <span className="text-sm text-text-secondary">Active Time</span>
          </div>
          <span className="text-2xl font-semibold">{formatTime(summary.focusTime)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-accent-green" />
            <span className="text-sm text-text-secondary">Deep Work</span>
          </div>
          <span className="text-2xl font-semibold">{summary.deepWorkPercentage}%</span>
        </div>

        {/* Progress Bar */}
        <div className="pt-2">
          <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent-green rounded-full transition-all"
              style={{ width: `${summary.deepWorkPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
