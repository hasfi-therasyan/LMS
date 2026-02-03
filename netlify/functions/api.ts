/**
 * Netlify Function Wrapper for Express Backend
 * 
 * This file wraps the Express app to work as a Netlify serverless function
 */

// Set VERCEL environment variable to prevent server startup
process.env.VERCEL = '1';

// Import serverless-http to wrap Express app
import serverless from 'serverless-http';

// Import Express app from backend
// Note: We need to use require for dynamic path resolution
const path = require('path');
const backendPath = path.join(__dirname, '../../backend/src/index');

// Dynamic import to handle the path correctly
let app: any;

try {
  // Try to require the backend app
  app = require(backendPath).default || require(backendPath);
} catch (error) {
  console.error('Error loading backend app:', error);
  // Fallback: create a minimal Express app
  const express = require('express');
  app = express();
  app.get('/health', (req: any, res: any) => {
    res.json({ status: 'ok', message: 'Backend not loaded properly' });
  });
}

// Wrap Express app for Netlify Functions
// binary: allow binary files (PDFs, images)
export const handler = serverless(app, {
  binary: ['image/*', 'application/pdf', 'application/octet-stream']
});
