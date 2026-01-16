import { motion } from 'framer-motion';
import { MessageSquare, Sparkles, Send } from 'lucide-react';
import { Highlight } from '../components/ui/hero-highlight';
import { useState } from 'react';

export default function AskBrain() {
  const [query, setQuery] = useState('');

  return (
    <div className="relative min-h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-6"
          >
            <MessageSquare className="w-16 h-16 text-purple-400 drop-shadow-[0_0_20px_rgba(192,132,252,0.5)]" />
          </motion.div>
          
          <h1 className="text-5xl font-bold mb-4">
            <Highlight className="text-slate-100">
              Ask Your Brain
            </Highlight>
          </h1>
          
          <p className="text-slate-400 text-lg mb-8">
            Natural language interface to query your entire knowledge graph
          </p>

          {/* Search Input */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative max-w-2xl mx-auto"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500" />
              <div className="relative flex items-center bg-slate-900 rounded-2xl border border-slate-800 p-2">
                <Sparkles className="w-5 h-5 text-purple-400 ml-3" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What would you like to know?"
                  className="flex-1 bg-transparent px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                >
                  <Send className="w-4 h-4" />
                  Ask
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-wrap gap-2 justify-center"
          >
            {[
              "What did I work on yesterday?",
              "Show me patterns in my GitHub commits",
              "When was I most productive this week?",
            ].map((suggestion, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setQuery(suggestion)}
                className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-300 hover:border-purple-500/50 hover:bg-slate-800 transition-all"
              >
                {suggestion}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
