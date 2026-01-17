import graphService from './graph.service';
import githubService from './github.service';

class MemoryIngestionService {
  // Ingest GitHub commits as memory nodes
  async ingestGitHubCommits(username: string, limit: number = 50): Promise<void> {
    try {
      const repos = await githubService.getUserRepositories(username, 10);
      
      for (const repo of repos) {
        const [owner, repoName] = repo.full_name.split('/');
        const commits = await githubService.getRepositoryCommits(owner, repoName, limit);

        for (const commit of commits) {
          // Check if commit already exists
          const { MemoryNode } = await import('../models/Memory');
          const existing = await MemoryNode.findOne({
            'metadata.commitSha': commit.sha,
          });

          if (!existing) {
            await graphService.createMemoryFromCommit({
              message: commit.commit.message,
              timestamp: commit.commit.author.date,
              repo: repo.name,
              sha: commit.sha,
              language: repo.language,
              files: [], // Would need to fetch file changes
            });
          }
        }
      }

      console.log(`✅ Ingested commits for ${username}`);
    } catch (error) {
      console.error('Failed to ingest GitHub commits:', error);
    }
  }

  // Ingest repository creation as decision node
  async ingestRepositoryAsDecision(repo: any): Promise<void> {
    await graphService.createMemory({
      type: 'decision',
      title: `Created repository: ${repo.name}`,
      summary: repo.description || 'No description provided',
      source: 'github',
      metadata: {
        repoName: repo.name,
        language: repo.language,
        tags: repo.topics || [],
      },
    });
  }

  // Background job to sync memories
  async syncMemories(username: string): Promise<void> {
    await this.ingestGitHubCommits(username);
    await graphService.applyDecay();
  }
}

export default new MemoryIngestionService();
