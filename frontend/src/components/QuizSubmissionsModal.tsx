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
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (isOpen && quizId) {
      setSearchQuery(''); // Reset search when modal opens
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

  const handleExportToExcel = () => {
    try {
      // Prepare data for export
      const exportData: any[] = [];
      
      // Add header row
      exportData.push([
        'No',
        'Student Name',
        'Email',
        'Score',
        'Total Points',
        'Percentage',
        'Submitted Date',
        'Correct Answers',
        'Total Questions'
      ]);

      // Add data rows
      let rowNumber = 1;
      filteredSubmissions.forEach((submission) => {
        const correctCount = submission.answers.filter(a => a.is_correct).length;
        const totalQuestions = submission.answers.length;
        const percentage = Math.round((submission.score / submission.total_points) * 100);
        
        exportData.push([
          rowNumber++,
          submission.profiles.full_name || '',
          submission.profiles.email || '',
          submission.score,
          submission.total_points,
          `${percentage}%`,
          new Date(submission.submitted_at).toLocaleString(),
          correctCount,
          totalQuestions
        ]);
      });

      // Convert to CSV format
      const csvContent = exportData.map(row => {
        return row.map(cell => {
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          const cellStr = String(cell || '');
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(',');
      }).join('\n');

      // Add BOM for Excel UTF-8 support
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Create download link
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `Quiz_Submissions_${quizTitle.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Excel file exported successfully!');
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error('Failed to export to Excel');
    }
  };

  // Filter submissions based on search query
  const filteredSubmissions = submissions.filter((submission) => {
    if (!searchQuery.trim()) return true;
    
    const searchLower = searchQuery.toLowerCase().trim();
    const studentName = submission.profiles.full_name?.toLowerCase() || '';
    const studentEmail = submission.profiles.email?.toLowerCase() || '';
    
    return (
      studentName.includes(searchLower) ||
      studentEmail.includes(searchLower)
    );
  });

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
            <div className="flex items-center space-x-3">
              {!loading && filteredSubmissions.length > 0 && (
                <button
                  onClick={handleExportToExcel}
                  className="flex items-center space-x-2 px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors text-sm font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Export to Excel</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
              >
                ×
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {!loading && submissions.length > 0 && (
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field w-full pl-10 pr-4"
                  placeholder="Search by student name or email..."
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

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
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">
                {searchQuery ? 'No submissions found matching your search.' : 'No submissions yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.map((submission) => (
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
