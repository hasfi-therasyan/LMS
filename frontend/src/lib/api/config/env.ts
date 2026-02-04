/**
 * Environment Variables Loader
 * 
 * This file validates required environment variables for Vercel deployment.
 * Vercel automatically loads environment variables, so we just validate them.
 */

// Validate required environment variables
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
];

const missingVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingVars.length > 0 && process.env.NODE_ENV !== 'test') {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach((varName) => {
    console.error(`   - ${varName}`);
  });
  console.error('\n💡 Make sure all required variables are set in Vercel environment settings.');
}

export {};
