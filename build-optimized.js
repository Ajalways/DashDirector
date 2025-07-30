#!/usr/bin/env node

/**
 * Optimized build script to prevent Firefox crashes
 * This script runs the build process with memory optimization
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting optimized build process...');

// Set memory limits to prevent Firefox crashes
process.env.NODE_OPTIONS = '--max-old-space-size=4096';

// Run the build with error handling
const buildProcess = spawn('npm', ['run', 'build'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production',
    // Reduce memory pressure during build
    VITE_LEGACY_BUILD: 'false',
    BUILD_OPTIMIZATION: 'true'
  }
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Build completed successfully!');
    
    // Check build output
    const distPath = path.join(__dirname, 'dist', 'public');
    if (fs.existsSync(distPath)) {
      const files = fs.readdirSync(path.join(distPath, 'assets'));
      console.log('📦 Build artifacts:');
      files.forEach(file => {
        const filePath = path.join(distPath, 'assets', file);
        const stats = fs.statSync(filePath);
        const sizeKB = Math.round(stats.size / 1024);
        console.log(`  - ${file}: ${sizeKB}KB`);
      });
    }
  } else {
    console.error('❌ Build failed with code:', code);
    process.exit(1);
  }
});

buildProcess.on('error', (error) => {
  console.error('❌ Build error:', error.message);
  process.exit(1);
});