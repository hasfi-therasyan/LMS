/**
 * Entry Point for Backend Server
 * 
 * Supports both:
 * - Vercel: Serverless function
 * - Railway: Standalone server
 */

// Check if running on Vercel
if (process.env.VERCEL === '1') {
  // Vercel serverless function mode
  process.env.VERCEL = '1';
  
  // Import the Express app from local _src directory
  // Using require() to avoid TypeScript module resolution issues in Vercel
  // Using _src to prevent Vercel from detecting it as a serverless function
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const appModule = require('./_src/index');
  const app = appModule.default || appModule;
  
  // Export the Express app as a serverless function
  // Vercel will pass requests to this function, and Express will handle routing
  module.exports = app;
} else {
  // Railway/Standalone server mode
  // Import and start the Express app directly
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('./_src/index');
}
