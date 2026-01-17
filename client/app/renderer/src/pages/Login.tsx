import { motion } from 'framer-motion';
import { Github, Sparkles, Shield, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AppBackground } from '../components/ui/app-background';

export default function Login() {
  const { login } = useAuth();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      <AppBackground />
      
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Glowing card effect */}
          <div className="absolute inset-0 -z-10 blur-3xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-pulse" />
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 p-8 shadow-2xl backdrop-blur-2xl">
            {/* Animated gradient border */}
            <motion.div
              className="absolute inset-0 rounded-3xl"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent)',
              }}
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            {/* Content */}
            <div className="relative space-y-6">
              {/* Logo & Title */}
              <div className="text-center space-y-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg"
                >
                  <Sparkles className="w-10 h-10 text-white" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                >
                  AI Memory OS
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-slate-400"
                >
                  Your intelligent knowledge companion
                </motion.p>
              </div>

              {/* Features */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-3"
              >
                {[
                  { icon: Shield, text: 'Secure GitHub Authentication' },
                  { icon: Zap, text: 'Real-time Sync & Intelligence' },
                  { icon: Sparkles, text: 'AI-Powered Insights' },
                ].map((feature, index) => (
                  <motion.div
                    key={feature.text}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center gap-3 text-sm text-slate-300"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10">
                      <feature.icon className="w-4 h-4 text-blue-400" />
                    </div>
                    <span>{feature.text}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Login Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={login}
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 p-[2px] transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50"
              >
                <div className="relative flex items-center justify-center gap-3 rounded-[10px] bg-slate-900 px-6 py-4 transition-all duration-300 group-hover:bg-transparent">
                  <Github className="w-5 h-5 text-white" />
                  <span className="font-semibold text-white">
                    Continue with GitHub
                  </span>
                </div>
              </motion.button>

              {/* Footer */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center text-xs text-slate-500"
              >
                By continuing, you agree to our Terms of Service
              </motion.p>
            </div>
          </div>

          {/* Floating particles effect */}
          <div className="absolute -z-20 inset-0">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-blue-400/30"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
