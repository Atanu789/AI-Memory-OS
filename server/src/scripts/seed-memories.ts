import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MemoryNode, MemoryEdge } from '../models/Memory';

dotenv.config();

async function seedMemories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Connected to MongoDB');

    // Clear existing memories
    await MemoryNode.deleteMany({});
    await MemoryEdge.deleteMany({});
    console.log('🗑️  Cleared existing memories');

    // Create sample memory nodes
    const memories = await MemoryNode.create([
      {
        type: 'concept',
        title: 'Event-Driven Architecture',
        summary: 'Decision to use event-driven architecture for better scalability and decoupling',
        source: 'manual',
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        importance: 0.9,
        metadata: { tags: ['architecture', 'design'] },
      },
      {
        type: 'code_event',
        title: 'Implement OAuth authentication',
        summary: 'Added GitHub OAuth authentication with Passport.js',
        source: 'github',
        timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        importance: 0.85,
        metadata: { repoName: 'ai-memory-os', language: 'TypeScript' },
      },
      {
        type: 'decision',
        title: 'Use MongoDB for session storage',
        summary: 'Chose MongoDB with connect-mongo for persistent session management',
        source: 'manual',
        timestamp: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000),
        importance: 0.8,
        metadata: { tags: ['database', 'sessions'] },
      },
      {
        type: 'code_event',
        title: 'Add Gemini AI integration',
        summary: 'Integrated Google Gemini AI for generating insights and analysis',
        source: 'github',
        timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        importance: 0.9,
        metadata: { repoName: 'ai-memory-os', language: 'TypeScript' },
      },
      {
        type: 'insight',
        title: 'AI services should fail gracefully',
        summary: 'Learned that AI API calls should be wrapped in try-catch to prevent breaking the application',
        source: 'agent',
        timestamp: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        importance: 0.75,
        metadata: { tags: ['best-practice', 'error-handling'] },
      },
      {
        type: 'mistake',
        title: 'OAuth blank screen bug',
        summary: 'OAuth flow initially showed blank screen - needed to use external browser for Electron',
        source: 'agent',
        timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        importance: 0.7,
        metadata: { tags: ['debugging', 'electron'] },
      },
      {
        type: 'code_event',
        title: 'Create knowledge graph system',
        summary: 'Built memory nodes and edges system for knowledge representation',
        source: 'github',
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        importance: 0.95,
        metadata: { repoName: 'ai-memory-os', language: 'TypeScript' },
      },
      {
        type: 'decision',
        title: 'Separate MindMap and Repositories pages',
        summary: 'Decided to keep original D3 visualization in MindMap and create separate Repositories page',
        source: 'manual',
        timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        importance: 0.6,
        metadata: { tags: ['ui', 'architecture'] },
      },
      {
        type: 'insight',
        title: 'Dashboard should focus on GitHub data',
        summary: 'Realized dashboard works better with prominent GitHub stats rather than AI insights',
        source: 'agent',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        importance: 0.65,
        metadata: { tags: ['ux', 'design'] },
      },
      {
        type: 'concept',
        title: 'Memory decay system',
        summary: 'Implement temporal decay where old memories gradually lose importance',
        source: 'manual',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        importance: 0.8,
        metadata: { tags: ['memory', 'algorithm'] },
      },
    ]);

    console.log(`✅ Created ${memories.length} memory nodes`);

    // Create relationships
    const edges = await MemoryEdge.create([
      // OAuth relates to authentication
      {
        from: memories[1]._id.toString(),
        to: memories[2]._id.toString(),
        relation: 'depends_on',
        weight: 0.8,
        metadata: { inferredBy: 'temporal' },
      },
      // AI integration refines architecture
      {
        from: memories[3]._id.toString(),
        to: memories[0]._id.toString(),
        relation: 'refines',
        weight: 0.7,
        metadata: { inferredBy: 'semantic' },
      },
      // Insight from AI integration
      {
        from: memories[4]._id.toString(),
        to: memories[3]._id.toString(),
        relation: 'leads_to',
        weight: 0.9,
        metadata: { inferredBy: 'temporal' },
      },
      // Mistake led to insight
      {
        from: memories[5]._id.toString(),
        to: memories[1]._id.toString(),
        relation: 'refines',
        weight: 0.8,
        metadata: { inferredBy: 'temporal' },
      },
      // Knowledge graph related to architecture
      {
        from: memories[6]._id.toString(),
        to: memories[0]._id.toString(),
        relation: 'similar_to',
        weight: 0.75,
        metadata: { inferredBy: 'semantic' },
      },
      // UI decision
      {
        from: memories[7]._id.toString(),
        to: memories[8]._id.toString(),
        relation: 'leads_to',
        weight: 0.7,
        metadata: { inferredBy: 'temporal' },
      },
      // Memory decay concept
      {
        from: memories[9]._id.toString(),
        to: memories[6]._id.toString(),
        relation: 'depends_on',
        weight: 0.85,
        metadata: { inferredBy: 'semantic' },
      },
    ]);

    console.log(`✅ Created ${edges.length} edges`);
    console.log('✨ Database seeded successfully!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedMemories();
