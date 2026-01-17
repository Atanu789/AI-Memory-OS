import mongoose, { Schema, Document } from 'mongoose';

export interface IMemoryNode extends Document {
  id: string;
  type: 'concept' | 'decision' | 'task' | 'mistake' | 'insight' | 'code_event';
  title: string;
  summary: string;
  content?: string;
  source: 'github' | 'manual' | 'agent';
  timestamp: Date;
  importance: number; // 0-1
  confidence?: number;
  embeddingId?: string;
  embedding?: number[];
  metadata: {
    repoName?: string;
    commitSha?: string;
    filesPaths?: string[];
    language?: string;
    tags?: string[];
  };
  accessCount: number;
  lastAccessed: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMemoryEdge extends Document {
  from: string; // memory node id
  to: string;   // memory node id
  relation: 'causes' | 'depends_on' | 'contradicts' | 'refines' | 'similar_to' | 'leads_to';
  weight: number; // relationship strength 0-1
  confidence?: number;
  metadata?: {
    inferredBy?: 'semantic' | 'temporal' | 'llm' | 'manual';
    reason?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const MemoryNodeSchema = new Schema<IMemoryNode>({
  type: {
    type: String,
    enum: ['concept', 'decision', 'task', 'mistake', 'insight', 'code_event'],
    required: true,
  },
  title: { type: String, required: true, index: true },
  summary: { type: String, required: true },
  content: { type: String },
  source: {
    type: String,
    enum: ['github', 'manual', 'agent'],
    required: true,
  },
  timestamp: { type: Date, default: Date.now, index: true },
  importance: { type: Number, min: 0, max: 1, default: 0.5 },
  confidence: { type: Number, min: 0, max: 1 },
  embeddingId: { type: String },
  embedding: { type: [Number] },
  metadata: {
    repoName: String,
    commitSha: String,
    filesPaths: [String],
    language: String,
    tags: [String],
  },
  accessCount: { type: Number, default: 0 },
  lastAccessed: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

const MemoryEdgeSchema = new Schema<IMemoryEdge>({
  from: { type: String, required: true, index: true },
  to: { type: String, required: true, index: true },
  relation: {
    type: String,
    enum: ['causes', 'depends_on', 'contradicts', 'refines', 'similar_to', 'leads_to'],
    required: true,
  },
  weight: { type: Number, min: 0, max: 1, default: 0.5 },
  confidence: { type: Number, min: 0, max: 1 },
  metadata: {
    inferredBy: {
      type: String,
      enum: ['semantic', 'temporal', 'llm', 'manual'],
    },
    reason: String,
  },
}, {
  timestamps: true,
});

// Indexes for performance
MemoryNodeSchema.index({ type: 1, timestamp: -1 });
MemoryNodeSchema.index({ importance: -1 });
MemoryNodeSchema.index({ 'metadata.repoName': 1 });

MemoryEdgeSchema.index({ from: 1, to: 1 });
MemoryEdgeSchema.index({ relation: 1, weight: -1 });

export const MemoryNode = mongoose.model<IMemoryNode>('MemoryNode', MemoryNodeSchema);
export const MemoryEdge = mongoose.model<IMemoryEdge>('MemoryEdge', MemoryEdgeSchema);
