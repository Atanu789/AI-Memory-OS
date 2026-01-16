# AI Memory OS - Server

Backend TypeScript server for AI Memory OS cognitive workspace.

## 🚀 Features

- **RESTful API** - Express.js with TypeScript
- **WebSocket Support** - Real-time updates for insights and agent activity
- **Agent System** - Background agents for pattern detection and insight generation
- **Memory Management** - Store and query developer memories
- **GitHub Intelligence** - Analyze commit patterns and productivity
- **Brain Interface** - Natural language querying of memory

## 📁 Project Structure

```
server/
├── src/
│   ├── agents/           # Background agents
│   │   ├── BaseAgent.ts
│   │   ├── InsightAgent.ts
│   │   ├── PatternDetectorAgent.ts
│   │   └── AgentOrchestrator.ts
│   ├── controllers/      # Request handlers
│   │   ├── memory.controller.ts
│   │   ├── insight.controller.ts
│   │   ├── github.controller.ts
│   │   └── brain.controller.ts
│   ├── services/         # Business logic
│   │   ├── memory.service.ts
│   │   ├── insight.service.ts
│   │   ├── dashboard.service.ts
│   │   ├── github.service.ts
│   │   └── brain.service.ts
│   ├── routes/           # API routes
│   │   ├── memory.routes.ts
│   │   ├── insight.routes.ts
│   │   ├── github.routes.ts
│   │   └── brain.routes.ts
│   ├── middleware/       # Express middleware
│   │   ├── error.middleware.ts
│   │   └── logger.middleware.ts
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/            # Utility functions
│   │   └── asyncHandler.ts
│   └── index.ts          # Server entry point
├── .env.example
├── .gitignore
├── package.json
└── tsconfig.json
```

## 🛠️ Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create .env file:**
   ```bash
   cp .env.example .env
   ```

3. **Run in development:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## 📡 API Endpoints

### Memory
- `GET /api/memory` - Get all memories
- `GET /api/memory/:id` - Get memory by ID
- `POST /api/memory` - Create memory
- `PUT /api/memory/:id` - Update memory
- `DELETE /api/memory/:id` - Delete memory
- `GET /api/memory/graph` - Get memory graph
- `GET /api/memory/search?q=query` - Search memories
- `GET /api/memory/dashboard` - Get dashboard summary

### Insights
- `GET /api/insights` - Get all insights
- `GET /api/insights/:id` - Get insight by ID
- `POST /api/insights` - Create insight
- `PATCH /api/insights/:id/read` - Mark as read
- `DELETE /api/insights/:id` - Delete insight
- `GET /api/insights/unread-count` - Get unread count

### GitHub
- `GET /api/github/summary` - Get GitHub intelligence

### Brain
- `POST /api/brain/ask` - Ask a question
- `GET /api/brain/conversation/:id` - Get conversation history

### System
- `GET /health` - Health check
- `GET /api/agents/status` - Agent status

## 🤖 Agents

Agents run automatically in the background:

- **InsightAgent** - Analyzes memories every 5 minutes
- **PatternDetectorAgent** - Detects patterns every 10 minutes

## 🔌 WebSocket Events

Connect to `ws://localhost:3000` for real-time updates:

```json
{
  "type": "new-insight",
  "data": { ... }
}
```

## 📦 Tech Stack

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **ws** - WebSocket support
- **uuid** - ID generation
- **dotenv** - Environment variables
- **cors** - CORS support
