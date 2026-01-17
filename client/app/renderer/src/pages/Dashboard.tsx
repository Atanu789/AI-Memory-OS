import { useEffect, useState } from 'react';
import { Highlight } from '../components/ui/hero-highlight';
import { AppBackground } from '../components/ui/app-background';
import { Card } from '../components/ui/card-hover-effect';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Brain,
  ArrowRight,
  GitBranch,
  Code2,
  TrendingUp,
  AlertCircle,
  Calendar,
  Network
} from 'lucide-react';
import apiService, { DashboardData } from '../services/api.service';

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [graphCounts, setGraphCounts] = useState<{ nodes: number; edges: number } | null>(null);

  useEffect(() => {
    loadDashboardData();
    
    // Refresh every 5 minutes
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardData = await apiService.getDashboardData();
      setData(dashboardData);

      // Mind Map preview counts
      try {
        const g = await apiService.getGraph({ focus: 'last_30_days', depth: 2, minImportance: 0.3 });
        setGraphCounts({ nodes: (g?.nodes?.length ?? 0), edges: (g?.edges?.length ?? 0) });
      } catch {
        setGraphCounts(null);
      }
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      setError(error.response?.data?.message || 'Failed to load dashboard data. Please check API configuration.');
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
            Loading GitHub data...
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-full overflow-hidden">
        <AppBackground />
        <div className="relative z-10 flex items-center justify-center h-full p-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-200 mb-2">Configuration Required</h2>
            <p className="text-slate-400 mb-4">{error}</p>
            <p className="text-sm text-slate-500">
              Please add <code className="px-2 py-1 bg-white/10 rounded">GEMINI_API_KEY</code> and{' '}
              <code className="px-2 py-1 bg-white/10 rounded">GITHUB_TOKEN</code> to your .env file
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const topLanguages = Object.entries(data.topLanguages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Derived metrics for requested sections
  const todayKey = new Date().toISOString().slice(0,10);
  const activitiesByDay: Record<string, number> = {};
  data?.recentActivity.forEach(a => {
    const k = new Date(a.created_at).toISOString().slice(0,10);
    activitiesByDay[k] = (activitiesByDay[k] || 0) + 1;
  });
  const todaysEvents = activitiesByDay[todayKey] || 0;
  const last30DaysKeys = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i);
    return d.toISOString().slice(0,10);
  });
  const activeDaysLast30 = last30DaysKeys.filter(k => (activitiesByDay[k] || 0) > 0).length;
  const avgPerDayLast30 = (last30DaysKeys.reduce((sum, k) => sum + (activitiesByDay[k] || 0), 0) / 30).toFixed(1);

  // Contribution calendar (last 10 weeks)
  const weeks = 10;
  const calendar: { date: string; count: number }[] = [];
  for (let i = weeks * 7 - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const k = d.toISOString().slice(0,10);
    calendar.push({ date: k, count: activitiesByDay[k] || 0 });
  }

  return (
    <div className="relative min-h-full overflow-hidden">
      <AppBackground />
      
      <div className="relative z-10 flex flex-col h-full overflow-y-auto pb-32 p-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto mb-12"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-6"
          >
            <TrendingUp className="w-20 h-20 text-blue-400 drop-shadow-[0_0_24px_rgba(59,130,246,0.6)]" />
          </motion.div>
          
          <h1 className="text-5xl font-bold mb-4">
            <Highlight className="text-slate-100">
              Welcome back, {data.user.name}
            </Highlight>
          </h1>
          
          <p className="text-slate-400 text-lg">
            {data.activitySummary || 'Your GitHub activity at a glance'}
          </p>
        </motion.div>

        {/* Today’s Focus + Productivity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-6xl mx-auto w-full mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <Card className="aspect-square max-w-[300px] mx-auto flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-8 h-8 text-purple-400" />
                  <h3 className="text-3xl font-semibold text-slate-200">Today’s Focus</h3>
              </div>
                <p className="text-slate-300 text-base">{data.activitySummary || 'Stay consistent and ship small improvements.'}</p>
              <div className="mt-4 flex items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1"><Activity className="w-4 h-4" />{todaysEvents} events today</span>
                <span className="flex items-center gap-1"><GitBranch className="w-4 h-4" />{data.stats.totalRepos} repos</span>
              </div>
              </Card>
            </div>
            <div className="group">
              <Card className="aspect-square max-w-[300px] mx-auto flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-8 h-8 text-blue-400" />
                  <h3 className="text-3xl font-semibold text-slate-200">Productivity</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Commits</p>
                  <p className="text-4xl font-bold text-slate-200">{data.stats.totalCommits}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Active days (30d)</p>
                  <p className="text-4xl font-bold text-slate-200">{activeDaysLast30}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Avg events/day</p>
                  <p className="text-4xl font-bold text-slate-200">{avgPerDayLast30}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Stars</p>
                  <p className="text-4xl font-bold text-slate-200">{data.stats.totalStars}</p>
                </div>
              </div>
              </Card>
            </div>
          </div>
        </motion.div>

        <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-8">
          {/* Top Languages */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="group"><Card className="aspect-square max-w-[300px] mx-auto flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <Code2 className="w-8 h-8 text-blue-400" />
                <h2 className="text-3xl font-semibold text-slate-200">Top Languages</h2>
              </div>
              <div className="space-y-4 flex-1 min-h-0 overflow-y-auto">
              {topLanguages.map(([language, count], idx) => {
                const total = Object.values(data.topLanguages).reduce((a, b) => a + b, 0);
                const percentage = ((count / total) * 100).toFixed(1);
                const colors = ['blue', 'green', 'purple', 'orange', 'pink'];
                const color = colors[idx % colors.length];
                
                return (
                  <motion.div
                    key={language}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + idx * 0.05 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300 font-medium">{language}</span>
                      <span className="text-slate-500">{percentage}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: 0.5 + idx * 0.05, duration: 0.8 }}
                        className={`h-full bg-gradient-to-r from-${color}-500 to-${color}-600`}
                      />
                    </div>
                  </motion.div>
                );
              })}
              </div>
            </Card></div>
          </motion.div>

          {/* Recent Insights */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="group"><Card className="aspect-square max-w-[300px] mx-auto flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="w-8 h-8 text-green-400" />
                <h2 className="text-3xl font-semibold text-slate-200">Recent Insights</h2>
              </div>
              <div className="space-y-3 flex-1 min-h-0 overflow-y-auto">
              {(data.insights || []).slice(0, 6).map((text, idx) => (
                <motion.div
                  key={`${text}-${idx}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.03 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                >
                    <p className="text-base text-slate-200">{text}</p>
                </motion.div>
              ))}
              {(!data.insights || data.insights.length === 0) && (
                  <div className="text-base text-slate-500">No insights generated yet.</div>
              )}
              </div>
            </Card></div>
          </motion.div>
        </div>

        {/* GitHub Summary + Mind Map Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-6xl mx-auto w-full mt-8 grid md:grid-cols-2 gap-8"
        >
          <div className="group"><Card className="aspect-square max-w-[300px] mx-auto flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <GitBranch className="w-8 h-8 text-blue-400" />
              <h2 className="text-3xl font-semibold text-slate-200">GitHub Summary</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-slate-500">Repositories</p><p className="text-3xl font-bold text-slate-200">{data.stats.totalRepos}</p></div>
              <div><p className="text-xs text-slate-500">Commits</p><p className="text-3xl font-bold text-slate-200">{data.stats.totalCommits}</p></div>
              <div><p className="text-xs text-slate-500">Stars</p><p className="text-3xl font-bold text-slate-200">{data.stats.totalStars}</p></div>
              <div><p className="text-xs text-slate-500">Forks</p><p className="text-3xl font-bold text-slate-200">{data.stats.totalForks}</p></div>
            </div>
          </Card></div>
          <div className="group"><Card className="aspect-square max-w-[300px] mx-auto flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <Network className="w-8 h-8 text-purple-400" />
              <h2 className="text-3xl font-semibold text-slate-200">Mind Map Preview</h2>
            </div>
            <p className="text-base text-slate-300">{graphCounts ? `${graphCounts.nodes} memories • ${graphCounts.edges} connections` : 'Sync to view your knowledge graph.'}</p>
            <button
              onClick={() => (window.location.href = '/mindmap')}
              className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-100 hover:bg-purple-500/30"
            >
              Open Mind Map <ArrowRight className="w-4 h-4" />
            </button>
          </Card></div>
        </motion.div>

        {/* Memory Health + Contribution Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-6xl mx-auto w-full mt-8 grid md:grid-cols-2 gap-8"
        >
          <div className="group"><Card className="aspect-square max-w-[300px] mx-auto flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-8 h-8 text-pink-400" />
              <h2 className="text-3xl font-semibold text-slate-200">Memory Health</h2>
            </div>
            <p className="text-base text-slate-300">Active days last 30: <span className="text-slate-100 font-semibold">{activeDaysLast30}</span></p>
            <p className="text-base text-slate-300">Average events/day: <span className="text-slate-100 font-semibold">{avgPerDayLast30}</span></p>
            <p className="text-xs text-slate-500 mt-2">Keep engaging to maintain a healthy memory graph.</p>
          </Card></div>
          <div className="group"><Card className="aspect-square max-w-[300px] mx-auto flex flex-col">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-8 h-8 text-green-400" />
              <h2 className="text-3xl font-semibold text-slate-200">Contribution Calendar</h2>
            </div>
            <div className="grid grid-cols-10 gap-1 flex-1 min-h-0 overflow-y-auto">
              {calendar.map((d, idx) => {
                const c = d.count;
                const bg = c === 0 ? 'bg-slate-800/40' : c < 2 ? 'bg-green-500/20' : c < 5 ? 'bg-green-500/40' : 'bg-green-500/60';
                return <div key={idx} className={`w-3 h-3 rounded ${bg} border border-white/10`} title={`${d.date}: ${c} events`} />;
              })}
            </div>
          </Card></div>
        </motion.div>
      </div>
    </div>
  );
}
