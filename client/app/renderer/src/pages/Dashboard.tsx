import { useEffect, useState } from 'react';
import { DashboardSummary, Insight } from '../types/electron.d';
import FocusSummaryCard from '../components/dashboard/FocusSummaryCard';
import MiniTimeline from '../components/dashboard/MiniTimeline';
import InsightCard from '../components/dashboard/InsightCard';
import ActivitySparkline from '../components/dashboard/ActivitySparkline';
import QuickAccessPanel from '../components/dashboard/QuickAccessPanel';

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    
    // Refresh every 5 minutes
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Mock data for now - will be replaced with actual IPC calls
      setSummary({
        focusTime: 204,
        deepWorkPercentage: 72,
        contextSwitches: 4,
        activeTime: 284,
      });
      
      setInsights([
        {
          id: '1',
          type: 'critical',
          title: 'Pattern Detected',
          description: 'You\'ve refactored the authentication module 3 times this week',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          memoryReferences: [],
          isRead: false,
        },
        {
          id: '2',
          type: 'warning',
          title: 'Context Switch Spike',
          description: 'High context switching detected between 2-4 PM',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          memoryReferences: [],
          isRead: false,
        },
        {
          id: '3',
          type: 'info',
          title: 'Discovery Made',
          description: 'You discovered a new pattern for state management',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          memoryReferences: [],
          isRead: true,
        },
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Top Bar with Time Selector */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <select className="px-3 py-1.5 bg-bg-elevated border border-border-default rounded text-sm">
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
          </select>
        </div>
      </div>

      {/* Top Row: Focus + Timeline */}
      <div className="grid grid-cols-2 gap-4">
        <FocusSummaryCard summary={summary!} />
        <MiniTimeline contextSwitches={summary!.contextSwitches} />
      </div>

      {/* Recent Insights */}
      <div>
        <h2 className="text-lg font-medium mb-3">Recent Insights</h2>
        <div className="grid grid-cols-3 gap-4">
          {insights.slice(0, 3).map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      </div>

      {/* Bottom Row: GitHub + Quick Access */}
      <div className="grid grid-cols-2 gap-4">
        <ActivitySparkline />
        <QuickAccessPanel />
      </div>
    </div>
  );
}
