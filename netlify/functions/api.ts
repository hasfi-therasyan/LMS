/**
 * Netlify Function Wrapper for Express Backend
 * 
 * This file wraps the Express app to work as a Netlify serverless function
 */

// Set NETLIFY environment variable to prevent server startup
process.env.NETLIFY = '1';

// Import serverless-http to wrap Express app
const serverless = require('serverless-http');

// Import Express app from backend
// Use relative path from netlify/functions to backend/src
const path = require('path');
const backendIndexPath = path.resolve(__dirname, '../../backend/src/index');

// Load environment variables first
require('dotenv').config({ path: path.resolve(__dirname, '../../backend/.env') });

// Import the Express app
let app: any;

try {
  // Try to import the backend app
  // Since it's TypeScript, we need to handle it differently
  // In production, backend will be compiled to JS
  const backendDistPath = path.resolve(__dirname, '../../backend/dist/index.js');
  
  if (require('fs').existsSync(backendDistPath)) {
    // Use compiled version if available
    app = require(backendDistPath).default || require(backendDistPath);
  } else {
    // Fallback: try to require the source (might not work in production)
    console.warn('Compiled backend not found, trying source...');
    app = require(backendIndexPath).default || require(backendIndexPath);
  }
} catch (error) {
  console.error('Error loading backend app:', error);
  // Fallback: create a minimal Express app
  const express = require('express');
  app = express();
  app.get('/health', (req: any, res: any) => {
    res.json({ 
      status: 'ok', 
      message: 'Backend not loaded properly',
      error: error instanceof Error ? error.message : String(error)
    });
  });
}

// Wrap Express app for Netlify Functions
// binary: allow binary files (PDFs, images)
export const handler = serverless(app, {
  binary: ['image/*', 'application/pdf', 'application/octet-stream'],
  request: (request: any, event: any, context: any) => {
    // Preserve the original path for Express routing
    request.path = event.path.replace('/.netlify/functions/api', '');
    return request;
  }
});
