# 🚀 Quick Deployment Guide

## Deploy to Vercel (Fastest - 2 minutes)

```bash
npm install -g vercel
vercel
```

Follow prompts, add env vars:
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GROQ_API_KEY` (optional)

**Your URL will be:** `https://ai-connector-xxx.vercel.app`

---

## Deploy to Heroku (Free option ending)

```bash
npm install -g heroku
heroku login
heroku create ai-connector-yourname
heroku config:set OPENAI_API_KEY=sk-...
heroku config:set ANTHROPIC_API_KEY=sk-ant-...
git push heroku main
```

**Your URL will be:** `https://ai-connector-yourname.herokuapp.com`

---

## Deploy to Railway (Recommended - $5/month)

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select this repository
4. Add environment variables
5. Deploy

**Your URL will be:** `https://your-project.up.railway.app`

---

## Deploy to Render (Free tier available)

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Set build command: `npm run build`
5. Set start command: `npm start`
6. Add environment variables
7. Deploy

**Your URL will be:** `https://ai-connector-xxx.onrender.com`

---

## Using Your Deployed URL

### Add to ChatGPT

1. Copy your deployed URL (e.g., `https://ai-connector-xxx.vercel.app`)
2. Open ChatGPT
3. Go to "Plugins" → "Plugin store"
4. Click "Develop your own plugin"
5. Enter: `https://ai-connector-xxx.vercel.app`
6. Install!

### Add to Claude

Add this to your Claude custom instructions:

```
I have access to an AI Connector at: https://ai-connector-xxx.vercel.app

Tool endpoints:
- Tool definition: /claude/tool-definition
- Process request: POST /claude/tool-call
- Status: /claude/status

Use this tool to route complex tasks to optimal AI providers.
```

---

## Test Your Deployment

```bash
# Check health
curl https://your-deployed-url.com/health

# Get plugin manifest
curl https://your-deployed-url.com/.well-known/ai-plugin.json

# Test request
curl -X POST https://your-deployed-url.com/chatgpt/request \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","context":{}}'
```

---

## Environment Variables to Set

| Variable | Required | Example |
|----------|----------|---------|
| OPENAI_API_KEY | Yes | sk-proj-... |
| ANTHROPIC_API_KEY | Yes | sk-ant-... |
| GROQ_API_KEY | No | gsk-... |
| OPENAI_RATE_LIMIT | No | 3 |
| ANTHROPIC_RATE_LIMIT | No | 50 |
| GROQ_RATE_LIMIT | No | 30 |
| NODE_ENV | No | production |
| PORT | No | 3000 |

---

## Common Issues

**Plugin not found in ChatGPT?**
- Ensure HTTPS is enabled
- Wait 5 minutes for caching
- Try incognito mode
- Check URL is accessible: `curl https://your-url.com/health`

**Rate limits not working?**
- Verify env vars are set: `echo $OPENAI_API_KEY`
- Check logs on deployment platform
- Make test requests and monitor

**Claude tool not responding?**
- Verify endpoint is live
- Check tool definition returns valid JSON
- Review deployment logs

---

## Next: Use Your Connector!

Once deployed, you can:
✅ Use in ChatGPT as a plugin
✅ Use in Claude as a tool
✅ Call API directly from your app
✅ Monitor usage via `/api/metrics`

Enjoy! 🎉
