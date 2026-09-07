# 🤖 AI Connector

A smart connector that intelligently routes your requests to the best AI service (ChatGPT, Claude, Groq, etc.) based on task type and current availability. Automatically falls back to alternative providers when rate limits are reached.

## ✨ Features

- **Intelligent Routing**: Analyzes your task and routes it to the most suitable AI provider
- **Automatic Failover**: Seamlessly switches to alternative AI services when rate limits are hit
- **Multi-Provider Support**: ChatGPT (OpenAI), Claude (Anthropic), Groq, Cohere, Llama
- **Rate Limit Management**: Tracks and manages rate limits across all providers
- **ChatGPT Integration**: Works as a ChatGPT plugin
- **Claude Integration**: Works as a Claude tool
- **Analytics**: Track costs, latency, and provider performance
- **TypeScript**: Full type safety and IDE support

## 🚀 Quick Start

### 1. Installation

```bash
git clone https://github.com/ajayvaratharajandevwork/ai-connector.git
cd ai-connector
npm install
```

### 2. Configuration

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Add your API keys:

```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GROQ_API_KEY=gsk-...

OPENAI_RATE_LIMIT=3
ANTHROPIC_RATE_LIMIT=50
GROQ_RATE_LIMIT=30
```

### 3. Build & Run

```bash
# Build TypeScript
npm run build

# Start the server
npm start

# Or run in development mode
npm run dev
```

The server will start on `http://localhost:3000`

## 📖 Usage

### As a Library

```typescript
import { ConnectorManager, TaskCategory } from 'ai-connector';

const connector = new ConnectorManager();

const response = await connector.executeRequest({
  prompt: 'Write a Python function for factorial',
  taskCategory: TaskCategory.CODE_GENERATION,
  maxTokens: 500
});

console.log(response.content);
console.log(`Provider: ${response.provider}`);
console.log(`Cost: $${response.cost}`);
```

### ChatGPT Plugin

#### Installation in ChatGPT

1. Go to ChatGPT → Plugins → Plugin store
2. Click "Develop your own plugin"
3. Enter your connector URL: `https://your-connector-url.com`
4. Copy the manifest from `.well-known/ai-plugin.json`

#### API Endpoints

- `GET /.well-known/ai-plugin.json` - Plugin manifest
- `POST /chatgpt/request` - Send request
- `GET /chatgpt/status` - Get service status
- `POST /chatgpt/suggest` - Get provider suggestion

#### Example Request

```bash
curl -X POST http://localhost:3000/chatgpt/request \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Write a Python decorator",
    "context": {
      "maxTokens": 1000,
      "temperature": 0.7
    }
  }'
```

### Claude Tool

#### Installation

Add to your Claude system prompt or use as a tool:

```json
{
  "name": "ai_connector",
  "url": "https://your-connector-url.com/claude/tool-call"
}
```

#### Tool Definition

```bash
curl http://localhost:3000/claude/tool-definition
```

#### Example Usage

```bash
curl -X POST http://localhost:3000/claude/tool-call \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Analyze this text",
    "task_type": "text_analysis",
    "max_tokens": 1000
  }'
```

## 🎯 Task Categories

The connector optimizes routing based on task type:

- **CODE_GENERATION** - Writing code, debugging
- **REASONING** - Logic, problem-solving, analysis
- **TEXT_ANALYSIS** - Summarization, extraction
- **CREATIVE_WRITING** - Stories, content creation
- **DATA_PROCESSING** - Parsing, transforming data
- **IMAGE_GENERATION** - Creating images
- **GENERAL** - Default for unspecified tasks

## 📊 Monitoring

### Check Rate Limits

```bash
curl http://localhost:3000/api/rate-limits
```

Response:
```json
[
  {
    "provider": "openai",
    "requestsUsed": 2,
    "requestsLimit": 3,
    "resetTime": "2024-01-15T14:30:00Z",
    "isLimited": false
  }
]
```

### Get Metrics

```bash
curl http://localhost:3000/api/metrics
```

Response:
```json
{
  "totalRequests": 15,
  "averageCost": 0.0045,
  "averageLatency": 1250,
  "providerStats": {
    "openai": { "count": 10, "totalCost": 0.045, "totalLatency": 12500 },
    "claude": { "count": 5, "totalCost": 0.0225, "totalLatency": 6250 }
  }
}
```

### Request History

```bash
curl "http://localhost:3000/api/request-history?limit=10"
```

## 🔧 Configuration

### Fallback Strategy

Customize fallback behavior:

```typescript
const connector = new ConnectorManager({
  maxRetries: 3,
  priorityOrder: [AIProvider.OPENAI, AIProvider.CLAUDE, AIProvider.GROQ],
  retryDelay: 1000, // ms
  fallbackOnRateLimit: true,
  fallbackOnError: true
});
```

### Provider Capabilities

Each provider is rated on:
- **codeGeneration** (1-10)
- **reasoning** (1-10)
- **creativity** (1-10)
- **speed** (1-10)
- **costEfficiency** (1-10)
- **contextWindow** (tokens)

## 🏗️ Architecture

```
src/
├── types/              # TypeScript interfaces
├── config/             # Provider configuration
├── providers/          # Provider implementations
├── selector/           # AI selection logic
├── manager/            # Main ConnectorManager
├── plugins/            # ChatGPT & Claude plugins
├── server/             # Express server & routes
└── index.ts            # Main entry point
```

## 📝 API Reference

### ConnectorManager

```typescript
// Execute request through optimal provider
await connector.executeRequest(request: AIRequest): Promise<AIResponse>

// Get rate limit status
connector.getRateLimitStatus(): RateLimitStatus[]

// Get request history
connector.getRequestHistory(): AIResponse[]

// Get metrics
connector.getMetrics(): Metrics
```

## 🔐 Security

- API keys stored locally in `.env` (never committed)
- HTTPS recommended for production
- Add authentication middleware for API endpoints
- Validate all inputs before processing

## 📦 Deployment

### Docker

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables

```env
PORT=3000
NODE_ENV=production
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
GROQ_API_KEY=...
API_URL=https://your-domain.com
PLUGIN_URL=https://your-domain.com
```

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues or questions:
- Open a GitHub issue
- Check existing documentation
- Review example usage in `src/index.ts`

## 🗺️ Roadmap

- [ ] Support for more providers (Cohere, Llama, etc.)
- [ ] Web dashboard for monitoring
- [ ] Advanced caching layer
- [ ] Custom provider plugins
- [ ] Cost optimization strategies
- [ ] A/B testing capabilities
- [ ] Webhook support for events

---

**Made with ❤️ by ajayvaratharajandevwork**
