import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface DashboardData {
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  stats: {
    totalRepos: number;
    totalStars: number;
    totalForks: number;
    totalCommits: number;
  };
  topLanguages: { [key: string]: number };
  recentRepos: Array<{
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
  }>;
  recentActivity: Array<{
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
  }>;
  insights: string[];
  activitySummary: string;
}

export interface TimelineData {
  activities: {
    [date: string]: Array<{
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
    }>;
  };
  insight: string;
  totalActivities: number;
}

export interface RepositoriesData {
  repositories: Array<{
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
  }>;
  categories: { [key: string]: any[] };
  recommendations: string[];
}

export interface ChatResponse {
  message: string;
  timestamp: string;
}

class ApiService {
  async getDashboardData(): Promise<DashboardData> {
    const response = await apiClient.get('/api/dashboard');
    return response.data;
  }

  async getTimelineData(period: string = 'week'): Promise<TimelineData> {
    const response = await apiClient.get(`/api/timeline?period=${period}`);
    return response.data;
  }

  async getRepositories(): Promise<RepositoriesData> {
    const response = await apiClient.get('/api/repositories');
    return response.data;
  }

  async chat(message: string): Promise<ChatResponse> {
    const response = await apiClient.post('/api/chat', { message });
    return response.data;
  }

  async searchRepositories(query: string) {
    const response = await apiClient.get(`/api/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  async getCommits(owner: string, repo: string, limit: number = 20) {
    const response = await apiClient.get(`/api/commits/${owner}/${repo}?limit=${limit}`);
    return response.data;
  }

  // Knowledge Graph / Mind Map APIs
  async getGraph(options?: {
    focus?: 'last_7_days' | 'last_30_days' | 'all';
    depth?: number;
    types?: string[];
    minImportance?: number;
  }) {
    const params = new URLSearchParams();
    if (options?.focus) params.append('focus', options.focus);
    if (options?.depth) params.append('depth', options.depth.toString());
    if (options?.types) params.append('types', options.types.join(','));
    if (options?.minImportance) params.append('minImportance', options.minImportance.toString());

    const response = await apiClient.get(`/api/graph?${params.toString()}`);
    return response.data;
  }

  async createMemory(data: {
    type: 'concept' | 'decision' | 'task' | 'mistake' | 'insight' | 'code_event';
    title: string;
    summary: string;
    metadata?: any;
  }) {
    const response = await apiClient.post('/api/memory', data);
    return response.data;
  }

  async trackNodeAccess(nodeId: string) {
    const response = await apiClient.post(`/api/graph/access/${nodeId}`);
    return response.data;
  }

  async getInsights() {
    const response = await apiClient.get('/api/insights');
    return response.data;
  }

  async syncMemories() {
    const response = await apiClient.post('/api/sync-memories');
    return response.data;
  }

  async analyzeRepository(owner: string, repo: string) {
    const response = await apiClient.get(`/api/analyze-repo/${owner}/${repo}`);
    return response.data;
  }
}

export default new ApiService();