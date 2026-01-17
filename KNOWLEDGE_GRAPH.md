# Knowledge Graph Architecture

## Overview

The Mind Map is a **knowledge graph** system that automatically captures, organizes, and connects memories from various sources. It's not a static diagram - it's a living, evolving representation of your development journey.

## Core Concepts

### Memory Nodes

Every node represents a **memory** - a discrete unit of knowledge:

```typescript
{
  id: string;
  type: "concept" | "decision" | "task" | "mistake" | "insight" | "code_event";
  title: string;
  summary: string;
  source: "github" | "manual" | "agent";
  timestamp: Date;
  importance: number;  // 0 → 1
  confidence?: number;
  metadata: { ... }
}
```

**Types:**
- `concept`: Core ideas and principles
- `decision`: Architectural and design choices
- `task`: Work items and todos
- `mistake`: Errors and debugging lessons
- `insight`: Learned patterns and realizations
- `code_event`: Commits, PRs, issues from GitHub

### Memory Edges

Edges define **relationships** between memories:

```typescript
{
  from: string;
  to: string;
  relation: "causes" | "depends_on" | "contradicts" | "refines" | "similar_to" | "leads_to";
  weight: number;  // 0 → 1
  metadata: { inferredBy: "semantic" | "temporal" | "llm" | "manual" }
}
```

**Relations:**
- `causes`: A causes B
- `depends_on`: A requires B
- `contradicts`: A conflicts with B
- `refines`: A improves/extends B
- `similar_to`: A relates to B
- `leads_to`: A results in B

## Data Sources

### 1. GitHub Events
Automatically ingested from commits, PRs, issues:
```typescript
await memoryIngestionService.syncMemories(username);
```

### 2. Manual Input
User-created concepts and decisions:
```typescript
await apiService.createMemory({
  type: 'concept',
  title: 'Use event-driven architecture',
  summary: '...',
  source: 'manual'
});
```

### 3. Agent Insights
AI-generated from pattern analysis:
```typescript
const insights = await graphService.findPatterns();
```

## Relationship Inference

### Semantic Similarity
Text-based similarity using embeddings:
```typescript
if (cosineSimilarity(nodeA, nodeB) > 0.6) {
  createEdge('similar_to', weight: similarity);
}
```

### Temporal Reasoning
Time-based relationships:
```typescript
if (newNode.timestamp > oldNode.timestamp && similar(newNode, oldNode)) {
  createEdge('refines');
}
```

### Causal Detection
LLM-powered inference:
```
"Does implementing OAuth depend on having a session store?"
→ creates 'depends_on' edge
```

## Memory Lifecycle

### 1. Ingestion
```
GitHub Commit → Parse → Create Memory Node → Infer Relationships
```

### 2. Decay
Old memories lose importance over time:
```typescript
node.importance *= decayFactor;  // Applied daily
```

### 3. Promotion
Frequently accessed memories gain importance:
```typescript
promotionScore = accessCount * importance * recency;
```

## Querying the Graph

### Basic Query
```typescript
const graph = await apiService.getGraph({
  focus: 'last_30_days',
  depth: 2,
  minImportance: 0.3
});
```

### Filtered Query
```typescript
const graph = await apiService.getGraph({
  types: ['concept', 'decision'],
  minImportance: 0.7
});
```

## Clustering

Clusters = **mental models**

Automatically detected using:
- Community detection algorithms
- Repository grouping
- Type-based grouping

```typescript
clusters = {
  'repo:ai-memory-os': [node1, node2, ...],
  'type:concept': [node3, node4, ...],
}
```

## API Endpoints

```typescript
// Get graph data
GET /api/graph?focus=last_30_days&depth=2&minImportance=0.3

// Create manual memory
POST /api/memory
{
  type: 'concept',
  title: '...',
  summary: '...'
}

// Sync from GitHub
POST /api/sync-memories

// Track node access
POST /api/graph/access/:nodeId

// Get insights
GET /api/insights
```

## Database Schema

