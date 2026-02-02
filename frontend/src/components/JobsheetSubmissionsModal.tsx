'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import PDFViewer from './PDFViewer';

interface Submission {
  id: string;
  file_url: string;
  grade: number | null;
  feedback: string | null;
  submitted_at: string;
  graded_at: string | null;
  profiles: {
    id: string;
    full_name: string;
    email: string;
  };
}

interface JobsheetSubmissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleId: string;
  moduleTitle: string;
}

export default function JobsheetSubmissionsModal({
  isOpen,
  onClose,
  moduleId,
  moduleTitle
}: JobsheetSubmissionsModalProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [grading, setGrading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSubmissions();
    }
  }, [isOpen, moduleId]);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getJobsheetSubmissions(moduleId);
      setSubmissions(response.data);
    } catch (error: any) {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    const gradeNum = parseInt(grade);
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 100) {
      toast.error('Please enter a valid grade (0-100)');
      return;
    }

    setGrading(true);
    try {
      await apiClient.gradeJobsheetSubmission(gradingSubmission.id, {
        grade: gradeNum,
        feedback: feedback || undefined
      });
      toast.success('Submission graded successfully!');
      setGradingSubmission(null);
      setGrade('');
      setFeedback('');
      loadSubmissions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to grade submission');
    } finally {
      setGrading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Jobsheet Submissions</h2>
                <p className="text-sm text-gray-600 mt-1">{moduleTitle}</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
              >
                ×
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading submissions...</p>
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No submissions yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {submission.profiles.full_name}
                        </h3>
                        <p className="text-sm text-gray-600">{submission.profiles.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Submitted: {new Date(submission.submitted_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {submission.grade !== null ? (
                          <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                            submission.grade >= 70 ? 'bg-success-100 text-success-700' :
                            submission.grade >= 50 ? 'bg-warning-100 text-warning-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {submission.grade}/100
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-600">
                            Not Graded
                          </span>
                        )}
                      </div>
                    </div>

                    {submission.feedback && (
                      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-semibold text-gray-700 mb-1">Feedback:</p>
                        <p className="text-sm text-gray-600">{submission.feedback}</p>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedSubmission(submission)}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                      >
                        View PDF
                      </button>
                      {submission.grade === null && (
                        <button
                          onClick={() => {
                            setGradingSubmission(submission);
                            setGrade('');
                            setFeedback('');
                          }}
                          className="px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors text-sm font-medium"
                        >
                          Grade
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      {selectedSubmission && (
        <PDFViewer
          url={selectedSubmission.file_url}
          title={`Submission by ${selectedSubmission.profiles.full_name}`}
          onClose={() => setSelectedSubmission(null)}
        />
      )}

      {/* Grading Modal */}
      {gradingSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Grade Submission</h2>
                <button
                  onClick={() => setGradingSubmission(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-semibold text-gray-700">Student:</p>
                <p className="text-gray-900">{gradingSubmission.profiles.full_name}</p>
                <p className="text-sm text-gray-600">{gradingSubmission.profiles.email}</p>
              </div>

              <form onSubmit={handleGrade} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Grade (0-100) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="input-field"
                    required
                    placeholder="Enter grade"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Feedback (Optional)
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="input-field"
                    rows={4}
                    placeholder="Provide feedback to the student..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setGradingSubmission(null)}
                    className="btn-secondary"
                    disabled={grading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={grading}
                  >
                    {grading ? 'Grading...' : 'Submit Grade'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
