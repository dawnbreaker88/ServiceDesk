import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import http from 'http';
import app from './app.js';
import { connectDB } from './config/db.js';
import { initSocket } from './socket.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB().then(() => {
  const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`\n🚀 [ServiceDesk Pro] Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
    console.log(`📡 Healthcheck endpoint: http://localhost:${PORT}/api/health`);
    console.log(`⚡ Real-time Socket.io active on port ${PORT}\n`);
  });

  // Handle unhandled promise rejections gracefully
  process.on('unhandledRejection', (err) => {
    console.error(`[Server Error] Unhandled Rejection: ${err.message}`);
    httpServer.close(() => process.exit(1));
  });
});
