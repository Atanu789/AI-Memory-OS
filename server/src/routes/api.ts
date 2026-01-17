import { Router, Request, Response } from 'express';
import { isAuthenticated } from '../middleware/auth';
import githubService from '../services/github.service';
import geminiService from '../services/gemini.service';
import graphService from '../services/graph.service';
import memoryIngestionService from '../services/memory-ingestion.service';

const router = Router();

// Dashboard data endpoint
router.get('/dashboard', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    
    if (!user?.username) {
      return res.status(400).json({ error: 'GitHub username not found' });
    }

    // Check if services are configured
    if (!githubService.isConfigured()) {
      return res.status(503).json({ 
        error: 'GitHub service not configured', 
        message: 'Please add GITHUB_TOKEN to .env file' 
      });
    }

    // Fetch GitHub data
    const [repos, stats] = await Promise.all([
      githubService.getUserRepositories(user.username, 6),
      githubService.getUserStats(user.username)
    ]);

    // Generate AI insights if Gemini is configured
    let insights: string[] = [];
    let activitySummary: string = '';
    
    if (geminiService.isConfigured()) {
      try {
        [insights, activitySummary] = await Promise.all([
          geminiService.generateInsights(stats).catch(() => []),
          geminiService.generateActivitySummary(stats.recentActivity).catch(() => '')
        ]);
      } catch (error) {
        console.log('AI insights generation failed, continuing without them');
      }
    }

    res.json({
      user: {
        name: user.displayName,
        username: user.username,
        avatar: user.avatar
      },
      stats: {
        totalRepos: stats.totalRepos,
        totalStars: stats.totalStars,
        totalForks: stats.totalForks,
        totalCommits: stats.totalCommits
      },
      topLanguages: stats.topLanguages,
      recentRepos: repos,
      recentActivity: stats.recentActivity.slice(0, 10),
      insights,
      activitySummary
    });
  } catch (error: any) {
    console.error('Dashboard API error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data', message: error.message });
  }
});

// Timeline data endpoint
router.get('/timeline', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const period = req.query.period as string || 'week';
    
    if (!user?.username) {
      return res.status(400).json({ error: 'GitHub username not found' });
    }

    if (!githubService.isConfigured()) {
      return res.status(503).json({ error: 'GitHub service not configured' });
    }

    const activities = await githubService.getUserActivity(user.username, 50);

    let insight: string = '';
    if (geminiService.isConfigured()) {
      insight = await geminiService.generateTimelineInsight(activities, period);
    }

    // Group activities by date
    const groupedActivities = activities.reduce((acc, activity) => {
      const date = new Date(activity.created_at).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(activity);
      return acc;
    }, {} as { [date: string]: typeof activities });

    res.json({
      activities: groupedActivities,
      insight,
      totalActivities: activities.length
    });
  } catch (error: any) {
    console.error('Timeline API error:', error);
    res.status(500).json({ error: 'Failed to fetch timeline data', message: error.message });
  }
});

// Repository analysis endpoint
router.get('/repositories', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    
    if (!user?.username) {
      return res.status(400).json({ error: 'GitHub username not found' });
    }

    if (!githubService.isConfigured()) {
      return res.status(503).json({ error: 'GitHub service not configured' });
    }

    const repos = await githubService.getUserRepositories(user.username, 30);

    let analysis = { categories: {}, recommendations: [] as string[] };
    if (geminiService.isConfigured()) {
      analysis = await geminiService.analyzeRepositories(repos);
    }

    res.json({
      repositories: repos,
      categories: analysis.categories,
      recommendations: analysis.recommendations
    });
  } catch (error: any) {
    console.error('Repositories API error:', error);
    res.status(500).json({ error: 'Failed to fetch repositories', message: error.message });
  }
});

// Chat endpoint for Ask Brain
router.post('/chat', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const user = req.user as any;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!geminiService.isConfigured()) {
      return res.status(503).json({ 
        error: 'AI service not configured',
        message: 'Please add GEMINI_API_KEY to .env file'
      });
    }

    // Fetch user context
    let context: any = null;
    if (githubService.isConfigured() && user?.username) {
      try {
        const stats = await githubService.getUserStats(user.username);
        context = {
          username: user.username,
          totalRepos: stats.totalRepos,
          totalStars: stats.totalStars,
          topLanguages: Object.keys(stats.topLanguages).slice(0, 5),
          recentActivityTypes: Array.from(new Set(stats.recentActivity.map(a => a.type))).slice(0, 5)
        };
      } catch (err) {
        console.log('Could not fetch GitHub context for chat');
      }
    }

    const response = await geminiService.chat(message, context);

    res.json({
      message: response,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Failed to process chat message', message: error.message });
  }
});

