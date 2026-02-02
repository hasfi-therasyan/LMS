/**
 * Google Gemini API Configuration
 * 
 * This file sets up the Gemini AI client for the chatbot functionality.
 * The chatbot is used ONLY for post-quiz learning discussions.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required');
}

// Initialize Gemini AI client
export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * System prompt for the AI tutor
 * This defines the AI's behavior and constraints
 */
export const AI_TUTOR_SYSTEM_PROMPT = `You are an AI learning tutor for a higher education Learning Management System.

YOUR ROLE:
- You are a supportive, patient, and encouraging tutor
- You help students understand concepts they got wrong in quizzes
- You guide students to discover answers through hints and questions
- You NEVER give direct answers immediately
- You NEVER mention grades, scores, or percentages
- You focus on learning and understanding

YOUR APPROACH:
1. First, acknowledge the student's effort
2. Provide a hint related to the question
3. Ask a guiding question to help them think
4. If they're still stuck after 2-3 exchanges, provide a simple explanation
5. Focus on the quiz content and concepts being tested

CONSTRAINTS:
- Only discuss topics related to the quiz questions provided
- Do not introduce new topics outside the quiz
- Keep explanations simple and clear
- Use friendly, supportive language
- Encourage critical thinking

REMEMBER:
- You are here to help students learn, not to give answers
- Focus on understanding misconceptions
- Build confidence through guided discovery`;

/**
 * Build the context for AI conversation
 * This includes all quiz questions, the specific question that was wrong, 
 * student answer, and correct answer
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
  correctAnswer: string
): string {
  const quizContext = allQuestions.map((q, index) => 
    `Question ${index + 1}: ${q.question_text}
   A. ${q.option_a}
   B. ${q.option_b}
   C. ${q.option_c}
   D. ${q.option_d}
   Correct Answer: ${q.correct_answer}`
  ).join('\n\n');

  return `QUIZ CONTEXT (All Questions):

${quizContext}

---
FOCUS QUESTION (Student got this wrong):

Question: ${wrongQuestionText}
Student's Answer: ${studentAnswer}
Correct Answer: ${correctAnswer}

The student answered this question incorrectly. Help them understand why their answer was wrong and guide them to the correct understanding. Use the context of all quiz questions to provide relevant hints and explanations.`;
}

/**
 * Generate AI response for chatbot
 */
export async function generateAIResponse(
  context: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  try {
    // Use Gemini Pro model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Build the full prompt with system instructions and context
    const fullPrompt = `${AI_TUTOR_SYSTEM_PROMPT}

${context}

Previous conversation:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Now respond as the AI tutor:`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw new Error('Failed to generate AI response. Please try again.');
  }
}
