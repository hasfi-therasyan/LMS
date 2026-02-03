/**
 * Vercel Serverless Function Entry Point
 * 
 * This file imports the Express app from the local src directory
 * and handles Vercel serverless function requests
 */

// Set VERCEL environment variable
process.env.VERCEL = '1';

// Import the Express app from local _src directory
// Using _src to prevent Vercel from detecting it as a serverless function
// @ts-ignore - Vercel type checking may not resolve this path correctly
import app from './_src/index';

// Export the Express app as a serverless function
// Vercel will pass requests to this function, and Express will handle routing
export default app;