// Search repositories endpoint
router.get('/search', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    if (!githubService.isConfigured()) {
      return res.status(503).json({ error: 'GitHub service not configured' });
    }

    const results = await githubService.searchRepositories(q, 20);

    res.json({
      query: q,
      results,
      count: results.length
    });
  } catch (error: any) {
    console.error('Search API error:', error);
    res.status(500).json({ error: 'Search failed', message: error.message });
  }
});

// Get repository commits
router.get('/commits/:owner/:repo', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const owner = req.params.owner as string;
    const repo = req.params.repo as string;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!githubService.isConfigured()) {
      return res.status(503).json({ error: 'GitHub service not configured' });
    }

    const commits = await githubService.getRepositoryCommits(owner, repo, limit);

    res.json({
      repository: `${owner}/${repo}`,
      commits,
      count: commits.length
    });
  } catch (error: any) {
    console.error('Commits API error:', error);
    res.status(500).json({ error: 'Failed to fetch commits', message: error.message });
  }
});

// Knowledge Graph / Mind Map endpoints
router.get('/graph', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const focus = (req.query.focus as string) || 'last_30_days';
    const depth = parseInt(req.query.depth as string) || 2;
    const types = req.query.types ? (req.query.types as string).split(',') : undefined;
    const minImportance = parseFloat(req.query.minImportance as string) || 0.3;

    const graphData = await graphService.getGraph({
      focus: focus as any,
      depth,
      types,
      minImportance,
    });

    res.json(graphData);
  } catch (error: any) {
    console.error('Graph API error:', error);
    res.status(500).json({ error: 'Failed to fetch graph', message: error.message });
  }
});

// Create manual memory node
router.post('/memory', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { type, title, summary, metadata } = req.body;

    if (!type || !title || !summary) {
      return res.status(400).json({ error: 'Missing required fields: type, title, summary' });
    }

    const memory = await graphService.createMemory({
      type,
      title,
      summary,
      source: 'manual',
      metadata,
    });

    res.json(memory);
  } catch (error: any) {
    console.error('Create memory error:', error);
    res.status(500).json({ error: 'Failed to create memory', message: error.message });
  }
});

// Track node access
router.post('/graph/access/:nodeId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const nodeId = req.params.nodeId as string;
    await graphService.trackAccess(nodeId);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Track access error:', error);
    res.status(500).json({ error: 'Failed to track access', message: error.message });
  }
});

// Get insights from graph patterns
router.get('/insights', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const insights = await graphService.findPatterns();
    res.json({ insights });
  } catch (error: any) {
    console.error('Insights API error:', error);
    res.status(500).json({ error: 'Failed to generate insights', message: error.message });
  }
});

// Sync memories from GitHub
router.post('/sync-memories', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    
    if (!user?.username) {
      return res.status(400).json({ error: 'GitHub username not found' });
    }

    // Run sync in background
    memoryIngestionService.syncMemories(user.username).catch(console.error);
    
    res.json({ message: 'Memory sync started', username: user.username });
  } catch (error: any) {
    console.error('Sync memories error:', error);
    res.status(500).json({ error: 'Failed to start sync', message: error.message });
  }
});

// Analyze repository with AI
router.get('/analyze-repo/:owner/:repo', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const owner = String(req.params.owner);
    const repo = String(req.params.repo);
    const limit = parseInt(req.query.limit as string) || 20;

    if (!githubService.isConfigured()) {
      return res.status(503).json({ error: 'GitHub service not configured' });
    }

    // Get repository commits
    const commits = await githubService.getRepositoryCommits(owner, repo, limit);
    
    // Get repository details
    const repos = await githubService.getUserRepositories(owner, 100);
    const repoDetails = repos.find(r => r.name === repo);

    if (!repoDetails) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    // Generate AI analysis
    let analysis;
    if (geminiService.isConfigured()) {
      analysis = await geminiService.analyzeRepositoryPattern(
        repo,
        commits,
        repoDetails.language
      );
    } else {
      analysis = {
        whatYouDid: ['Repository work and commits'],
        whenYouDid: 'Recent activity',
        patterns: ['Regular contributions'],
        strengths: ['Active development'],
        weaknesses: ['AI analysis unavailable'],
      };
    }

    res.json({
      repository: repoDetails,
      commits: commits.slice(0, 10),
      analysis,
    });
  } catch (error: any) {
    console.error('Analyze repo error:', error);
    res.status(500).json({ error: 'Failed to analyze repository', message: error.message });
  }
});
 
export default router;

