/**
 * Vercel Serverless Function Entry Point
 * 
 * This file imports the Express app from the local src directory
 */

// Set VERCEL environment variable
process.env.VERCEL = '1';

// Import the Express app from local src directory
import app from './src/index';

// Export the Express app as a serverless function
export default app;
