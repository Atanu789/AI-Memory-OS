import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { checkAuth, user } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      // Wait a bit for session to be established
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check authentication status
      await checkAuth();
      
      // Navigate to dashboard after successful auth
      setTimeout(() => {
        if (user) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      }, 1000);
    };

    handleCallback();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 360]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "linear"
          }}
          className="mb-6"
        >
          <Brain className="w-16 h-16 text-purple-400 mx-auto drop-shadow-[0_0_30px_rgba(192,132,252,0.6)]" />
        </motion.div>
        <h2 className="text-2xl font-bold text-slate-200 mb-2">Authenticating...</h2>
        <p className="text-slate-400">Please wait while we complete your login</p>
      </motion.div>
    </div>
  );
}
