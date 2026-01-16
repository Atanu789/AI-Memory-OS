import { GitBranch } from 'lucide-react';

interface Props {
  contextSwitches: number;
}

export default function MiniTimeline({ contextSwitches }: Props) {
  return (
    <div className="bg-bg-secondary border border-border-default rounded-lg p-6">
      <h3 className="text-sm font-medium text-text-secondary mb-4">Today's Timeline</h3>
      
      <div className="space-y-3">
        {/* Timeline entries */}
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 bg-accent-blue rounded-full mt-1.5" />
          <div className="flex-1">
            <div className="text-sm text-text-primary">Decision Made</div>
            <div className="text-xs text-text-muted">3:24 PM</div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-2 h-2 bg-accent-purple rounded-full mt-1.5" />
          <div className="flex-1">
            <div className="text-sm text-text-primary">Insight Generated</div>
            <div className="text-xs text-text-muted">2:15 PM</div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-2 h-2 bg-accent-yellow rounded-full mt-1.5" />
          <div className="flex-1">
            <div className="text-sm text-text-primary">Context Switch</div>
            <div className="text-xs text-text-muted">1:30 PM</div>
          </div>
        </div>

        {/* Context switches count */}
        <div className="pt-3 mt-3 border-t border-border-default flex items-center gap-2 text-sm text-text-secondary">
          <GitBranch size={14} />
          <span>{contextSwitches} context switches today</span>
        </div>
      </div>
    </div>
  );
}
