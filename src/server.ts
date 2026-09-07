import { PluginServer } from './server/PluginServer.js';

// Start the plugin server
const port = parseInt(process.env.PORT || '3000');
const server = new PluginServer(port);
server.start();
