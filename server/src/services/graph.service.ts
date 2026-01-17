import { MemoryNode, MemoryEdge, IMemoryNode, IMemoryEdge } from '../models/Memory';

interface GraphData {
  nodes: any[];
  edges: any[];
  clusters?: { [key: string]: string[] };
}

interface GraphQueryOptions {
  focus?: 'last_30_days' | 'last_7_days' | 'all';
  depth?: number;
  types?: string[];
  minImportance?: number;
}

class GraphService {
  // Create a memory node from GitHub commit
  async createMemoryFromCommit(commitData: any): Promise<IMemoryNode> {
    const memory = await MemoryNode.create({
      type: 'code_event',
      title: commitData.message.split('\n')[0].substring(0, 100),
      summary: commitData.message,
      source: 'github',
      timestamp: new Date(commitData.timestamp),
      importance: this.calculateImportance(commitData),
      metadata: {
        repoName: commitData.repo,
        commitSha: commitData.sha,
        filesPaths: commitData.files || [],
        language: commitData.language,
      },
    });

    // Find similar memories and create edges
    await this.inferRelationships(memory);

    return memory;
  }

  // Create a memory node from decision/insight
  async createMemory(data: {
    type: IMemoryNode['type'];
    title: string;
    summary: string;
    source: IMemoryNode['source'];
    metadata?: any;
  }): Promise<IMemoryNode> {
    const memory = await MemoryNode.create({
      ...data,
      timestamp: new Date(),
      importance: 0.7, // Default for manually created
    });

    await this.inferRelationships(memory);
    return memory;
  }

  // Infer relationships for a new node
  private async inferRelationships(newNode: IMemoryNode): Promise<void> {
    // 1. Temporal relationships (refines recent similar nodes)
    const recentNodes = await MemoryNode.find({
      _id: { $ne: newNode._id },
      timestamp: {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      },
    }).limit(50);

    for (const oldNode of recentNodes) {
      // Simple similarity based on title/summary text overlap
      const similarity = this.calculateTextSimilarity(
        newNode.title + ' ' + newNode.summary,
        oldNode.title + ' ' + oldNode.summary
      );

      if (similarity > 0.6) {
        await MemoryEdge.create({
          from: newNode._id.toString(),
          to: oldNode._id.toString(),
          relation: 'similar_to',
          weight: similarity,
          metadata: { inferredBy: 'semantic' },
        });
      }

      // Temporal refines relationship
      if (similarity > 0.5 && newNode.timestamp > oldNode.timestamp) {
        await MemoryEdge.create({
          from: newNode._id.toString(),
          to: oldNode._id.toString(),
          relation: 'refines',
          weight: 0.7,
          metadata: { inferredBy: 'temporal' },
        });
      }
    }

    // 2. Same repository relationships (depends_on)
    if (newNode.metadata?.repoName) {
      const sameRepoNodes = await MemoryNode.find({
        _id: { $ne: newNode._id },
        'metadata.repoName': newNode.metadata.repoName,
      }).limit(20);

      for (const node of sameRepoNodes) {
        if (newNode.timestamp > node.timestamp) {
          await MemoryEdge.create({
            from: newNode._id.toString(),
            to: node._id.toString(),
            relation: 'depends_on',
            weight: 0.6,
            metadata: { inferredBy: 'temporal' },
          });
        }
      }
    }
  }

  // Simple text similarity (cosine similarity would be better)
  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  // Calculate importance based on commit metadata
  private calculateImportance(commitData: any): number {
    let score = 0.5; // Base score

    // More files changed = more important
    if (commitData.files?.length > 5) score += 0.1;
    if (commitData.files?.length > 10) score += 0.1;

    // Recent commits more important
    const daysSince = (Date.now() - new Date(commitData.timestamp).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < 7) score += 0.2;
    else if (daysSince < 30) score += 0.1;

    return Math.min(score, 1);
  }

  // Get graph data with filters
  async getGraph(options: GraphQueryOptions = {}): Promise<GraphData> {
    const { focus = 'last_30_days', depth = 2, types, minImportance = 0.3 } = options;

    // Calculate time filter
    let timeFilter: any = {};
    if (focus === 'last_7_days') {
      timeFilter = { timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } };
    } else if (focus === 'last_30_days') {
      timeFilter = { timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } };
    }

    // Build query
    const query: any = {
      ...timeFilter,
      importance: { $gte: minImportance },
    };

    if (types && types.length > 0) {
      query.type = { $in: types };
    }

    // Get nodes
    const nodes = await MemoryNode.find(query)
      .sort({ importance: -1, timestamp: -1 })
      .limit(100)
      .lean();

    const nodeIds = nodes.map(n => n._id.toString());

    // Get edges between these nodes
    const edges = await MemoryEdge.find({
      from: { $in: nodeIds },
      to: { $in: nodeIds },
    }).lean();

    // Detect clusters (simple grouping by type and repo)
    const clusters = this.detectClusters(nodes);

    return {
      nodes: nodes.map(n => ({
        id: n._id.toString(),
        type: n.type,
        label: n.title,
        summary: n.summary,
        importance: n.importance,
        timestamp: n.timestamp,
        metadata: n.metadata,
      })),
      edges: edges.map(e => ({
        from: e.from,
        to: e.to,
        relation: e.relation,
        weight: e.weight,
      })),
      clusters,
    };
  }

  // Simple clustering by type and repository
  private detectClusters(nodes: any[]): { [key: string]: string[] } {
    const clusters: { [key: string]: string[] } = {};

    // Group by repository
    nodes.forEach(node => {
      if (node.metadata?.repoName) {
        const clusterKey = `repo:${node.metadata.repoName}`;
        if (!clusters[clusterKey]) clusters[clusterKey] = [];
        clusters[clusterKey].push(node._id.toString());
      }
    });

    // Group by type
    nodes.forEach(node => {
      const clusterKey = `type:${node.type}`;
      if (!clusters[clusterKey]) clusters[clusterKey] = [];
      clusters[clusterKey].push(node._id.toString());
    });

    return clusters;
  }

  // Apply decay to old nodes
  async applyDecay(): Promise<void> {
    const decayFactor = 0.99;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    await MemoryNode.updateMany(
      { timestamp: { $lt: thirtyDaysAgo } },
      { $mul: { importance: decayFactor } }
    );

    await MemoryEdge.updateMany(
      { createdAt: { $lt: thirtyDaysAgo } },
      { $mul: { weight: decayFactor } }
    );
  }

  // Track node access
  async trackAccess(nodeId: string): Promise<void> {
    await MemoryNode.findByIdAndUpdate(nodeId, {
      $inc: { accessCount: 1 },
      $set: { lastAccessed: new Date() },
    });
  }

  // Find patterns for insights
  async findPatterns(): Promise<string[]> {
    const insights: string[] = [];

    // Find repeated cycles
    const repeatedTypes = await MemoryNode.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $match: { count: { $gt: 10 } } },
      { $sort: { count: -1 } },
    ]);

    for (const item of repeatedTypes) {
      insights.push(`You have ${item.count} ${item._id} memories - this might indicate a pattern.`);
    }

    // Find contradiction chains
    const contradictions = await MemoryEdge.find({ relation: 'contradicts' }).limit(5);
    if (contradictions.length > 0) {
      insights.push(`Found ${contradictions.length} contradicting decisions - review may be needed.`);
    }

    return insights;
  }
}

export default new GraphService();
