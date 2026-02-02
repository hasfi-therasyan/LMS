/**
 * Environment Setup Script
 * 
 * This script helps you configure environment variables for the LMS.
 * Run: node setup-env.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  console.log('\n🚀 LMS Environment Setup\n');
  console.log('Please provide the following information:\n');

  // Get Supabase details
  const supabaseUrl = await question('Supabase Project URL (e.g., https://xxxxx.supabase.co): ');
  const supabaseAnonKey = await question('Supabase Anon Key (public key): ');
  const supabaseServiceKey = await question('Supabase Service Role Key (secret key): ');
  
  // Get Gemini API key
  const geminiKey = await question('Google Gemini API Key (or press Enter to skip): ');

  // Backend .env
  const backendEnv = `# Supabase Configuration
SUPABASE_URL=${supabaseUrl}
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}
SUPABASE_ANON_KEY=${supabaseAnonKey}

# Google Gemini API
GEMINI_API_KEY=${geminiKey || 'your_gemini_api_key_here'}

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=10485760
`;

  // Frontend .env.local
  const frontendEnv = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001
`;

  // Write backend .env
  const backendPath = path.join(__dirname, 'backend', '.env');
  fs.writeFileSync(backendPath, backendEnv);
  console.log(`\n✅ Created ${backendPath}`);

  // Write frontend .env.local
  const frontendPath = path.join(__dirname, 'frontend', '.env.local');
  fs.writeFileSync(frontendPath, frontendEnv);
  console.log(`✅ Created ${frontendPath}`);

  console.log('\n✨ Environment files created successfully!');
  console.log('\nNext steps:');
  console.log('1. Run the database schema: database/schema.sql in Supabase SQL Editor');
  console.log('2. Create a storage bucket named "modules" in Supabase Storage');
  console.log('3. Restart your dev servers\n');

  rl.close();
}

setup().catch(console.error);
