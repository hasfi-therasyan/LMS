'use client';

/**
 * Quiz Component
 * 
 * Displays a quiz and handles submission.
 * After submission, if there are incorrect answers, it triggers the AI chatbot.
 */

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import AIChatbot from './AIChatbot';

interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  points: number;
  order_index: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

interface QuizSubmission {
  id: string;
  score: number;
  total_points: number;
  incorrectQuestions?: Array<{
    questionId: string;
    questionText: string;
    studentAnswer: string;
    correctAnswer: string;
  }>;
}

export default function QuizComponent({ quizId }: { quizId: string }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submission, setSubmission] = useState<QuizSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeChatQuestionId, setActiveChatQuestionId] = useState<string | null>(null);

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      const response = await apiClient.getQuiz(quizId);
      setQuiz(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    // Check if all questions are answered
    const unanswered = quiz.questions.filter(
      (q) => !answers[q.id]
    );

    if (unanswered.length > 0) {
      toast.error('Please answer all questions');
      return;
    }

    setSubmitting(true);

    try {
      const answerArray = quiz.questions.map((q) => ({
        questionId: q.id,
        answer: answers[q.id]
      }));

      const response = await apiClient.submitQuiz(quizId, answerArray);
      setSubmission(response.data.submission);
      setSubmitted(true);
      toast.success('Quiz submitted successfully!');

      // If there are incorrect questions, show chatbot option
      if (response.data.submission.incorrectQuestions?.length > 0) {
        toast.success(
          `You got ${response.data.submission.incorrectQuestions.length} question(s) wrong. Click to discuss with AI tutor.`,
          { duration: 5000 }
        );
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Quiz not found</p>
      </div>
    );
  }

  if (submitted && submission) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Quiz Results</h2>
          <div className="mb-4">
            <p className="text-lg">
              Score: <span className="font-bold">{submission.score}</span> /{' '}
              <span className="font-bold">{submission.total_points}</span>
            </p>
            <p className="text-gray-600">
              Percentage: {Math.round((submission.score / submission.total_points) * 100)}%
            </p>
          </div>

          {submission.incorrectQuestions && submission.incorrectQuestions.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-4">
                Questions to Review ({submission.incorrectQuestions.length})
              </h3>
              <div className="space-y-4">
                {submission.incorrectQuestions.map((incorrect, index) => (
                  <div
                    key={incorrect.questionId}
                    className="border border-red-200 rounded-lg p-4 bg-red-50"
                  >
                    <p className="font-semibold mb-2">
                      Question {index + 1}: {incorrect.questionText}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      Your answer: <span className="font-medium text-red-600">{incorrect.studentAnswer}</span>
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      Correct answer: <span className="font-medium text-green-600">{incorrect.correctAnswer}</span>
                    </p>
                    <button
                      onClick={() => setActiveChatQuestionId(incorrect.questionId)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                    >
                      Discuss with AI Tutor
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!submission.incorrectQuestions || submission.incorrectQuestions.length === 0) && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-semibold">🎉 Excellent! You got all questions correct!</p>
            </div>
          )}
        </div>

        {activeChatQuestionId && submission && (
          <AIChatbot
            submissionId={submission.id}
            questionId={activeChatQuestionId}
            onClose={() => setActiveChatQuestionId(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
        {quiz.description && (
          <p className="text-gray-600 mb-6">{quiz.description}</p>
        )}

        <div className="space-y-6">
          {quiz.questions.map((question, index) => (
            <div key={question.id} className="border-b border-gray-200 pb-6">
              <div className="mb-4">
                <p className="text-lg font-semibold mb-2">
                  Question {index + 1} ({question.points} point{question.points !== 1 ? 's' : ''})
                </p>
                <p className="text-gray-800">{question.question_text}</p>
              </div>

              <div className="space-y-2">
                {['A', 'B', 'C', 'D'].map((option) => (
                  <label
                    key={option}
                    className="flex items-center p-3 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option}
                      checked={answers[question.id] === option}
                      onChange={() => handleAnswerChange(question.id, option)}
                      className="mr-3"
                    />
                    <span className="font-medium mr-2">{option}.</span>
                    <span>{question[`option_${option.toLowerCase()}` as keyof Question] as string}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
}
