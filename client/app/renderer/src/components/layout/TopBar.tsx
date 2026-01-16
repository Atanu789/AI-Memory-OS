import { Search } from 'lucide-react';

export default function TopBar() {
  return (
    <header className="h-12 bg-bg-secondary border-b border-border-default flex items-center justify-between px-4">
      {/* Breadcrumbs / Title */}
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        {/* Could be dynamic based on current route */}
      </div>
      
      {/* Search */}
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 px-3 py-1.5 bg-bg-elevated border border-border-default rounded text-sm text-text-muted hover:border-border-hover transition-colors">
          <Search size={14} />
          <span>Search</span>
          <kbd className="ml-2 text-xs">⌘K</kbd>
        </button>
      </div>
    </header>
  );
}
