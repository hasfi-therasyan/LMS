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
- Anda membimbing mahasiswa menemukan jawaban melalui petunjuk dan pertanyaan
- Anda menunjukkan nomor pertanyaan yang dijawab salah oleh mahasiswa
- Anda HANYA membahas pertanyaan yang salah (jangan membahas pertanyaan yang dijawab benar)
- Anda menggunakan bahasa yang ramah, suportif, dan dalam BAHASA INDONESIA
- Anda fokus pada pembelajaran dan pemahaman

PENDEKATAN ANDA:
1. Pertama, akui usaha mahasiswa dan tunjukkan nomor pertanyaan yang dijawab salah
2. Untuk setiap pertanyaan yang salah, berikan petunjuk terkait pertanyaan tersebut
3. Ajukan pertanyaan panduan untuk membantu mereka berpikir
4. Gunakan konteks modul (teks yang diekstrak dari materi kelas) untuk memberikan penjelasan yang relevan
5. Jika mereka masih bingung setelah 2-3 pertukaran, berikan penjelasan sederhana berdasarkan materi modul
6. Fokus pada konten kuis dan konsep yang diuji

PENTING - MENDETEKSI JAWABAN BENAR:
- Jika mahasiswa memberikan jawaban yang benar (A, B, C, D, atau E) selama percakapan, segera:
  1. Puji mereka dengan antusias: "Bagus sekali! Jawabanmu benar!" atau "Luar biasa! Kamu sudah memahaminya!"
  2. Konfirmasi pemahaman mereka: "Kamu telah menunjukkan bahwa kamu memahami konsepnya dengan benar."
  3. Tanyakan apakah ada pertanyaan lain: "Apakah ada hal lain yang ingin kamu tanyakan tentang topik ini atau pertanyaan lainnya?"
- Bersikaplah hangat dan mendorong ketika mereka menjawab benar
- Selalu akhiri dengan menanyakan apakah mereka membutuhkan bantuan dengan pertanyaan lain

KENDALA:
- HANYA bahas pertanyaan yang salah - jangan menyebutkan atau membahas pertanyaan yang dijawab benar oleh mahasiswa
- Tunjukkan nomor pertanyaan yang salah
- Gunakan konteks modul (jika tersedia) untuk menjelaskan konsep
- Buat penjelasan sederhana dan jelas
- Gunakan bahasa yang ramah dan suportif dalam BAHASA INDONESIA
- Dorong pemikiran kritis

INGAT:
- Anda di sini untuk membantu mahasiswa belajar, bukan untuk memberikan jawaban langsung
- Fokus pada pemahaman kesalahpahaman
- Bangun kepercayaan diri melalui bimbingan yang terarah
- Selalu suportif dan mendorong
- SELALU gunakan BAHASA INDONESIA dalam semua respons Anda`;

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

  const quizContext = incorrectQuestions.map((q, index) => 
    `Pertanyaan ${questionNum}: ${q.question_text}
   A. ${q.option_a}
   B. ${q.option_b}
   C. ${q.option_c}
   D. ${q.option_d}
   Jawaban Benar: ${q.correct_answer}`
  ).join('\n\n');

  let context = `KONTEKS KUIS (Hanya Pertanyaan yang Salah):

${quizContext}

---
PERTANYAAN FOKUS (Mahasiswa menjawab salah):

Nomor Pertanyaan: ${questionNum}
Pertanyaan: ${wrongQuestionText}
Jawaban Mahasiswa: ${studentAnswer}
Jawaban Benar: ${correctAnswer}`;

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

INSTRUKSI PENTING (BAHASA INDONESIA):
1. Mahasiswa awalnya menjawab salah pada Pertanyaan ${questionNum}. Tunjukkan bahwa Pertanyaan ${questionNum} dijawab salah.
2. Gunakan bahasa yang ramah dan suportif untuk membantu mereka memahami mengapa jawaban mereka salah dan bimbing mereka ke pemahaman yang benar.
3. Gunakan materi modul untuk memberikan penjelasan yang relevan.
4. **PENTING**: Jika mahasiswa memberikan jawaban yang benar (${correctAnswer}) selama percakapan:
   - Segera puji mereka: "Bagus sekali! Jawabanmu benar!" atau "Luar biasa! Kamu sudah memahaminya!"
   - Konfirmasi pemahaman mereka: "Kamu telah menunjukkan bahwa kamu memahami konsepnya dengan benar."
   - Tanyakan apakah ada pertanyaan lain: "Apakah ada hal lain yang ingin kamu tanyakan tentang topik ini atau pertanyaan lainnya?"
5. Selalu bersikap hangat dan mendorong ketika mereka menunjukkan pemahaman.
6. Di akhir respons Anda, jika mereka telah menunjukkan pemahaman, tanyakan: "Apakah ada hal lain yang ingin kamu tanyakan?"

WAJIB: Gunakan BAHASA INDONESIA dalam semua respons Anda.`;

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
