// Type definitions for IPC communication

interface Window {
  electron?: {
    shell: {
      openExternal: (url: string) => Promise<void>;
    };
  };
}

export interface DashboardSummary {
  focusTime: number; // in minutes
  deepWorkPercentage: number;
  contextSwitches: number;
  activeTime: number;
}

export interface Insight {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'positive';
  title: string;
  description: string;
  timestamp: Date;
  memoryReferences: string[];
  isRead: boolean;
}

export interface Memory {
  id: string;
  type: 'decision' | 'insight' | 'mistake' | 'belief' | 'context';
  title: string;
  content: string;
  timestamp: Date;
  tags: string[];
  connections: string[];
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'decision' | 'insight' | 'mistake' | 'belief' | 'context';
  timestamp: Date;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'causal' | 'semantic' | 'temporal';
}

export interface TimelineEvent {
  id: string;
  type: 'decision' | 'insight' | 'belief-change' | 'context-switch';
  title: string;
  description: string;
  timestamp: Date;
  metadata?: any;
}

export interface GitHubSummary {
  commits: number;
  repositories: string[];
  primaryFocus: string;
  deepWorkHours: number;
  intentClusters: { type: string; percentage: number }[];
  refactorLoops: RefactorLoop[];
  productivityHeatmap: { date: string; count: number }[];
}

export interface RefactorLoop {
  file: string;
  modifications: number;
  suggestion: string;
}

export interface BrainResponse {
  answer: string;
  citations: Memory[];
  conversationId: string;
}

export interface Settings {
  retentionDays: number;
  autoDeleteLowConfidence: boolean;
  compressOldMemories: boolean;
  preserveDecisions: boolean;
  enabledAgents: string[];
}

// Electron API exposed via contextBridge
export interface ElectronAPI {
  // Shell
  openExternal?: (url: string) => Promise<void>;

  // Dashboard
  getTodaySummary: () => Promise<DashboardSummary>;
  getRecentInsights: (limit: number) => Promise<Insight[]>;
  
  // Mind Map
  getMemoryGraph: (filters?: GraphFilters) => Promise<GraphData>;
  getMemoryById: (id: string) => Promise<Memory>;
  
  // Timeline
  getMemoryTimeline: (startDate: Date, endDate: Date, filters?: any) => Promise<TimelineEvent[]>;
  
  // GitHub
  getGitHubIntelligence: (dateRange: { start: Date; end: Date }, repos?: string[]) => Promise<GitHubSummary>;
  
  // Insights
  getInsights: (filters?: any) => Promise<Insight[]>;
  markInsightAsRead: (id: string) => Promise<void>;
  
  // Ask Brain
  askBrain: (question: string, conversationId?: string) => Promise<BrainResponse>;
  
  // Settings
  getSettings: () => Promise<Settings>;
  updateSettings: (key: string, value: any) => Promise<void>;
  
  // Events
  onAgentUpdate: (callback: (data: any) => void) => void;
  onNewInsight: (callback: (insight: Insight) => void) => void;
}

export interface GraphFilters {
  types?: string[];
  dateRange?: { start: Date; end: Date };
  tags?: string[];
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
