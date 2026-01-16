import { Clock, Zap, TrendingUp } from 'lucide-react';
import { DashboardSummary } from '../../types/electron.d';
import { GlowingCard } from '../ui/glowing-card';
import { motion } from 'framer-motion';

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
    <GlowingCard className="p-6" glowColor="blue">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Focus Summary</h3>
        <TrendingUp className="w-5 h-5 text-green-400" />
      </div>
      
      <div className="space-y-6">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <Clock size={20} className="text-blue-400" />
            </div>
            <span className="text-sm text-slate-300">Active Time</span>
          </div>
          <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            {formatTime(summary.focusTime)}
          </span>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/30">
              <Zap size={20} className="text-green-400" />
            </div>
            <span className="text-sm text-slate-300">Deep Work</span>
          </div>
          <span className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            {summary.deepWorkPercentage}%
          </span>
        </motion.div>

        {/* Progress Bar */}
        <div className="pt-2">
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${summary.deepWorkPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg shadow-green-500/50"
            />
          </div>
        </div>
      </div>
    </GlowingCard>
  );
}
