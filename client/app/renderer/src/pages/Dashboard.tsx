import { useEffect, useState } from 'react';
import { DashboardSummary, Insight } from '../types/electron.d';
import { Highlight } from '../components/ui/hero-highlight';
import { AppBackground } from '../components/ui/app-background';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Brain,
  ArrowRight
} from 'lucide-react';

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
      <div className="relative min-h-full overflow-hidden">
        <AppBackground />
        <div className="relative z-10 flex items-center justify-center h-full">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-slate-400 flex items-center gap-2"
          >
            <Brain className="w-5 h-5 animate-pulse" />
            Loading...
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-full overflow-hidden">
      <AppBackground />
      
      <div className="relative z-10 flex flex-col h-full overflow-y-auto pb-32 p-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-6"
          >
            <Activity className="w-16 h-16 text-blue-400 drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
          </motion.div>
          
          <h1 className="text-5xl font-bold mb-4">
            <Highlight className="text-slate-100">
              Dashboard
            </Highlight>
          </h1>
          
          <p className="text-slate-400 text-lg">
            Your day at a glance
          </p>
        </motion.div>

        {/* Stats Grid - Minimal */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-3xl mx-auto w-full mb-16"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Focus', value: summary!.focusTime, unit: 'm', color: 'blue' },
              { label: 'Deep Work', value: summary!.deepWorkPercentage, unit: '%', color: 'purple' },
              { label: 'Switches', value: summary!.contextSwitches, unit: '', color: 'cyan' },
              { label: 'Active', value: summary!.activeTime, unit: 'm', color: 'pink' },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
                className="text-center"
              >
                <p className="text-sm text-slate-500 mb-2">{stat.label}</p>
                <p className="text-4xl font-bold text-slate-200">
                  {stat.value}
                  <span className="text-lg text-slate-500">{stat.unit}</span>
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Insights - Minimal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-3xl mx-auto w-full"
        >
          <h2 className="text-sm uppercase tracking-wider text-slate-500 font-semibold mb-6 text-center">
            Recent Activity
          </h2>
          
          <div className="space-y-3">
            {insights.map((insight, idx) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + idx * 0.05 }}
                className="group"
              >
                <div className="relative p-5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-2xl hover:border-white/20 hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-base font-medium text-slate-200 truncate">
                          {insight.title}
                        </h3>
                        {!insight.isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-slate-400 line-clamp-2">{insight.description}</p>
                      <p className="text-xs text-slate-600 mt-2">
                        {insight.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
