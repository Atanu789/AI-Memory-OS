import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Network, GitBranch, Star, GitFork, Code2, AlertCircle, Filter } from 'lucide-react';
import { Highlight } from '../components/ui/hero-highlight';
import { AppBackground } from '../components/ui/app-background';
import apiService, { RepositoriesData } from '../services/api.service';

export default function Repositories() {
  const [data, setData] = useState<RepositoriesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadRepositoriesData();
  }, []);

  const loadRepositoriesData = async () => {
    try {
      setLoading(true);
      setError(null);
      const repoData = await apiService.getRepositories();
      setData(repoData);
      
      // Set first category as default if available
      if (repoData.categories && Object.keys(repoData.categories).length > 0) {
        setSelectedCategory(Object.keys(repoData.categories)[0]);
      }
    } catch (error: any) {
      console.error('Failed to load repositories:', error);
      setError(error.response?.data?.message || 'Failed to load repositories');
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
            <Network className="w-5 h-5 animate-pulse" />
            Loading repositories...
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
            <h2 className="text-xl font-semibold text-slate-200 mb-2">Failed to Load Repositories</h2>
            <p className="text-slate-400">{error}</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const categories = Object.keys(data.categories);
  const displayedRepos = selectedCategory === 'all' 
    ? data.repositories 
    : data.categories[selectedCategory] || [];

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
            <GitBranch className="w-16 h-16 text-green-400 drop-shadow-[0_0_20px_rgba(34,197,94,0.5)]" />
          </motion.div>
          
          <h1 className="text-5xl font-bold mb-4">
            <Highlight className="text-slate-100">
              Your Repositories
            </Highlight>
          </h1>
          
          <p className="text-slate-400 text-lg">
            Explore your GitHub repositories organized by technology
          </p>
        </motion.div>

       

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-6xl mx-auto w-full mb-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-2xl text-center">
              <GitBranch className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-200">{data.repositories.length}</p>
              <p className="text-sm text-slate-500">Repositories</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-2xl text-center">
              <Code2 className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-200">{categories.length}</p>
              <p className="text-sm text-slate-500">Languages</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-2xl text-center">
              <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-200">
                {data.repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0)}
              </p>
              <p className="text-sm text-slate-500">Total Stars</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-2xl text-center">
              <GitFork className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-200">
                {data.repositories.reduce((sum, repo) => sum + repo.forks_count, 0)}
              </p>
              <p className="text-sm text-slate-500">Total Forks</p>
            </div>
          </div>
        </motion.div>

        {/* Language Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-6xl mx-auto w-full mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-200">Filter by Language</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                selectedCategory === 'all'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-white/5 text-slate-400 border border-white/10 hover:border-white/20'
              }`}
            >
              All ({data.repositories.length})
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-white/5 text-slate-400 border border-white/10 hover:border-white/20'
                }`}
              >
                {category} ({data.categories[category].length})
              </button>
            ))}
          </div>
        </motion.div>

        {/* Repository Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-6xl mx-auto w-full"
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedRepos.map((repo, idx) => (
              <motion.a
                key={repo.id}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + idx * 0.05 }}
                className="group p-5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-2xl hover:border-green-500/30 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-slate-200 group-hover:text-green-400 transition-colors truncate">
                      {repo.name}
                    </h3>
                    {repo.language && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="w-2 h-2 rounded-full bg-blue-400" />
                        <span className="text-xs text-slate-500">{repo.language}</span>
                      </div>
                    )}
                  </div>
                  <GitBranch className="w-5 h-5 text-slate-600 group-hover:text-green-400 transition-colors shrink-0" />
                </div>

                <p className="text-sm text-slate-400 line-clamp-2 mb-4 min-h-[2.5rem]">
                  {repo.description || 'No description provided'}
                </p>

                {repo.topics && repo.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {repo.topics.slice(0, 3).map((topic: string) => (
                      <span
                        key={topic}
                        className="px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {repo.stargazers_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="w-3 h-3" />
                    {repo.forks_count}
                  </span>
                  <span className="ml-auto text-slate-600">
                    {new Date(repo.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </motion.a>
            ))}
          </div>

          {displayedRepos.length === 0 && (
            <div className="text-center py-12">
              <GitBranch className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No repositories found in this category</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
