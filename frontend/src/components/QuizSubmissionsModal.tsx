'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

interface Submission {
  id: string;
  score: number;
  total_points: number;
  submitted_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
  answers: Array<{
    student_answer: string;
    is_correct: boolean;
    points_earned: number;
    quiz_questions: {
      question_text: string;
      correct_answer: string;
      points: number;
    };
  }>;
}

interface QuizSubmissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizId: string;
  quizTitle: string;
}

export default function QuizSubmissionsModal({
  isOpen,
  onClose,
  quizId,
  quizTitle
}: QuizSubmissionsModalProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    if (isOpen && quizId) {
      loadData();
    }
  }, [isOpen, quizId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [submissionsRes, analyticsRes] = await Promise.all([
        apiClient.getQuizSubmissions(quizId),
        apiClient.getQuizAnalytics(quizId)
      ]);
      setSubmissions(submissionsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error: any) {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">{quizTitle}</h2>
              <p className="text-gray-600">Submissions & Analytics</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-blue-600">{analytics.totalSubmissions}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-green-600">{analytics.averageScore}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Average Percentage</p>
                <p className="text-2xl font-bold text-purple-600">{analytics.averagePercentage}%</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Correctness Ratio</p>
                <p className="text-2xl font-bold text-orange-600">{analytics.correctnessRatio}%</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No submissions yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedSubmission(submission)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{submission.profiles.full_name}</p>
                      <p className="text-sm text-gray-600">{submission.profiles.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {submission.score} / {submission.total_points}
                      </p>
                      <p className="text-sm text-gray-600">
                        {Math.round((submission.score / submission.total_points) * 100)}%
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(submission.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">
                    {selectedSubmission.profiles.full_name}
                  </h3>
                  <p className="text-gray-600">{selectedSubmission.profiles.email}</p>
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-lg font-semibold">
                  Score: {selectedSubmission.score} / {selectedSubmission.total_points} (
                  {Math.round((selectedSubmission.score / selectedSubmission.total_points) * 100)}%)
                </p>
                <p className="text-sm text-gray-600">
                  Submitted: {new Date(selectedSubmission.submitted_at).toLocaleString()}
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Answers:</h4>
                {selectedSubmission.answers.map((answer, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${
                      answer.is_correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium">Question {index + 1}</p>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          answer.is_correct
                            ? 'bg-green-200 text-green-800'
                            : 'bg-red-200 text-red-800'
                        }`}
                      >
                        {answer.is_correct ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{answer.quiz_questions.question_text}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Student Answer:</span>{' '}
                        <span className={answer.is_correct ? 'text-green-700' : 'text-red-700'}>
                          {answer.student_answer}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Correct Answer:</span>{' '}
                        <span className="text-green-700">
                          {answer.quiz_questions.correct_answer}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Points: {answer.points_earned} / {answer.quiz_questions.points}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
