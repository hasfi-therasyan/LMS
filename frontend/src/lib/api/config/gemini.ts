/**
 * Google Gemini API Configuration
 * 
 * This file sets up the Gemini AI client for the chatbot functionality.
 * The chatbot is used ONLY for post-quiz learning discussions.
 * 
 * Using the new Google Gen AI SDK as per: https://ai.google.dev/gemini-api/docs/quickstart
 */

import { GoogleGenAI } from '@google/genai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required');
}

// Initialize Gemini AI client using the new SDK
// Pass API key explicitly (it should be in GEMINI_API_KEY env var)
export const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

/**
 * System prompt for the AI tutor
 * This defines the AI's behavior and constraints
 */
export const AI_TUTOR_SYSTEM_PROMPT = `Anda adalah tutor AI untuk Sistem Manajemen Pembelajaran (LMS) pendidikan tinggi.

PERAN ANDA:
- Anda adalah tutor yang suportif, sabar, dan mendorong
- Anda membantu mahasiswa memahami konsep yang mereka jawab salah dalam kuis
- Anda HANYA memandu dengan petunjuk dan pertanyaan—JANGAN pernah menyebutkan atau menulis jawaban yang benar (huruf A, B, C, D, atau E) secara eksplisit
- Diskusi dengan mahasiswa berakhir hanya ketika mahasiswa sendiri yang menulis/mengatakan jawaban yang benar dalam chat; saat itu puji mereka dan tanyakan apakah ada pertanyaan lain
- Anda HANYA membahas pertanyaan yang salah
- Gunakan bahasa yang ramah, suportif, dan dalam BAHASA INDONESIA

PENDEKATAN ANDA:
1. Akui usaha mahasiswa dan tunjukkan nomor pertanyaan yang dijawab salah
2. Berikan petunjuk dan ajukan pertanyaan panduan—JANGAN beri tahu jawaban benar
3. Gunakan konteks modul untuk menjelaskan konsep tanpa menyebut huruf jawaban (A/B/C/D/E)
4. Jika mereka bingung, berikan penjelasan atau hint yang mengarahkan pemikiran, bukan jawaban langsung
5. Diskusi dianggap selesai hanya jika mahasiswa mengirim pesan yang berisi jawaban yang benar; lalu puji dan tanyakan apakah ada hal lain

KENDALA WAJIB:
- JANGAN pernah menulis atau mengucapkan jawaban yang benar (A, B, C, D, atau E) dalam respons Anda
- Hanya bimbing dengan petunjuk, penjelasan konsep, dan pertanyaan pemandu
- Diskusi berakhir hanya ketika mahasiswa sendiri menulis jawaban yang benar di chat—saat itu katakan "Bagus sekali! Jawabanmu benar!" dan tanyakan apakah ada pertanyaan lain
- Gunakan BAHASA INDONESIA
- Tetap suportif dan mendorong`;

/**
 * Build the context for AI conversation
 * This includes all quiz questions, the specific question that was wrong, 
 * student answer, correct answer, and extracted module text from classes
 */
export function buildAIContext(
  allQuestions: Array<{
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: string;
  }>,
  wrongQuestionText: string,
  studentAnswer: string,
  correctAnswer: string,
  extractedModuleText?: string | null,
  questionNumber?: number
): string {
  // Find the question number
  const questionIndex = allQuestions.findIndex(q => q.question_text === wrongQuestionText);
  const questionNum = questionNumber !== undefined ? questionNumber : (questionIndex + 1);

  // Only include incorrect questions in context
  const incorrectQuestions = allQuestions.filter((q, index) => {
    // For now, we only know about the current wrong question
    // In a full implementation, we'd pass all incorrect question info
    return q.question_text === wrongQuestionText;
  });

  const quizContext = incorrectQuestions.map((q) => 
    `Pertanyaan ${questionNum}: ${q.question_text}
   A. ${q.option_a}
   B. ${q.option_b}
   C. ${q.option_c}
   D. ${q.option_d}
   (Jawaban benar diketahui sistem untuk deteksi saja—JANGAN tulis atau sebut dalam respons)`
  ).join('\n\n');

  let context = `KONTEKS KUIS (Pertanyaan yang salah):

${quizContext}

---
PERTANYAAN FOKUS:

Nomor: ${questionNum}
Pertanyaan: ${wrongQuestionText}
Jawaban mahasiswa (salah): ${studentAnswer}
(Jawaban benar disimpan di sistem hanya untuk mendeteksi kapan mahasiswa menjawab benar di chat—JANGAN pernah sebut atau tulis jawaban benar dalam respons Anda.)`;

  // Add extracted module text if available
  // If using embeddings, we'll find the most relevant sections
  // For now, we use the first 3000 characters (can be improved with embeddings)
  if (extractedModuleText) {
    context += `

---
KONTEKS MODUL (Diekstrak dari materi kelas - gunakan ini untuk menjelaskan konsep):

${extractedModuleText.substring(0, 3000)}${extractedModuleText.length > 3000 ? '...' : ''}`;
  }

  context += `

INSTRUKSI PENTING:
1. Mahasiswa menjawab salah pada Pertanyaan ${questionNum}. Bimbing mereka dengan petunjuk—JANGAN beri tahu jawaban benar (jangan tulis A, B, C, D, atau E sebagai jawaban).
2. Gunakan materi modul untuk penjelasan konsep tanpa menyebut huruf jawaban.
3. Jika mahasiswa mengirim pesan yang berisi jawaban yang benar (sistem mendeteksi otomatis), maka:
   - Puji: "Bagus sekali! Jawabanmu benar!" atau serupa
   - Tanyakan: "Apakah ada hal lain yang ingin kamu tanyakan?"
   - Diskusi untuk pertanyaan ini dianggap selesai.
4. Gunakan BAHASA INDONESIA. Bersikap hangat dan suportif.`;

  return context;
}

