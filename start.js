#!/usr/bin/env node

// Production start script optimized for Replit deployments
// This bypasses PM2 and starts the server directly with proper port configuration

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set production environment
process.env.NODE_ENV = 'production';

// Ensure PORT is set correctly for Replit deployment
// Priority: process.env.PORT -> 5000 (default)
const port = process.env.PORT || '5000';
process.env.PORT = port;

console.log(`[DEPLOYMENT] Starting PulseBoardAI server in production mode`);
console.log(`[DEPLOYMENT] Port: ${port}`);
console.log(`[DEPLOYMENT] Node Environment: ${process.env.NODE_ENV}`);

// Verify built files exist
const serverPath = path.join(__dirname, 'dist', 'index.js');
if (!fs.existsSync(serverPath)) {
  console.error(`[ERROR] Built server file not found at: ${serverPath}`);
  console.error(`[ERROR] Please run 'npm run build' before starting the production server`);
  process.exit(1);
}

console.log(`[DEPLOYMENT] Starting server from: ${serverPath}`);

// Start the built server directly
const server = spawn('node', [serverPath], {
  stdio: 'inherit',
  env: process.env
});

server.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  server.kill('SIGINT');
});