#!/usr/bin/env node

// Development server starter that bypasses tsx IPC issues
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Start the server with the proper Node.js import flag
const server = spawn('node', ['--import', 'tsx/esm', 'server/index.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development',
    FORCE_COLOR: '1'
  },
  cwd: __dirname
});

// Handle server errors and exits
server.on('error', (error) => {
  console.error('Server startup error:', error);
  process.exit(1);
});

server.on('close', (code) => {
  if (code !== 0) {
    console.error(`Server exited with code ${code}`);
    process.exit(code);
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down development server...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\nShutting down development server...');
  server.kill('SIGTERM');
});