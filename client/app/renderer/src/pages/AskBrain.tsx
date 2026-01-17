import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, Brain, Loader2, User } from 'lucide-react';
import { Highlight } from '../components/ui/hero-highlight';
import { AppBackground } from '../components/ui/app-background';
import apiService from '../services/api.service';
import { useAuth } from '../hooks/useAuth';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AskBrain() {
  const { user, loading: authLoading, login } = useAuth();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [serviceUnavailable, setServiceUnavailable] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!query.trim() || loading) return;

    // If not authenticated, prompt login
    if (!authLoading && !user) {
      setNeedsAuth(true);
    }

    const userMessage: Message = {
      role: 'user',
      content: query,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      const response = await apiService.chat(query);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date(response.timestamp),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setServiceUnavailable(null);
    } catch (error: any) {
      const status = error?.response?.status;
      const serverMsg = error?.response?.data?.message;

      if (status === 401) {
        setNeedsAuth(true);
        const m: Message = {
          role: 'assistant',
          content: 'Please sign in to use Ask Brain. Click Login below.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, m]);
      } else if (status === 503) {
        setServiceUnavailable(serverMsg || 'AI service is not configured. Please add GEMINI_API_KEY in the server .env.');
        const m: Message = {
          role: 'assistant',
          content: 'AI service is currently unavailable. Try again later.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, m]);
      } else {
        const errorMessage: Message = {
          role: 'assistant',
          content: serverMsg || 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    inputRef.current?.focus();
  };

  const suggestions = [
    "What are my most active repositories?",
    "Analyze my coding patterns this week",
    "What languages do I use most?",
    "Show me my recent contributions",
    "What should I focus on next?",
  ];

  return (
    <div className="relative h-full overflow-hidden">
      <AppBackground />
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Auth banner */}
        {!authLoading && !user && (
          <div className="bg-white/5 border border-white/10 text-slate-200 text-sm px-4 py-3 mx-6 mt-4 rounded-lg flex items-center justify-between">
            <span>You're not signed in. Please log in to use Ask Brain.</span>
            <button
              onClick={login}
              className="px-3 py-1.5 rounded-md bg-purple-500/30 border border-purple-500/40 text-purple-100 hover:bg-purple-500/40"
            >Login</button>
          </div>
        )}
        {/* Header - Only show when no messages */}
        {messages.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto pt-20 pb-12 px-6"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="inline-block mb-6"
            >
              <Brain className="w-20 h-20 text-purple-400 drop-shadow-[0_0_30px_rgba(192,132,252,0.6)]" />
            </motion.div>
            
            <h1 className="text-6xl font-bold mb-4">
              <Highlight className="text-slate-100">
                Ask Your Brain
              </Highlight>
            </h1>
            
            <p className="text-slate-400 text-lg mb-8">
              Query your GitHub data with natural language powered by Gemini AI
            </p>

            {/* Suggestions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto"
            >
              {suggestions.map((suggestion, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm hover:border-purple-500/30 hover:bg-purple-500/10 transition-all"
                >
                  {suggestion}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Chat Messages */}
        {messages.length > 0 && (
          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-8">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                      <Brain className="w-5 h-5 text-purple-400" />
                    </div>
                  )}
                  
                  <div className={`flex-1 max-w-2xl ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                    <div className={`p-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30'
                        : 'bg-white/5 border border-white/10'
                    }`}>
                      <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs text-slate-500 mt-2">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {message.role === 'user' && (
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-blue-400" />
                    </div>
                  )}
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                    <Brain className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                      <span className="text-slate-400 text-sm">Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Input Area - Fixed at bottom */}
        <div className="border-t border-white/10 bg-slate-950/50 backdrop-blur-xl p-6">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500" />
              <div className="relative flex items-center bg-slate-900/90 rounded-2xl border border-slate-800 p-2">
                <Sparkles className="w-5 h-5 text-purple-400 ml-3 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask anything about your GitHub activity..."
                  className="flex-1 bg-transparent px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none"
                  disabled={loading}
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={loading || !query.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Ask
                </motion.button>
              </div>
              {needsAuth && (
                <div className="mt-3 text-xs text-slate-400 flex items-center gap-2">
                  <span>Sign in required.</span>
                  <button onClick={login} className="px-2 py-1 rounded bg-purple-500/20 border border-purple-500/40 text-purple-100">Login</button>
                </div>
              )}
              {serviceUnavailable && (
                <div className="mt-3 text-xs text-slate-400">
                  {serviceUnavailable}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
