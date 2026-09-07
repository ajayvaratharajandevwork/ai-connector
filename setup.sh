#!/bin/bash

# AI Connector - Quick Setup & Deploy Script

echo "🚀 AI Connector Setup"
echo "==================="
echo ""

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Create .env file if doesn't exist
if [ ! -f .env ]; then
    echo "🔧 Creating .env file..."
    cat > .env << EOF
# OpenAI (ChatGPT)
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
OPENAI_RATE_LIMIT=3

# Anthropic (Claude)
ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE
ANTHROPIC_RATE_LIMIT=50

# Groq (Optional)
GROQ_API_KEY=gsk-YOUR_KEY_HERE
GROQ_RATE_LIMIT=30

# Server
PORT=3000
NODE_ENV=development
EOF
    echo "✅ .env file created"
    echo "⚠️  Please add your API keys to .env"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🔨 Building project..."
npm run build
echo "✅ Build complete"
echo ""

echo "📋 Next Steps:"
echo ""
echo "1️⃣  Add your API keys to .env:"
echo "   - Get OpenAI key: https://platform.openai.com/api-keys"
echo "   - Get Claude key: https://console.anthropic.com"
echo ""
echo "2️⃣  Run locally:"
echo "   npm run dev"
echo ""
echo "3️⃣  Deploy to Vercel (recommended):"
echo "   npm install -g vercel"
echo "   vercel"
echo ""
echo "4️⃣  Add to ChatGPT:"
echo "   - Open ChatGPT → Plugins → Plugin store"
echo "   - Click 'Develop your own plugin'"
echo "   - Enter your deployed URL"
echo ""
echo "5️⃣  Add to Claude:"
echo "   - Use /claude/tool-definition endpoint"
echo "   - Add to Claude custom instructions"
echo ""
echo "✨ Happy connecting!"
