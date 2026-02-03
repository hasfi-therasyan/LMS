/**
 * Vercel Serverless Function Entry Point
 * 
 * This file imports the Express app from the local src directory
 * and handles Vercel serverless function requests
 */

// Set VERCEL environment variable
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