### MemoryNode Collection
```
_id: ObjectId
type: String (enum)
title: String (indexed)
summary: String
source: String (enum)
timestamp: Date (indexed)
importance: Number (0-1)
metadata: Object
accessCount: Number
lastAccessed: Date
createdAt: Date
updatedAt: Date
```

### MemoryEdge Collection
```
_id: ObjectId
from: String (indexed)
to: String (indexed)
relation: String (enum)
weight: Number (0-1)
metadata: Object
createdAt: Date
updatedAt: Date
```

## UI Rendering

The Mind Map UI consumes the graph and renders it:

```typescript
// Fetch graph
const { nodes, edges, clusters } = await apiService.getGraph();

// Transform to D3 hierarchy
const tree = buildHierarchy(nodes, edges);

// Render with D3.js
d3.tree()
  .size([height, width])
  .render(tree);
```

**Visual Properties:**
- Node size = importance
- Node color = type
- Edge thickness = weight
- Opacity = recency

## Usage Examples

### 1. Seed Sample Data
```bash
npm run seed
```

### 2. Sync from GitHub
```typescript
// Manually trigger
await apiService.syncMemories();

// Or API call
POST http://localhost:3000/api/sync-memories
```

### 3. Create Manual Memory
```typescript
await apiService.createMemory({
  type: 'decision',
  title: 'Use MongoDB for graph storage',
  summary: 'Chose MongoDB for flexible schema and good query performance',
  metadata: { tags: ['database', 'architecture'] }
});
```

### 4. Query Recent Decisions
```typescript
const graph = await apiService.getGraph({
  types: ['decision'],
  focus: 'last_7_days',
  minImportance: 0.5
});
```

## Key Differences from Notes Apps

| Notes App | Knowledge Graph |
|-----------|-----------------|
| Manual links | Automatic edges |
| Static | Evolving |
| Text-based | Semantic |
| No decay | Memory decay |
| No causality | Cause–effect |

## Future Enhancements

1. **Vector Embeddings**: Use real semantic similarity
2. **LLM Inference**: GPT-4 for relationship detection
3. **Contradiction Detection**: Find conflicting decisions
4. **Confidence Scoring**: Track belief certainty
5. **Graph Visualization**: Force-directed layout option
6. **Memory Consolidation**: Merge similar nodes

## Technical Stack

- **Backend**: Node.js + TypeScript + Express
- **Database**: MongoDB with indexes
- **Graph Processing**: Custom algorithms
- **Frontend**: React + D3.js
- **AI**: Gemini AI for insights

## Getting Started

1. **Setup MongoDB** (already configured)
2. **Seed sample data**:
   ```bash
   cd server
   npm run seed
   ```
3. **Start servers**:
   ```bash
   # Terminal 1 - Server
   cd server
   npm run dev

   # Terminal 2 - Client
   cd client
   npm run dev
   ```
4. **Navigate to Mind Map** in the app
5. **Click "Sync"** to ingest GitHub data

## Architecture Diagram

```
┌─────────────────┐
│  GitHub Events  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────┐
│ Memory Ingestion│────▶│ MemoryNode   │
└────────┬────────┘     └──────┬───────┘
         │                     │
         │                     ▼
         │              ┌──────────────┐
         │              │ Relationship │
         │              │  Inference   │
         │              └──────┬───────┘
         │                     │
         ▼                     ▼
┌─────────────────┐     ┌──────────────┐
│   Graph API     │────▶│  MemoryEdge  │
└────────┬────────┘     └──────────────┘
         │
         ▼
┌─────────────────┐
│   Mind Map UI   │
└─────────────────┘
```

## Implementation Checklist

- [x] Memory Node model
- [x] Memory Edge model
- [x] Graph service
- [x] Memory ingestion service
- [x] API endpoints
- [x] Frontend integration
- [x] UI with sync button
- [x] Seed script
- [ ] Vector embeddings (future)
- [ ] LLM relationship inference (future)
- [ ] Contradiction detection (future)

---

**Key Insight**: This is not just a visualization tool - it's a **semantic memory system** that learns and evolves with your development process.
