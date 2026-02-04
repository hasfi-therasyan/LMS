/**
 * GET /api/ai/chat/:sessionId
 * Get chat session with all messages
 */

import { NextRequest } from 'next/server';
import { authenticate, requireRole, createErrorResponse, createSuccessResponse } from '@/lib/api/middleware/auth';
import { supabase } from '@/lib/api/config/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const user = await authenticate(request);
    requireRole(user, 'student');

    // Verify session belongs to student
    const { data: session, error: sessionError } = await supabase
      .from('ai_chat_sessions')
      .select('*')
      .eq('id', params.sessionId)
      .eq('student_id', user.id)
      .single();

    if (sessionError || !session) {
      return createErrorResponse('Chat session not found', 404);
    }

    // Get messages
    const { data: messages, error: msgError } = await supabase
      .from('ai_chat_messages')
      .select('*')
      .eq('session_id', params.sessionId)
      .order('created_at', { ascending: true });

    if (msgError) {
      throw msgError;
    }

    return createSuccessResponse({
      session,
      messages: messages || []
    });
  } catch (error: any) {
    if (error.message?.includes('authorization')) {
      return createErrorResponse('Missing or invalid authorization header', 401);
    }
    if (error.message?.includes('requires')) {
      return createErrorResponse(error.message, 403);
    }
    return createErrorResponse(error.message || 'Failed to fetch chat session', 500);
  }
}
