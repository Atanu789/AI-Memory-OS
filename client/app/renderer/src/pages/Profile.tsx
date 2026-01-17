import { motion } from 'framer-motion';
import { User, Github, Mail, LogOut, ExternalLink } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AppBackground } from '../components/ui/app-background';

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="relative min-h-full overflow-hidden">
      <AppBackground />
      
      <div className="relative z-10 p-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <User className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Profile
            </h1>
          </div>
          <p className="text-slate-400 text-lg">Manage your account and preferences</p>
        </motion.div>

        <div className="space-y-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
            
            <div className="relative p-8">
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="w-24 h-24 rounded-2xl border-2 border-white/20 shadow-xl"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-xl">
                      <User className="w-12 h-12 text-white" />
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-slate-900 flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                  </div>
                </motion.div>

                {/* Info */}
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-slate-50 mb-1">{user.displayName}</h2>
                  <p className="text-slate-400 mb-4">@{user.username}</p>
                  
                  <div className="flex flex-wrap gap-3">
                    {user.email && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                        <Mail className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-slate-300">{user.email}</span>
                      </div>
                    )}
                    
                    {user.profileUrl && (
                      <a
                        href={user.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors group"
                      >
                        <Github className="w-4 h-4 text-slate-300" />
                        <span className="text-sm text-slate-300">View on GitHub</span>
                        <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-slate-300 transition-colors" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Account Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 pointer-events-none" />
            
            <div className="relative p-6">
              <h3 className="text-xl font-bold text-slate-50 mb-4 flex items-center gap-2">
                <Github className="w-5 h-5 text-purple-400" />
                GitHub Account
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-white/5">
                  <span className="text-slate-400">GitHub ID</span>
                  <span className="text-slate-200 font-mono">{user.githubId}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-white/5">
                  <span className="text-slate-400">Username</span>
                  <span className="text-slate-200">@{user.username}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-slate-400">Display Name</span>
                  <span className="text-slate-200">{user.displayName}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <button
              onClick={logout}
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-red-600 to-pink-600 p-[2px] transition-all duration-300 hover:shadow-lg hover:shadow-red-500/50"
            >
              <div className="relative flex items-center justify-center gap-3 rounded-[10px] bg-slate-900 px-6 py-4 transition-all duration-300 group-hover:bg-transparent">
                <LogOut className="w-5 h-5 text-red-400 group-hover:text-white transition-colors" />
                <span className="font-semibold text-red-400 group-hover:text-white transition-colors">
                  Logout
                </span>
              </div>
            </button>

            <div className="text-center text-xs text-slate-500 pt-4">
              <p>Logged in via GitHub OAuth</p>
              <p className="mt-1">Your session is secure and encrypted</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