/**
 * Get Gemini model name to use
 * Returns the model name that should work based on environment or defaults
 * Based on: https://ai.google.dev/gemini-api/docs/models
 */
function getModelName(): string {
  // If GEMINI_MODEL is explicitly set, use it
  if (process.env.GEMINI_MODEL) {
    return process.env.GEMINI_MODEL;
  }
  
  // Default to gemini-2.0-flash-lite (lightweight, fastest, highest rate limits)
  return 'gemini-2.0-flash-lite';
}

/**
 * Generate AI response for chatbot
 */
export async function generateAIResponse(
  context: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  try {
    // Check if API key is set
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured. Please set it in your environment variables.');
    }

    // Get model name
    const modelName = getModelName();
    console.log(`Using Gemini model: ${modelName}`);
    
    // Build the full prompt with system instructions and context
    const conversationHistoryText = conversationHistory.length > 0
      ? conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')
      : '(No previous conversation)';

    const fullPrompt = `${AI_TUTOR_SYSTEM_PROMPT}

${context}

Previous conversation:
${conversationHistoryText}

Now respond as the AI tutor:`;

    console.log('Sending request to Gemini API...');
    console.log('Prompt length:', fullPrompt.length);
    console.log('Context length:', context.length);
    console.log('Conversation history length:', conversationHistory.length);

    // Try multiple models if the first one fails
    const modelsToTry = [
      modelName,                          // User specified or default
      'gemini-2.0-flash-lite',           // Primary: Lightweight, highest rate limits, fastest ⭐
      'gemini-2.5-flash',                // Secondary: Stable, best price-performance, high rate limits
      'gemini-3-flash-preview',          // Tertiary: Latest preview - may have higher rate limits
      'gemini-2.5-pro',                  // Fallback: Stable, more powerful (lower rate limits)
      'gemini-3-pro-preview',            // Fallback: Most powerful preview (lower rate limits)
      'gemini-2.0-flash',                // Fallback: Deprecated but still works
      'gemini-pro',                      // Legacy fallback
    ];

    let lastError: any = null;
    for (const tryModelName of modelsToTry) {
      try {
        console.log(`Attempting to use model: ${tryModelName}`);
        
        // Use the new SDK method: ai.models.generateContent()
        const response = await genAI.models.generateContent({
          model: tryModelName,
          contents: fullPrompt
        });
        
        // Extract text from response
        let text: string;
        if (typeof response.text === 'string') {
          text = response.text;
        } else if (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) {
          text = response.candidates[0].content.parts[0].text;
        } else {
          throw new Error('Unexpected response format from Gemini API');
        }

        if (!text || text.trim().length === 0) {
          throw new Error('AI returned an empty response');
        }

        console.log(`✓ Successfully used model: ${tryModelName}`);
        console.log('AI response received, length:', text.length);
        return text;
      } catch (error: any) {
        console.log(`✗ Model ${tryModelName} failed: ${error.message}`);
        lastError = error;
        // Continue to next model
        continue;
      }
    }

    // If all models failed, throw error with helpful message
    throw new Error(
      `All Gemini models failed. Last error: ${lastError?.message || 'Unknown error'}. ` +
      `Tried models: ${modelsToTry.join(', ')}. ` +
      `Please check your API key or set GEMINI_MODEL environment variable to a specific model name. ` +
      `You can check available models at: https://ai.google.dev/models`
    );
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    
    // Provide more specific error messages
    if (error.message?.includes('API_KEY')) {
      throw new Error('Gemini API key is invalid or missing. Please check your GEMINI_API_KEY environment variable.');
    } else if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      throw new Error('Gemini API quota exceeded or rate limit reached. Please try again later.');
    } else if (error.message?.includes('safety')) {
      throw new Error('Content was blocked by safety filters. Please try rephrasing your question.');
    } else {
      throw new Error(`Failed to generate AI response: ${error.message || 'Unknown error'}`);
    }
  }
}
