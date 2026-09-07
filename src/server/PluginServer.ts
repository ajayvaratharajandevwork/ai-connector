import express, { Express, Request, Response } from 'express';
import { ConnectorManager } from '../manager/ConnectorManager.js';
import { ChatGPTPlugin } from '../plugins/ChatGPTPlugin.js';
import { ClaudePlugin } from '../plugins/ClaudePlugin.js';

export class PluginServer {
  private app: Express;
  private connector: ConnectorManager;
  private chatgptPlugin: ChatGPTPlugin;
  private claudePlugin: ClaudePlugin;
  private port: number;

  constructor(port: number = 3000) {
    this.app = express();
    this.port = port;
    this.connector = new ConnectorManager();
    this.chatgptPlugin = new ChatGPTPlugin(this.connector);
    this.claudePlugin = new ClaudePlugin(this.connector);
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Middleware
    this.app.use(express.json());

    // Health check
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // ChatGPT Plugin Routes
    this.app.get('/.well-known/ai-plugin.json', (req: Request, res: Response) => {
      res.json(this.chatgptPlugin.getManifest());
    });

    this.app.post('/chatgpt/request', async (req: Request, res: Response) => {
      try {
        const { message, context } = req.body;
        const result = await this.chatgptPlugin.handleRequest(message, context);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    this.app.get('/chatgpt/status', (req: Request, res: Response) => {
      res.json(this.chatgptPlugin.getServiceStatus());
    });

    this.app.post('/chatgpt/suggest', (req: Request, res: Response) => {
      const { message } = req.body;
      res.json(this.chatgptPlugin.suggestBestProvider(message));
    });

    // Claude Plugin Routes
    this.app.get('/claude/tool-definition', (req: Request, res: Response) => {
      res.json(this.claudePlugin.getToolDefinition());
    });

    this.app.post('/claude/tool-call', async (req: Request, res: Response) => {
      try {
        const result = await this.claudePlugin.processTool(req.body);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    this.app.get('/claude/status', async (req: Request, res: Response) => {
      try {
        const status = await this.claudePlugin.getConnectorStatus();
        res.json(status);
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    this.app.post('/claude/recommend', async (req: Request, res: Response) => {
      try {
        const { taskType } = req.body;
        const recommendation = await this.claudePlugin.recommendProvider(taskType);
        res.json(recommendation);
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    // Shared Routes
    this.app.get('/api/metrics', (req: Request, res: Response) => {
      res.json(this.connector.getMetrics());
    });

    this.app.get('/api/rate-limits', (req: Request, res: Response) => {
      res.json(this.connector.getRateLimitStatus());
    });

    this.app.get('/api/request-history', (req: Request, res: Response) => {
      const limit = parseInt(req.query.limit as string) || 50;
      const history = this.connector.getRequestHistory();
      res.json(history.slice(-limit));
    });

    // OpenAPI spec for ChatGPT
    this.app.get('/openapi.json', (req: Request, res: Response) => {
      res.json(this.getOpenAPISpec());
    });
  }

  private getOpenAPISpec() {
    return {
      openapi: '3.0.0',
      info: {
        title: 'AI Connector API',
        version: '1.0.0',
        description: 'Smart routing between multiple AI providers'
      },
      servers: [
        { url: process.env.API_URL || 'http://localhost:3000' }
      ],
      paths: {
        '/chatgpt/request': {
          post: {
            summary: 'Process request through AI Connector',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string' },
                      context: { type: 'object' }
                    }
                  }
                }
              }
            },
            responses: {
              '200': { description: 'Success' }
            }
          }
        },
        '/chatgpt/status': {
          get: {
            summary: 'Get service status',
            responses: {
              '200': { description: 'Service status' }
            }
          }
        }
      }
    };
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`🚀 AI Connector Server running on port ${this.port}`);
      console.log(`📖 API Documentation: http://localhost:${this.port}/openapi.json`);
      console.log(`🤖 ChatGPT Plugin: http://localhost:${this.port}/.well-known/ai-plugin.json`);
    });
  }
}

// Start server if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = parseInt(process.env.PORT || '3000');
  const server = new PluginServer(port);
  server.start();
}
