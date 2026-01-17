import { Octokit } from 'octokit';

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  topics: string[];
}

export interface GitHubActivity {
  id: string;
  type: string;
  actor: {
    login: string;
    avatar_url: string;
  };
  repo: {
    name: string;
    url: string;
  };
  payload: any;
  created_at: string;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  html_url: string;
  author: {
    login: string;
    avatar_url: string;
  } | null;
}

export interface GitHubStats {
  totalRepos: number;
  totalStars: number;
  totalForks: number;
  totalCommits: number;
  topLanguages: { [key: string]: number };
  recentActivity: GitHubActivity[];
}

class GitHubService {
  private octokit: Octokit | null = null;

  constructor() {
    if (process.env.GITHUB_TOKEN) {
      this.octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN,
      });
    }
  }

  isConfigured(): boolean {
    return this.octokit !== null;
  }

  async getUserRepositories(username: string, limit: number = 10): Promise<GitHubRepo[]> {
    if (!this.octokit) {
      throw new Error('GitHub service not configured. Please set GITHUB_TOKEN in .env');
    }

    try {
      const response = await this.octokit.rest.repos.listForUser({
        username,
        sort: 'updated',
        per_page: limit,
      });

      return response.data.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        html_url: repo.html_url,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        updated_at: repo.updated_at,
        topics: repo.topics || [],
      }));
    } catch (error: any) {
      console.error('Error fetching repositories:', error.message);
      throw error;
    }
  }

  async getUserActivity(username: string, limit: number = 30): Promise<GitHubActivity[]> {
    if (!this.octokit) {
      throw new Error('GitHub service not configured');
    }

    try {
      const response = await this.octokit.rest.activity.listPublicEventsForUser({
        username,
        per_page: limit,
      });

      return response.data.map((event: any) => ({
        id: event.id,
        type: event.type,
        actor: {
          login: event.actor.login,
          avatar_url: event.actor.avatar_url,
        },
        repo: {
          name: event.repo.name,
          url: `https://github.com/${event.repo.name}`,
        },
        payload: event.payload,
        created_at: event.created_at,
      }));
    } catch (error: any) {
      console.error('Error fetching user activity:', error.message);
      throw error;
    }
  }

  async getRepositoryCommits(owner: string, repo: string, limit: number = 10): Promise<GitHubCommit[]> {
    if (!this.octokit) {
      throw new Error('GitHub service not configured');
    }

    try {
      const response = await this.octokit.rest.repos.listCommits({
        owner,
        repo,
        per_page: limit,
      });

      return response.data.map((commit: any) => ({
        sha: commit.sha,
        commit: {
          message: commit.commit.message,
          author: {
            name: commit.commit.author.name,
            email: commit.commit.author.email,
            date: commit.commit.author.date,
          },
        },
        html_url: commit.html_url,
        author: commit.author ? {
          login: commit.author.login,
          avatar_url: commit.author.avatar_url,
        } : null,
      }));
    } catch (error: any) {
      console.error('Error fetching commits:', error.message);
      throw error;
    }
  }

  async getUserStats(username: string): Promise<GitHubStats> {
    if (!this.octokit) {
      throw new Error('GitHub service not configured');
    }

    try {
      // Get all repositories
      const repos = await this.getUserRepositories(username, 100);
      
      // Calculate stats
      const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
      const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
      
      // Count languages
      const topLanguages: { [key: string]: number } = {};
      repos.forEach(repo => {
        if (repo.language) {
          topLanguages[repo.language] = (topLanguages[repo.language] || 0) + 1;
        }
      });

      // Get recent activity
      const recentActivity = await this.getUserActivity(username, 20);

      // Count commits from activity
      const totalCommits = recentActivity.filter(a => a.type === 'PushEvent').length;

      return {
        totalRepos: repos.length,
        totalStars,
        totalForks,
        totalCommits,
        topLanguages,
        recentActivity,
      };
    } catch (error: any) {
      console.error('Error fetching user stats:', error.message);
      throw error;
    }
  }

  async searchRepositories(query: string, limit: number = 10): Promise<GitHubRepo[]> {
    if (!this.octokit) {
      throw new Error('GitHub service not configured');
    }

    try {
      const response = await this.octokit.rest.search.repos({
        q: query,
        sort: 'stars',
        per_page: limit,
      });

      return response.data.items.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        html_url: repo.html_url,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        updated_at: repo.updated_at,
        topics: repo.topics || [],
      }));
    } catch (error: any) {
      console.error('Error searching repositories:', error.message);
      throw error;
    }
  }
}

export default new GitHubService();
