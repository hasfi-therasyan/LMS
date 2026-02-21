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
  option_e: string;
  points: number;
  order_index: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  alreadySubmitted?: boolean;
  submission?: QuizSubmission;
}

interface QuizSubmission {
  id: string;
  score: number;
  total_points: number;
  submitted_at: string;
  incorrectQuestions?: Array<{
    questionId: string;
    questionText: string;
    studentAnswer: string;
    correctAnswer: string;
  }>;
  answers?: Array<{
    id: string;
    student_answer: string;
    is_correct: boolean;
    points_earned: number;
    quiz_questions: {
      id: string;
      question_text: string;
      option_a: string;
      option_b: string;
      option_c: string;
      option_d: string;
      option_e?: string;
      correct_answer: string;
      points: number;
      order_index: number;
    };
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
      const quizData = response.data;
      setQuiz(quizData);
      
      // If student already submitted, show results immediately
      if (quizData.alreadySubmitted && quizData.submission) {
        setSubmission(quizData.submission);
        setSubmitted(true);
      }
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
    const percentage = Math.round((submission.score / submission.total_points) * 100);
    const isPassing = percentage >= 70;
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Quiz Results & Summary</h2>
            <span className={`px-4 py-2 rounded-lg font-semibold ${
              isPassing 
                ? 'bg-green-100 text-green-700' 
                : percentage >= 50 
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
            }`}>
              {percentage}%
            </span>
          </div>
          
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {submission.score} / {submission.total_points}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Submitted At</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(submission.submitted_at).toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm font-medium text-gray-700">{percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    isPassing ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Summary Section */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-700">
                  {(submission.answers || []).filter((a: any) => a.is_correct).length}
                </p>
                <p className="text-sm text-gray-600">Correct</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-700">
                  {(submission.answers || []).filter((a: any) => !a.is_correct).length}
                </p>
                <p className="text-sm text-gray-600">Incorrect</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-700">
                  {submission.total_points}
                </p>
                <p className="text-sm text-gray-600">Total Questions</p>
              </div>
            </div>
          </div>
          
          {/* Detailed Answers */}
          {submission.answers && submission.answers.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Your Answers</h3>
              <div className="space-y-4">
                {submission.answers
                  .sort((a: any, b: any) => a.quiz_questions.order_index - b.quiz_questions.order_index)
                  .map((answer: any, index: number) => {
                    const question = answer.quiz_questions;
                    const isCorrect = answer.is_correct;
                    
                    return (
                      <div
                        key={answer.id}
                        className={`border rounded-lg p-4 ${
                          isCorrect
                            ? 'border-green-200 bg-green-50'
                            : 'border-red-200 bg-red-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                            }`}>
                              Q{index + 1}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              isCorrect ? 'text-green-700' : 'text-red-700'
                            }`}>
                              {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                            </span>
                          </div>
                          <span className="text-sm text-gray-600">
                            {answer.points_earned} / {question.points} points
                          </span>
                        </div>
                        
                        <p className="font-medium text-gray-900 mb-3">{question.question_text}</p>
                        
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {['A', 'B', 'C', 'D', 'E'].map((option) => {
                            const optionKey = `option_${option.toLowerCase()}` as keyof typeof question;
                            const optionText = question[optionKey] as string;
                            
                            const isStudentAnswer = answer.student_answer === option;
                            const isCorrectAnswer = question.correct_answer === option;
                            
                            return (
                              <div
                                key={option}
                                className={`p-2 rounded border ${
                                  isCorrectAnswer
                                    ? 'border-green-500 bg-green-100'
                                    : isStudentAnswer && !isCorrect
                                      ? 'border-red-500 bg-red-100'
                                      : 'border-gray-200 bg-white'
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">{option}.</span>
                                  <span className="text-sm">{optionText}</span>
                                  {isCorrectAnswer && (
                                    <span className="ml-auto text-green-600 font-bold">✓</span>
                                  )}
                                  {isStudentAnswer && !isCorrect && (
                                    <span className="ml-auto text-red-600 font-bold">✗</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {!isCorrect && (
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-xs text-gray-600">
                              <span className="font-semibold">Your answer:</span> {answer.student_answer} | 
                              <span className="font-semibold"> Correct answer:</span> {question.correct_answer}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* AI Chatbot Section for Incorrect Questions */}
          {submission.incorrectQuestions && submission.incorrectQuestions.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-4">
                Questions to Review with AI Tutor ({submission.incorrectQuestions.length})
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Click "Discuss with AI Tutor" below to get personalized explanations for questions you got wrong.
              </p>
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
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
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
              <p className="text-green-800 font-semibold text-lg">🎉 Excellent! You got all questions correct!</p>
              <p className="text-green-700 text-sm mt-2">Perfect score! Keep up the great work!</p>
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

  // If already submitted, don't show the form (should have been caught above)
  if (quiz.alreadySubmitted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Quiz Already Completed</h2>
            <p className="text-gray-600">You have already submitted this quiz. Please check the results above.</p>
          </div>
        </div>
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
                {['A', 'B', 'C', 'D', 'E'].map((option) => {
                  const optionKey = `option_${option.toLowerCase()}` as keyof Question;
                  const optionText = question[optionKey] as string;
                  
                  return (
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
                      <span>{optionText}</span>
                    </label>
                  );
                })}
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
