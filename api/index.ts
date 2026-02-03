/**
 * Vercel Serverless Function Entry Point
 * 
 * This file wraps the Express app for Vercel deployment
 */

// Set VERCEL environment variable
process.env.VERCEL = '1';

// Import the Express app
import app from '../backend/src/index';

// Export the Express app as a serverless function
export default app;
