import { Activity } from 'lucide-react';

export default function StatusBar() {
  return (
    <footer className="h-6 bg-bg-secondary border-t border-border-default flex items-center justify-between px-4 text-xs text-text-muted">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Activity size={12} className="text-accent-green" />
          <span>Agents Active</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <span>Memory Sync: ✓</span>
      </div>
    </footer>
  );
}
