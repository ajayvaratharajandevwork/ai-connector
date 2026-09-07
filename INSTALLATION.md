# Installation Guide for ChatGPT & Claude

## 🔌 ChatGPT Plugin Setup

### Step 1: Deploy Your Connector

First, deploy the connector to a server accessible from the internet (Vercel, Heroku, AWS, etc.):

```bash
# Build
npm run build

# Deploy to your hosting provider
# Example with Vercel:
vercel deploy
```

### Step 2: Get Plugin URL

Your plugin will be available at: `https://your-domain.com/.well-known/ai-plugin.json`

### Step 3: Add Plugin to ChatGPT

1. Open ChatGPT
2. Go to "Plugins" → "Plugin store"
3. Click "Develop your own plugin"
4. Enter your domain: `https://your-domain.com`
5. ChatGPT will fetch the manifest automatically
6. Click "Install" or "Verify and install"
7. Start using in new conversations!

### Using in ChatGPT

```
You: "Can you use the AI Connector to write a Python function for sorting?"

ChatGPT will automatically:
1. Detect task type (code_generation)
2. Route to the best provider (OpenAI/Claude)
3. Return optimized response
```

## 🤖 Claude Integration

### Method 1: As a Tool in Claude Web

1. In Claude, go to "Settings" → "Tools" or "Extensions"
2. Add the tool endpoint: `https://your-domain.com/claude/tool-definition`
3. Configure API key if required
4. Start using in conversations

### Method 2: Programmatically with Claude API

```python
import anthropic

client = anthropic.Anthropic(api_key="sk-ant-...")

tools = [
    {
        "name": "ai_connector",
        "description": "Route requests to optimal AI provider",
        "input_schema": {
            "type": "object",
            "properties": {
                "message": {"type": "string"},
                "task_type": {"type": "string"}
            },
            "required": ["message"]
        }
    }
]

response = client.messages.create(
    model="claude-3-opus-20240229",
    max_tokens=1024,
    tools=tools,
    messages=[
        {
            "role": "user",
            "content": "Use the AI connector to analyze this text"
        }
    ]
)
```

### Method 3: As Custom Instructions

Add to Claude's custom instructions:

```
You have access to an AI Connector tool at https://your-domain.com/claude/tool-call

When appropriate, use this tool to route complex tasks to specialized AI providers.
Always check the provider status before making requests.
Report which provider was used for each task.
```

## 🔑 API Key Management

### Environment Setup

```env
# .env file (NEVER commit this!)
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...
GROQ_API_KEY=gsk-...

# Rate limits
OPENAI_RATE_LIMIT=3
ANTHROPIC_RATE_LIMIT=50
GROQ_RATE_LIMIT=30

# Server config
PORT=3000
API_URL=https://your-domain.com
PLUGIN_URL=https://your-domain.com
```

### Obtaining API Keys

**OpenAI:**
1. Go to https://platform.openai.com
2. Click "API keys" in sidebar
3. Create new secret key
4. Copy and add to `.env`

**Anthropic (Claude):**
1. Go to https://console.anthropic.com
2. Click "API Keys"
3. Create new API key
4. Copy and add to `.env`

**Groq:**
1. Go to https://console.groq.com
2. Create API key
3. Copy and add to `.env`

## 📋 Verification Checklist

- [ ] All API keys added to `.env`
- [ ] Server running on correct port
- [ ] Plugin manifest accessible at `/.well-known/ai-plugin.json`
- [ ] OpenAPI spec available at `/openapi.json`
- [ ] Health check passes: `GET /health`
- [ ] ChatGPT can discover plugin
- [ ] Claude recognizes tool definition
- [ ] Rate limits working correctly
- [ ] Fallback to secondary provider working

## 🧪 Testing

### Test ChatGPT Integration

```bash
# Check plugin manifest
curl https://your-domain.com/.well-known/ai-plugin.json

# Test request
curl -X POST https://your-domain.com/chatgpt/request \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Write Hello World in Python",
    "context": {"maxTokens": 100}
  }'

# Check status
curl https://your-domain.com/chatgpt/status
```

### Test Claude Integration

```bash
# Get tool definition
curl https://your-domain.com/claude/tool-definition

# Make tool call
curl -X POST https://your-domain.com/claude/tool-call \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Analyze this content",
    "task_type": "text_analysis"
  }'

# Check status
curl https://your-domain.com/claude/status
```

## 🚨 Troubleshooting

### Plugin Not Showing in ChatGPT

1. Verify HTTPS is enabled (required by ChatGPT)
2. Check manifest is accessible and valid JSON
3. Ensure `logo_url` and other URLs are valid
4. Wait a few minutes for ChatGPT to refresh
5. Try incognito mode

### Claude Tool Not Working

1. Verify API endpoint is accessible
2. Check tool definition JSON is valid
3. Ensure input_schema matches expectations
4. Review Claude API documentation
5. Check connector logs for errors

### Rate Limit Errors

1. Check current usage: `GET /api/rate-limits`
2. Verify `OPENAI_RATE_LIMIT` and `ANTHROPIC_RATE_LIMIT` in `.env`
3. Fallback should work automatically
4. Monitor metrics: `GET /api/metrics`

### High Latency

1. Check which provider is being used
2. Consider adding faster providers (Groq)
3. Reduce `maxTokens` if possible
4. Monitor `GET /api/metrics` for trends

## 📚 Additional Resources

- [ChatGPT Plugin Documentation](https://platform.openai.com/docs/plugins/)
- [Claude API Guide](https://docs.anthropic.com/claude/reference/)
- [OpenAI API Docs](https://platform.openai.com/docs/api-reference)
- [Anthropic API Docs](https://docs.anthropic.com)

## 💬 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review logs: `npm run dev` for local debugging
3. Open a GitHub issue with details
4. Include error messages and `.env` (redacted keys)
