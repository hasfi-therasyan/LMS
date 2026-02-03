'use client';

/**
 * Student Dashboard - Professional Redesign
 * 
 * Modern, professional student dashboard with beautiful UI
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';
import QuizComponent from '@/components/QuizComponent';
import LMSLayout from '@/components/LMSLayout';
import StatCard from '@/components/StatCard';
import PDFViewer from '@/components/PDFViewer';
import SubmitJobsheetModal from '@/components/SubmitJobsheetModal';
import UploadAssignmentModal from '@/components/UploadAssignmentModal';
import toast from 'react-hot-toast';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface Jobsheet {
  id: string;
  name: string;
  code: string;
  description: string;
  file_url?: string;
  created_at: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  class_id: string;
  classes: {
    name: string;
    code: string;
  };
}

interface Submission {
  id: string;
  score: number;
  total_points: number;
  submitted_at: string;
  quizzes: {
    id: string;
    title: string;
    description: string;
    classes: {
      code: string;
      name: string;
    };
  };
}

export default function StudentDashboard() {
  const router = useRouter();
  const { profile, loadProfile } = useAuthStore();
  const [jobsheets, setJobsheets] = useState<Jobsheet[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'overview' | 'jobsheets' | 'assignments' | 'quizzes' | 'grades'>('overview');
  const [loading, setLoading] = useState(true);
  const [selectedPDF, setSelectedPDF] = useState<{ url: string; title: string } | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedJobsheet, setSelectedJobsheet] = useState<{ id: string; name: string } | null>(null);
  const [jobsheetSubmissions, setJobsheetSubmissions] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [showUploadAssignment, setShowUploadAssignment] = useState(false);
  const [selectedJobsheetForAssignment, setSelectedJobsheetForAssignment] = useState<{ id: string; name: string } | null>(null);

  // Listen to hash changes
  useEffect(() => {
    // Set default hash if none exists
    if (!window.location.hash) {
      window.location.hash = 'overview';
    }
    
    const hash = window.location.hash.replace('#', '') || 'overview';
    if (['overview', 'jobsheets', 'assignments', 'quizzes', 'grades'].includes(hash)) {
      setActiveSection(hash as any);
    }

    const handleHashChange = () => {
      const newHash = window.location.hash.replace('#', '') || 'overview';
      if (['overview', 'jobsheets', 'assignments', 'quizzes', 'grades'].includes(newHash)) {
        setActiveSection(newHash as any);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (!profile) {
      loadProfile();
    }
    if (profile && profile.role !== 'mahasiswa') {
      router.push('/');
    }
  }, [profile, router, loadProfile]);

  useEffect(() => {
    if (profile?.role === 'mahasiswa') {
      loadData();
    }
  }, [profile]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Use Promise.allSettled to handle errors individually
      const [jobsheetsResult, quizzesResult, submissionsResult, jobsheetSubmissionsResult, assignmentsResult] = await Promise.allSettled([
        apiClient.getJobsheets(),
        apiClient.getQuizzes(),
        apiClient.getStudentSubmissions(),
        apiClient.getStudentJobsheetSubmissions(),
        apiClient.getStudentAssignments()
      ]);

      // Handle jobsheets
      if (jobsheetsResult.status === 'fulfilled') {
        setJobsheets(jobsheetsResult.value.data || []);
      } else {
        console.error('Error loading jobsheets:', jobsheetsResult.reason);
        toast.error(`Failed to load jobsheets: ${jobsheetsResult.reason.response?.data?.message || jobsheetsResult.reason.message || 'Unknown error'}`);
        setJobsheets([]);
      }

      // Handle quizzes
      if (quizzesResult.status === 'fulfilled') {
        setQuizzes(quizzesResult.value.data || []);
      } else {
        console.error('Error loading quizzes:', quizzesResult.reason);
        // Don't show toast for quizzes error, just log it
        setQuizzes([]);
      }

      // Handle submissions
      if (submissionsResult.status === 'fulfilled') {
        const submissionsData = submissionsResult.value.data || [];
        console.log('✅ Submissions loaded:', submissionsData.length, submissionsData);
        setSubmissions(submissionsData);
      } else {
        console.error('❌ Error loading submissions:', submissionsResult.reason);
        // Don't show toast for submissions error, just log it
        setSubmissions([]);
      }

      // Handle jobsheet submissions
      if (jobsheetSubmissionsResult.status === 'fulfilled') {
        setJobsheetSubmissions(jobsheetSubmissionsResult.value.data || []);
      } else {
        console.error('Error loading jobsheet submissions:', jobsheetSubmissionsResult.reason);
        // Don't show toast for jobsheet submissions error, just log it
        setJobsheetSubmissions([]);
      }

      // Handle assignments
      if (assignmentsResult.status === 'fulfilled') {
        const assignmentsData = assignmentsResult.value.data || [];
        console.log('✅ Assignments loaded:', assignmentsData.length, assignmentsData);
        setAssignments(assignmentsData);
      } else {
        console.error('❌ Error loading assignments:', assignmentsResult.reason);
        setAssignments([]);
      }
    } catch (error: any) {
      console.error('Unexpected error loading data:', error);
      toast.error(`Unexpected error: ${error.message || 'Failed to load data'}`);
      // Set empty arrays on error to prevent UI from breaking
      setJobsheets([]);
      setQuizzes([]);
      setSubmissions([]);
      setJobsheetSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiClient.deleteAssignment(assignmentId);
      toast.success('Assignment deleted successfully');
      loadData(); // Refresh data
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete assignment');
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="spinner w-16 h-16 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (selectedQuiz) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setSelectedQuiz(null)}
              className="text-primary-600 hover:text-primary-700 font-semibold flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Dashboard</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Take Quiz</h1>
            <div></div>
          </div>
        </div>
        <QuizComponent quizId={selectedQuiz} />
      </div>
    );
  }

  // Calculate statistics
  const totalJobsheets = jobsheets.length;
  const totalQuizzes = quizzes.length;
  const totalAssignments = assignments.length;
  const totalQuizzesAndAssignments = totalQuizzes + totalAssignments;
  
  // Calculate average score from quizzes and assignments
  const quizScores = submissions.map(s => (s.score / s.total_points) * 100);
  const assignmentScores = assignments
    .filter(a => a.grade !== null)
    .map(a => a.grade as number);
  const allScores = [...quizScores, ...assignmentScores];
  const averageScore = allScores.length > 0
    ? Math.round(allScores.reduce((sum, score) => sum + score, 0) / allScores.length)
    : 0;

  const navItems = [
    {
      name: 'Overview',
      href: '/student#overview',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: 'Jobsheets',
      href: '/student#jobsheets',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      badge: totalJobsheets,
    },
    {
      name: 'Assignments',
      href: '/student#assignments',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      badge: assignments.length,
    },
    {
      name: 'Quizzes',
      href: '/student#quizzes',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      badge: totalQuizzes,
    },
    {
      name: 'Grades',
      href: '/student#grades',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
  ];

  return (
    <LMSLayout
      navItems={navItems}
      title="Student Dashboard"
      subtitle={`Welcome back, ${profile?.full_name || 'Student'}`}
    >
      {/* Overview Section */}
      {activeSection === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Total Jobsheets"
              value={totalJobsheets}
              gradient="primary"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              }
            />
            <StatCard
              title="Quizzes & Assignments"
              value={totalQuizzesAndAssignments}
              gradient="accent"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            />
            <StatCard
              title="Average Score"
              value={`${averageScore}%`}
              gradient="warning"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            />
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Jobsheets */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Recent Jobsheets</h3>
                <button
                  onClick={() => {
                    window.location.hash = 'jobsheets';
                    setActiveSection('jobsheets');
                  }}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {jobsheets.slice(0, 4).map((jobsheet) => (
                  <div
                    key={jobsheet.id}
                    onClick={() => router.push(`/jobsheet/${jobsheet.id}`)}
                    className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 group cursor-pointer"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                        {jobsheet.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{jobsheet.code}</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                ))}
                {jobsheets.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">No jobsheets available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Grades */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Recent Grades</h3>
                <button
                  onClick={() => {
                    window.location.hash = 'grades';
                    setActiveSection('grades');
                  }}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {(() => {
                  // Combine quiz submissions and graded assignments
                  const quizGrades = submissions.map(s => ({
                    id: s.id,
                    type: 'quiz' as const,
                    title: s.quizzes.title,
                    score: s.score,
                    total: s.total_points,
                    percentage: Math.round((s.score / s.total_points) * 100),
                    date: s.submitted_at,
                    classInfo: s.quizzes.classes
                  }));
                  
                  const assignmentGrades = assignments
                    .filter(a => a.grade !== null)
                    .map(a => ({
                      id: a.id,
                      type: 'assignment' as const,
                      title: `${a.classes?.name || 'Assignment'}: ${a.file_name}`,
                      score: a.grade as number,
                      total: 100,
                      percentage: a.grade as number,
                      date: a.graded_at || a.uploaded_at,
                      classInfo: a.classes
                    }));
                  
                  const allGrades = [...quizGrades, ...assignmentGrades]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 4);
                  
                  return allGrades.map((grade) => (
                    <div
                      key={`${grade.type}-${grade.id}`}
                      className="p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-100"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1 min-w-0 mr-2">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {grade.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {grade.type === 'quiz' ? 'Quiz' : 'Assignment'}
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                          grade.percentage >= 70 ? 'bg-success-100 text-success-700' :
                          grade.percentage >= 50 ? 'bg-warning-100 text-warning-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {grade.percentage}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>
                          {grade.type === 'quiz' 
                            ? `${grade.score} / ${grade.total} points`
                            : `${grade.score} / ${grade.total}`
                          }
                        </span>
                        <span>{new Date(grade.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ));
                })()}
                {submissions.length === 0 && assignments.filter(a => a.grade !== null).length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">No grades available yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Jobsheets Section */}
      {activeSection === 'jobsheets' && (
        <div className="animate-fade-in">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Jobsheets</h2>
            <p className="text-sm text-gray-600">Access your jobsheet materials and view PDFs</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobsheets.map((jobsheet) => {
              return (
                <div
                  key={jobsheet.id}
                  onClick={() => {
                    if (jobsheet.file_url) {
                      router.push(`/jobsheet/${jobsheet.id}`);
                    }
                  }}
                  className={`card-hover ${jobsheet.file_url ? 'cursor-pointer' : ''}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <span className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-lg">
                      {jobsheet.code}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {jobsheet.name}
                  </h3>
                  {jobsheet.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{jobsheet.description}</p>
                  )}
                  <div className="flex items-center space-x-2">
                    {jobsheet.file_url ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/jobsheet/${jobsheet.id}`);
                        }}
                        className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                      >
                        View PDF
                      </button>
                    ) : (
                      <span className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium text-center">
                        No PDF Available
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {jobsheets.length === 0 && (
              <div className="col-span-full text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">No jobsheets available</p>
                <p className="text-sm text-gray-400 mt-1">You haven't been enrolled in any jobsheets yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assignments Section */}
      {activeSection === 'assignments' && (
        <div className="animate-fade-in">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Jobsheet Assignments</h2>
            <p className="text-sm text-gray-600">Upload your assignment files (Maximum 4 files per jobsheet)</p>
          </div>
          <div className="space-y-6">
            {jobsheets.map((jobsheet) => {
              const jobsheetAssignments = assignments.filter(a => a.classes?.id === jobsheet.id);
              const uploadedCount = jobsheetAssignments.length;
              const canUpload = uploadedCount < 4;
              
              return (
                <div
                  key={jobsheet.id}
                  className="card overflow-hidden"
                >
                  {/* Header Section - Horizontal */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900 truncate">
                            {jobsheet.name}
                          </h3>
                          <span className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-lg whitespace-nowrap">
                            {jobsheet.code}
                          </span>
                        </div>
                        {jobsheet.description && (
                          <p className="text-sm text-gray-600 line-clamp-1">{jobsheet.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 ml-6 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Progress</p>
                        <p className="text-lg font-bold text-gray-900">{uploadedCount} / 4</p>
                      </div>
                      <div className="w-32 bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-primary-600 h-3 rounded-full transition-all"
                          style={{ width: `${(uploadedCount / 4) * 100}%` }}
                        ></div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedJobsheetForAssignment({ id: jobsheet.id, name: jobsheet.name });
                          setShowUploadAssignment(true);
                        }}
                        disabled={!canUpload}
                        className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                          canUpload
                            ? 'bg-primary-600 text-white hover:bg-primary-700'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {canUpload ? 'Upload Assignment' : 'Limit Reached'}
                      </button>
                    </div>
                  </div>

                  {/* Assignments List - Horizontal Scroll */}
                  {uploadedCount > 0 && (
                    <div className="p-6">
                      <p className="text-sm font-semibold text-gray-900 mb-4">Uploaded Files & Results:</p>
                      <div className="overflow-x-auto">
                        <div className="flex space-x-4 min-w-max pb-2">
                          {jobsheetAssignments.map((assignment) => (
                            <div key={assignment.id} className="flex-shrink-0 w-80 p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0 mr-3">
                                  <p className="text-sm font-medium text-gray-900 truncate mb-1">{assignment.file_name}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(assignment.uploaded_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2 flex-shrink-0">
                                  {assignment.grade !== null && (
                                    <span className={`px-3 py-1 rounded-lg text-sm font-bold whitespace-nowrap ${
                                      assignment.grade >= 70 ? 'bg-success-100 text-success-700' :
                                      assignment.grade >= 50 ? 'bg-warning-100 text-warning-700' :
                                      'bg-gray-100 text-gray-700'
                                    }`}>
                                      {assignment.grade}
                                    </span>
                                  )}
                                  <button
                                    onClick={() => handleDeleteAssignment(assignment.id, assignment.file_name)}
                                    className="p-1.5 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                                    title="Delete assignment"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                              
                              {assignment.grade !== null && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <svg className="w-4 h-4 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-xs font-semibold text-gray-700">Graded</p>
                                  </div>
                                  {assignment.feedback && (
                                    <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                                      <p className="text-xs font-semibold text-gray-700 mb-1">Feedback:</p>
                                      <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">{assignment.feedback}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {assignment.grade === null && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <p className="text-xs text-gray-500 italic">Waiting for grading...</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {jobsheets.length === 0 && (
              <div className="card text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">No jobsheets available</p>
                <p className="text-sm text-gray-400 mt-1">No jobsheets found to upload assignments</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PDF Viewer */}
      {selectedPDF && (
        <PDFViewer
          url={selectedPDF.url}
          title={selectedPDF.title}
          onClose={() => setSelectedPDF(null)}
        />
      )}

      {/* Upload Assignment Modal */}
      {showUploadAssignment && selectedJobsheetForAssignment && (
        <UploadAssignmentModal
          isOpen={showUploadAssignment}
          onClose={() => {
            setShowUploadAssignment(false);
            setSelectedJobsheetForAssignment(null);
          }}
          onSuccess={() => {
            loadData();
          }}
          jobsheetId={selectedJobsheetForAssignment.id}
          jobsheetName={selectedJobsheetForAssignment.name}
        />
      )}

      {/* Submit Jobsheet Modal */}
      {showSubmitModal && selectedJobsheet && (
        <SubmitJobsheetModal
          isOpen={showSubmitModal}
          onClose={() => {
            setShowSubmitModal(false);
            setSelectedJobsheet(null);
          }}
          onSuccess={() => {
            loadData();
          }}
          moduleId={selectedJobsheet.id}
          moduleTitle={selectedJobsheet.name}
        />
      )}

      {/* Quizzes Section */}
      {activeSection === 'quizzes' && (
        <div className="animate-fade-in">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Quizzes</h2>
            <p className="text-sm text-gray-600">Take quizzes to test your knowledge</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => {
              const submission = submissions.find(s => s.quizzes.id === quiz.id);
              const percentage = submission ? Math.round((submission.score / submission.total_points) * 100) : null;
              
              return (
                <div key={quiz.id} className="card-hover">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    {submission && (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        percentage! >= 70 ? 'bg-success-100 text-success-700' :
                        percentage! >= 50 ? 'bg-warning-100 text-warning-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {percentage}%
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{quiz.title}</h3>
                  <p className="text-xs text-gray-500 mb-3 font-medium">{quiz.classes?.name || 'No class'}</p>
                  {quiz.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{quiz.description}</p>
                  )}
                  {submission ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Score:</span>
                        <span className="font-bold text-gray-900">
                          {submission.score} / {submission.total_points}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedQuiz(quiz.id)}
                        className="w-full px-4 py-2.5 text-sm font-semibold text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                      >
                        Lihat Hasil Quiz
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedQuiz(quiz.id)}
                      className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg hover:from-primary-700 hover:to-primary-800 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                    >
                      Take Quiz
                    </button>
                  )}
                </div>
              );
            })}
            {quizzes.length === 0 && (
              <div className="col-span-full text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">No quizzes available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grades Section */}
      {activeSection === 'grades' && (
        <div className="animate-fade-in">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">My Grades</h2>
            <p className="text-sm text-gray-600">View your quiz and assignment results</p>
          </div>

          {/* Grades Chart */}
          {(() => {
            console.log('📊 Rendering grades chart. Submissions:', submissions.length, 'Assignments:', assignments.length);
            
            // Prepare data for charts
            const quizGrades = submissions
              .filter(s => s.quizzes && s.score !== undefined && s.total_points !== undefined)
              .map(s => {
                const percentage = Math.round((s.score / s.total_points) * 100);
                const date = new Date(s.submitted_at);
                return {
                  name: s.quizzes?.title?.length > 20 ? s.quizzes.title.substring(0, 20) + '...' : (s.quizzes?.title || 'Quiz'),
                  fullName: s.quizzes?.title || 'Quiz',
                  type: 'Quiz',
                  score: percentage,
                  date: date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
                  dateValue: date.getTime()
                };
              });

            const assignmentGrades = assignments
              .filter(a => a.grade !== null && a.grade !== undefined)
              .map(a => {
                const date = new Date(a.graded_at || a.uploaded_at);
                const assignmentName = a.classes?.name || a.file_name || 'Assignment';
                return {
                  name: assignmentName.length > 20 
                    ? assignmentName.substring(0, 20) + '...' 
                    : assignmentName,
                  fullName: assignmentName,
                  type: 'Assignment',
                  score: a.grade as number,
                  date: date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
                  dateValue: date.getTime()
                };
              });

            const allGrades = [...quizGrades, ...assignmentGrades]
              .sort((a, b) => a.dateValue - b.dateValue);

            console.log('📈 Chart data prepared:', {
              quizGrades: quizGrades.length,
              assignmentGrades: assignmentGrades.length,
              allGrades: allGrades.length,
              allGradesData: allGrades
            });

            // Show charts even if only one type has data
            const hasData = allGrades.length > 0;
            
            if (!hasData) {
              return (
                <div className="card mb-6">
                  <div className="text-center py-8">
                    <p className="text-gray-500">No grades available yet. Complete quizzes and assignments to see your progress.</p>
                  </div>
                </div>
              );
            }

            return (
              <div className="mb-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Bar Chart */}
                  <div className="card">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Grade Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={allGrades}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          fontSize={12}
                        />
                        <YAxis 
                          domain={[0, 100]}
                          label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip 
                          formatter={(value: number | undefined) => value !== undefined ? [`${value}%`, 'Score'] : ['', 'Score']}
                          labelFormatter={(label, payload) => {
                            if (payload && payload[0]) {
                              return payload[0].payload.fullName;
                            }
                            return label;
                          }}
                        />
                        <Legend />
                        <Bar dataKey="score" name="Score (%)" radius={[8, 8, 0, 0]}>
                          {allGrades.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={
                                entry.score >= 70 ? '#10b981' :
                                entry.score >= 50 ? '#f59e0b' :
                                '#6b7280'
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Line Chart */}
                  <div className="card">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Grade Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={allGrades}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date"
                          fontSize={12}
                        />
                        <YAxis 
                          domain={[0, 100]}
                          label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip 
                          formatter={(value: number | undefined) => value !== undefined ? [`${value}%`, 'Score'] : ['', 'Score']}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          name="Score (%)" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Summary Statistics */}
                <div className="card mt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-700">
                        {allGrades.length}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Total Grades</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-700">
                        {quizGrades.length}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Quiz Grades</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-700">
                        {assignmentGrades.length}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Assignment Grades</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <p className="text-2xl font-bold text-orange-700">
                        {allGrades.length > 0 
                          ? Math.round(allGrades.reduce((sum, g) => sum + g.score, 0) / allGrades.length)
                          : 0}%
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Average Score</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
          
          {/* Quiz Grades */}
          {submissions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quiz Grades</h3>
              <div className="card overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {submissions
                    .filter(s => s.quizzes && s.score !== undefined && s.total_points !== undefined)
                    .map((submission) => {
                const percentage = Math.round((submission.score / submission.total_points) * 100);
                return (
                  <div key={submission.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {submission.quizzes?.title || 'Quiz'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {submission.quizzes?.classes?.code || 'N/A'} - {submission.quizzes?.classes?.name || 'No class'}
                        </p>
                      </div>
                      <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
                        percentage >= 70 ? 'bg-success-100 text-success-700' :
                        percentage >= 50 ? 'bg-warning-100 text-warning-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {percentage}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1 mr-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600 font-medium">Score</span>
                          <span className="font-bold text-gray-900">
                            {submission.score} / {submission.total_points}
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className={`progress-fill ${
                              percentage >= 70 ? 'bg-success-600' :
                              percentage >= 50 ? 'bg-warning-500' :
                              'bg-gray-400'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      Submitted: {new Date(submission.submitted_at).toLocaleString()}
                    </p>
                  </div>
                );
              })}
                </div>
              </div>
            </div>
          )}

          {/* Assignment Grades */}
          {assignments.filter(a => a.grade !== null).length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Assignment Grades</h3>
              <div className="card overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {assignments
                    .filter(a => a.grade !== null)
                    .map((assignment) => {
                      const percentage = assignment.grade as number;
                      return (
                        <div key={assignment.id} className="p-6 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 mb-1">
                                {assignment.classes?.name || 'Assignment'}
                              </h3>
                              <p className="text-sm text-gray-600 mb-1">
                                {assignment.classes?.code || 'N/A'} - {assignment.file_name}
                              </p>
                              {assignment.feedback && (
                                <p className="text-sm text-gray-700 mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                  <span className="font-semibold">Feedback: </span>
                                  {assignment.feedback}
                                </p>
                              )}
                            </div>
                            <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
                              percentage >= 70 ? 'bg-success-100 text-success-700' :
                              percentage >= 50 ? 'bg-warning-100 text-warning-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {percentage}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex-1 mr-4">
                              <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-gray-600 font-medium">Score</span>
                                <span className="font-bold text-gray-900">
                                  {percentage} / 100
                                </span>
                              </div>
                              <div className="progress-bar">
                                <div
                                  className={`progress-fill ${
                                    percentage >= 70 ? 'bg-success-600' :
                                    percentage >= 50 ? 'bg-warning-500' :
                                    'bg-gray-400'
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-3">
                            {assignment.graded_at 
                              ? `Graded: ${new Date(assignment.graded_at).toLocaleString()}`
                              : `Uploaded: ${new Date(assignment.uploaded_at).toLocaleString()}`
                            }
                          </p>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {submissions.length === 0 && assignments.filter(a => a.grade !== null).length === 0 && (
            <div className="card text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
              <p className="text-gray-500 font-medium">No grades available yet</p>
              <p className="text-sm text-gray-400 mt-1">Complete quizzes and assignments to see your grades</p>
            </div>
          )}
        </div>
      )}
    </LMSLayout>
  );
}
