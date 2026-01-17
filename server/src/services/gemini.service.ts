import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { GitHubRepo, GitHubActivity, GitHubStats } from './github.service';

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;

  constructor() {
    if (process.env.GEMINI_API_KEY) {
      try {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Use gemini-1.5-flash-latest or fall back to disabling if model not available
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
      } catch (error) {
        console.error('Failed to initialize Gemini AI:', error);
        this.model = null;
      }
    }
  }

  isConfigured(): boolean {
    return this.model !== null;
  }

  async generateInsights(stats: GitHubStats): Promise<string[]> {
    if (!this.model) {
      throw new Error('Gemini AI not configured. Please set GEMINI_API_KEY in .env');
    }

    const prompt = `Analyze this GitHub developer's statistics and provide 3-4 concise, actionable insights:
    
Statistics:
- Total Repositories: ${stats.totalRepos}
- Total Stars: ${stats.totalStars}
- Total Forks: ${stats.totalForks}
- Recent Commits: ${stats.totalCommits}
- Top Languages: ${Object.entries(stats.topLanguages).map(([lang, count]) => `${lang} (${count})`).join(', ')}
- Recent Activity Types: ${Array.from(new Set(stats.recentActivity.map(a => a.type))).join(', ')}

Provide insights as a JSON array of strings, each insight should be 1-2 sentences focusing on:
1. Development patterns
2. Technology preferences
3. Collaboration level
4. Recommendations for growth

Format: ["insight 1", "insight 2", "insight 3"]`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON array from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: split by newlines
      return text.split('\n').filter(line => line.trim().length > 0).slice(0, 4);
    } catch (error: any) {
      console.error('Error generating insights:', error.message);
      return [
        'Active developer with consistent contributions',
        'Diverse technology stack showing adaptability',
        'Growing repository collection with community engagement'
      ];
    }
  }

  async generateActivitySummary(activities: GitHubActivity[]): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini AI not configured');
    }

    const activitySummary = activities.slice(0, 10).map(a => 
      `${a.type} in ${a.repo.name} at ${new Date(a.created_at).toLocaleDateString()}`
    ).join('\n');

    const prompt = `Summarize this developer's recent GitHub activity in 2-3 sentences:

${activitySummary}

Focus on: What they've been working on, types of contributions, and overall productivity.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error: any) {
      console.error('Error generating activity summary:', error.message);
      return 'Active developer contributing regularly to various projects with focus on code improvements and collaboration.';
    }
  }

  async analyzeRepositories(repos: GitHubRepo[]): Promise<{
    categories: { [key: string]: GitHubRepo[] };
    recommendations: string[];
  }> {
    if (!this.model) {
      throw new Error('Gemini AI not configured');
    }

    // Categorize by language
    const categories: { [key: string]: GitHubRepo[] } = {};
    repos.forEach(repo => {
      const lang = repo.language || 'Other';
      if (!categories[lang]) {
        categories[lang] = [];
      }
      categories[lang].push(repo);
    });

    const repoList = repos.map(r => 
      `${r.name}: ${r.description || 'No description'} (${r.language || 'N/A'})`
    ).join('\n');

    const prompt = `Analyze these GitHub repositories and provide 3 actionable recommendations:

${repoList}

Format as JSON array: ["recommendation 1", "recommendation 2", "recommendation 3"]`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      const recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : [
        'Consider adding more documentation to your repositories',
        'Explore new technologies to diversify your skill set',
        'Increase collaboration through open source contributions'
      ];

      return { categories, recommendations };
    } catch (error: any) {
      console.error('Error analyzing repositories:', error.message);
      return {
        categories,
        recommendations: [
          'Keep your repositories well-documented',
          'Maintain consistent commit patterns',
          'Engage with the developer community'
        ]
      };
    }
  }

  async chat(message: string, context?: any): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini AI not configured');
    }

    const contextString = context ? `\n\nContext:\n${JSON.stringify(context, null, 2)}` : '';
    const prompt = `You are an AI assistant helping a developer understand their GitHub data and coding patterns. Answer the following question:${contextString}

Question: ${message}

Provide a helpful, concise response.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error: any) {
      console.error('Error in chat:', error.message);
      return 'I apologize, but I encountered an error processing your request. Please try again.';
    }
  }

  async generateTimelineInsight(activities: GitHubActivity[], period: string): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini AI not configured');
    }

    const activityTypes = activities.reduce((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const prompt = `Analyze this ${period} of GitHub activity and provide a brief insight (2-3 sentences):

Activity breakdown:
${Object.entries(activityTypes).map(([type, count]) => `${type}: ${count}`).join('\n')}

Focus on productivity patterns and noteworthy trends.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error: any) {
      console.error('Error generating timeline insight:', error.message);
      return `Active ${period} with ${activities.length} total activities showing consistent development engagement.`;
    }
  }

  async analyzeRepositoryPattern(
    repoName: string,
    commits: any[],
    language: string | null
  ): Promise<{
    whatYouDid: string[];
    whenYouDid: string;
    patterns: string[];
    strengths: string[];
    weaknesses: string[];
  }> {
    if (!this.model) {
      return {
        whatYouDid: ['Repository analysis unavailable - Gemini AI not configured'],
        whenYouDid: 'Analysis unavailable',
        patterns: ['No patterns analyzed'],
        strengths: ['Analysis unavailable'],
        weaknesses: ['Analysis unavailable'],
      };
    }

    const commitSummary = commits.slice(0, 20).map(c => 
      `${new Date(c.commit.author.date).toLocaleDateString()}: ${c.commit.message.split('\n')[0]}`
    ).join('\n');

    const prompt = `Analyze this developer's work on the repository "${repoName}" (${language || 'Unknown language'}):

Recent commits:
${commitSummary}

Provide analysis in JSON format:
{
  "whatYouDid": ["action 1", "action 2", "action 3"],
  "whenYouDid": "time period description",
  "patterns": ["pattern 1", "pattern 2", "pattern 3"],
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["area 1", "area 2", "area 3"]
}

Focus on:
- What: Main types of work (features, fixes, refactoring, etc.)
- When: Activity frequency and timing patterns
- Patterns: Coding habits, commit styles, work rhythms
- Strengths: What they do well (code quality, consistency, etc.)
- Weaknesses: Areas for improvement (test coverage, documentation, etc.)

Be specific and actionable.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return {
          whatYouDid: analysis.whatYouDid || [],
          whenYouDid: analysis.whenYouDid || 'Activity period unknown',
          patterns: analysis.patterns || [],
          strengths: analysis.strengths || [],
          weaknesses: analysis.weaknesses || [],
        };
      }

      return {
        whatYouDid: ['Analysis parsing failed'],
        whenYouDid: 'Unknown period',
        patterns: [],
        strengths: [],
        weaknesses: [],
      };
    } catch (error: any) {
      console.error('Error analyzing repository:', error.message);
      return {
        whatYouDid: ['Recent commits and updates to the repository'],
        whenYouDid: 'Over the past few weeks',
        patterns: ['Regular commit activity'],
        strengths: ['Consistent contributions'],
        weaknesses: ['Analysis unavailable due to API error'],
      };
    }
  }
}

export default new GeminiService();
