/**
 * Script to check which Gemini models are available with your API key
 * Run with: node scripts/check-gemini-models.js
 */

require('dotenv').config({ path: '.env' });
const { GoogleGenAI } = require('@google/genai');

if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is not set in .env file');
  process.exit(1);
}

// Using new SDK - client automatically gets API key from GEMINI_API_KEY env var
const genAI = new GoogleGenAI({});

// Based on: https://ai.google.dev/gemini-api/docs/models
const modelsToTest = [
  'gemini-2.5-flash',           // Stable, recommended (best price-performance)
  'gemini-2.5-pro',             // Stable, more powerful
  'gemini-3-flash-preview',      // Latest preview
  'gemini-3-pro-preview',       // Most powerful preview
  'gemini-2.0-flash',           // Deprecated but still works
  'gemini-2.0-flash-lite',      // Deprecated but still works
  'gemini-pro',                 // Legacy fallback
  'gemini-1.5-pro',             // Legacy
  'gemini-1.5-flash',           // Legacy
];

async function testModel(modelName) {
  try {
    console.log(`Testing ${modelName}...`);
    // Using new SDK method: ai.models.generateContent()
    const response = await genAI.models.generateContent({
      model: modelName,
      contents: 'Hello'
    });
    const text = response.text;
    console.log(`✅ ${modelName} - WORKS! Response: "${text.substring(0, 50)}..."`);
    return true;
  } catch (error) {
    console.log(`❌ ${modelName} - FAILED: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔍 Checking available Gemini models...\n');
  console.log(`API Key: ${process.env.GEMINI_API_KEY.substring(0, 10)}...\n`);

  const results = [];
  for (const modelName of modelsToTest) {
    const works = await testModel(modelName);
    results.push({ model: modelName, works });
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📊 Summary:');
  console.log('='.repeat(50));
  const workingModels = results.filter(r => r.works);
  if (workingModels.length > 0) {
    console.log('✅ Working models:');
    workingModels.forEach(r => console.log(`   - ${r.model}`));
    console.log(`\n💡 Set GEMINI_MODEL=${workingModels[0].model} in your .env file`);
  } else {
    console.log('❌ No working models found!');
    console.log('\nPossible issues:');
    console.log('1. API key is invalid');
    console.log('2. API key doesn\'t have access to these models');
    console.log('3. Check available models at: https://ai.google.dev/models');
  }
}

main().catch(console.error);
