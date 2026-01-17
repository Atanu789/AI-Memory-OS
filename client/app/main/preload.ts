import { contextBridge, ipcRenderer, shell } from "electron";

// Expose type-safe API to renderer
contextBridge.exposeInMainWorld("electronAPI", {
  // Shell operations
  openExternal: (url: string) => shell.openExternal(url),
  
  // Dashboard
  getTodaySummary: () => ipcRenderer.invoke("dashboard:getTodaySummary"),
  getRecentInsights: (limit: number) => ipcRenderer.invoke("dashboard:getRecentInsights", limit),
  
  // Mind Map
  getMemoryGraph: (filters?: any) => ipcRenderer.invoke("mindmap:getMemoryGraph", filters),
  getMemoryById: (id: string) => ipcRenderer.invoke("memory:getById", id),
  
  // Timeline
  getMemoryTimeline: (startDate: Date, endDate: Date, filters?: any) => 
    ipcRenderer.invoke("timeline:getMemoryTimeline", startDate, endDate, filters),
  
  // GitHub
  getGitHubIntelligence: (dateRange: { start: Date; end: Date }, repos?: string[]) => 
    ipcRenderer.invoke("github:getIntelligence", dateRange, repos),
  
  // Insights
  getInsights: (filters?: any) => ipcRenderer.invoke("insights:getAll", filters),
  markInsightAsRead: (id: string) => ipcRenderer.invoke("insights:markAsRead", id),
  
  // Ask Brain
  askBrain: (question: string, conversationId?: string) => 
    ipcRenderer.invoke("brain:ask", question, conversationId),
  
  // Settings
  getSettings: () => ipcRenderer.invoke("settings:get"),
  updateSettings: (key: string, value: any) => ipcRenderer.invoke("settings:update", key, value),
  
  // Events
  onAgentUpdate: (callback: (data: any) => void) => {
    ipcRenderer.on("agent:update", (_event, data) => callback(data));
  },
  onNewInsight: (callback: (insight: any) => void) => {
    ipcRenderer.on("insight:new", (_event, insight) => callback(insight));
  },
});
