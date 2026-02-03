'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import CreateJobsheetModal from '@/components/CreateJobsheetModal';
import CreateQuizModal from '@/components/CreateQuizModal';
import QuizSubmissionsModal from '@/components/QuizSubmissionsModal';
import ViewAssignmentsModal from '@/components/ViewAssignmentsModal';
import LMSLayout from '@/components/LMSLayout';
import StatCard from '@/components/StatCard';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'mahasiswa';
  created_at: string;
}

interface Jobsheet {
  id: string;
  name: string;
  code: string;
  description: string;
  file_url?: string;
  admin_id: string;
  created_at: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  created_at: string;
  classes: {
    id: string;
    name: string;
    code: string;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const { profile, loadProfile } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [jobsheets, setJobsheets] = useState<Jobsheet[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeSection, setActiveSection] = useState<'overview' | 'users' | 'jobsheets' | 'quizzes' | 'grades'>('overview');
  const [allAssignments, setAllAssignments] = useState<any[]>([]);
  const [groupedAssignments, setGroupedAssignments] = useState<any[]>([]);
  const [showCreateJobsheet, setShowCreateJobsheet] = useState(false);
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<{ id: string; title: string } | null>(null);
  const [showViewAssignments, setShowViewAssignments] = useState(false);
  const [selectedJobsheetForAssignments, setSelectedJobsheetForAssignments] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentGrades, setStudentGrades] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<{ id: string; name: string; email: string } | null>(null);
  const [showStudentDetail, setShowStudentDetail] = useState(false);

  // Listen to hash changes
  useEffect(() => {
    // Set default hash if none exists
    if (!window.location.hash) {
      window.location.hash = 'overview';
    }
    
    const hash = window.location.hash.replace('#', '') || 'overview';
    if (['overview', 'users', 'jobsheets', 'quizzes', 'grades'].includes(hash)) {
      setActiveSection(hash as any);
    }

    const handleHashChange = () => {
      const newHash = window.location.hash.replace('#', '') || 'overview';
      if (['overview', 'users', 'jobsheets', 'quizzes', 'grades'].includes(newHash)) {
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
    if (profile && profile.role !== 'admin') {
      router.push('/');
    }
  }, [profile, router, loadProfile]);

  useEffect(() => {
    if (profile?.role === 'admin') {
      loadData();
    }
  }, [profile]);

  const loadData = async () => {
    try {
      const [usersRes, jobsheetsRes, quizzesRes, assignmentsRes, submissionsRes] = await Promise.allSettled([
        apiClient.getUsers(),
        apiClient.getJobsheets(),
        apiClient.getQuizzes(),
        apiClient.getAllAssignments(),
        apiClient.getAllSubmissions()
      ]);
      
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data);
      if (jobsheetsRes.status === 'fulfilled') setJobsheets(jobsheetsRes.value.data);
      if (quizzesRes.status === 'fulfilled') setQuizzes(quizzesRes.value.data);
      if (assignmentsRes.status === 'fulfilled') {
        setAllAssignments(assignmentsRes.value.data.assignments || []);
        setGroupedAssignments(assignmentsRes.value.data.groupedByStudent || []);
      }
      
      // Load student grades after getting users and assignments
      if (usersRes.status === 'fulfilled' && assignmentsRes.status === 'fulfilled' && submissionsRes.status === 'fulfilled') {
        await loadStudentGrades(usersRes.value.data, assignmentsRes.value.data.assignments || [], submissionsRes.value.data || []);
      } else {
        // Log errors for debugging
        if (usersRes.status === 'rejected') console.error('Failed to load users:', usersRes.reason);
        if (assignmentsRes.status === 'rejected') console.error('Failed to load assignments:', assignmentsRes.reason);
        if (submissionsRes.status === 'rejected') console.error('Failed to load submissions:', submissionsRes.reason);
      }
    } catch (error: any) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentGrades = async (usersData: User[], assignmentsData: any[], submissionsData: any[]) => {
    try {
      console.log('Loading student grades...', { 
        usersCount: usersData.length, 
        assignmentsCount: assignmentsData.length, 
        submissionsCount: submissionsData.length 
      });
      
      // Get all students (mahasiswa role)
      const students = usersData.filter(u => u.role === 'mahasiswa');
      console.log('Found students:', students.length);
      
      // For each student, get their submissions and assignments
      const studentGradesData = students.map((student) => {
        // Get quiz submissions for this student
        const studentSubmissions = submissionsData.filter((s: any) => s.student_id === student.id);
        
        // Get assignments for this student
        const studentAssignments = assignmentsData.filter(a => a.student_id === student.id);
        
        // Calculate statistics
        const quizScores = studentSubmissions.map((s: any) => ({
          score: Math.round((s.score / s.total_points) * 100),
          quizTitle: s.quizzes?.title || 'Quiz',
          date: new Date(s.submitted_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
          dateValue: new Date(s.submitted_at).getTime()
        }));
        
        const assignmentScores = studentAssignments
          .filter(a => a.grade !== null)
          .map(a => ({
            score: a.grade as number,
            assignmentName: a.classes?.name || a.file_name || 'Assignment',
            date: new Date(a.graded_at || a.uploaded_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
            dateValue: new Date(a.graded_at || a.uploaded_at).getTime()
          }));
        
        const allScores = [...quizScores, ...assignmentScores].sort((a, b) => a.dateValue - b.dateValue);
        const averageScore = allScores.length > 0
          ? Math.round(allScores.reduce((sum, s) => sum + s.score, 0) / allScores.length)
          : 0;
        
        return {
          id: student.id,
          name: student.full_name,
          email: student.email,
          quizSubmissions: studentSubmissions,
          assignments: studentAssignments,
          quizScores,
          assignmentScores,
          allScores,
          averageScore,
          totalQuizzes: studentSubmissions.length,
          totalAssignments: studentAssignments.filter(a => a.grade !== null).length
        };
      });
      
      setStudentGrades(studentGradesData);
      console.log('✅ Student grades loaded:', studentGradesData.length, studentGradesData);
    } catch (error: any) {
      console.error('❌ Error loading student grades:', error);
      toast.error('Failed to load student grades');
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone and will delete all submissions.')) {
      return;
    }

    try {
      await apiClient.deleteQuiz(id);
      toast.success('Quiz deleted successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete quiz');
    }
  };

  const handleDeleteJobsheet = async (id: string) => {
    if (!confirm('Are you sure you want to delete this jobsheet? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.deleteJobsheet(id);
      toast.success('Jobsheet deleted successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete jobsheet');
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const admins = users.filter(u => u.role === 'admin');
  const mahasiswa = users.filter(u => u.role === 'mahasiswa');

  const navItems = [
    {
      name: 'Overview',
      href: '/admin#overview',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: 'Users',
      href: '/admin#users',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      badge: users.length,
    },
    {
      name: 'Jobsheets',
      href: '/admin#jobsheets',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      badge: jobsheets.length,
    },
    {
      name: 'Quizzes',
      href: '/admin#quizzes',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      badge: quizzes.length,
    },
    {
      name: 'Grades',
      href: '/admin#grades',
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
      title="Admin Dashboard"
      subtitle="Manage your learning management system"
    >
      {/* Overview Section */}
      {activeSection === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Users"
              value={users.length}
              gradient="primary"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
            />
            <StatCard
              title="Students"
              value={mahasiswa.length}
              gradient="accent"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
            />
            <StatCard
              title="Jobsheets"
              value={jobsheets.length}
              gradient="success"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              }
            />
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => setShowCreateJobsheet(true)}
                className="p-5 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 text-left group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">Create Jobsheet</p>
                    <p className="text-sm text-gray-500 mt-1">Add new jobsheet</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setShowCreateQuiz(true)}
                className="p-5 border-2 border-dashed border-gray-300 rounded-xl hover:border-accent-500 hover:bg-accent-50 transition-all duration-200 text-left group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 group-hover:text-accent-600 transition-colors">Create Quiz</p>
                    <p className="text-sm text-gray-500 mt-1">Create new quiz</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  window.location.hash = 'jobsheets';
                  setActiveSection('jobsheets');
                }}
                className="p-5 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 text-left group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">Manage Jobsheets</p>
                    <p className="text-sm text-gray-500 mt-1">View all jobsheets</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  window.location.hash = 'quizzes';
                  setActiveSection('quizzes');
                }}
                className="p-5 border-2 border-dashed border-gray-300 rounded-xl hover:border-accent-500 hover:bg-accent-50 transition-all duration-200 text-left group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 group-hover:text-accent-600 transition-colors">Manage Quizzes</p>
                    <p className="text-sm text-gray-500 mt-1">View all quizzes</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  window.location.hash = 'users';
                  setActiveSection('users');
                }}
                className="p-5 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 text-left group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">Manage Users</p>
                    <p className="text-sm text-gray-500 mt-1">View all users</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  // Navigate to first jobsheet with assignments if available
                  if (jobsheets.length > 0) {
                    const firstJobsheet = jobsheets[0];
                    setSelectedJobsheetForAssignments({ id: firstJobsheet.id, name: firstJobsheet.name });
                    setShowViewAssignments(true);
                  } else {
                    toast.error('No jobsheets available');
                  }
                }}
                className="p-5 border-2 border-dashed border-gray-300 rounded-xl hover:border-success-500 hover:bg-success-50 transition-all duration-200 text-left group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 group-hover:text-success-600 transition-colors">View Assignments</p>
                    <p className="text-sm text-gray-500 mt-1">Grade student assignments</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Section */}
      {activeSection === 'users' && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
            <p className="text-sm text-gray-600 mt-1">Manage administrators and students</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Admins ({admins.length})</h3>
              </div>
              <div className="space-y-3">
                {admins.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No admins yet</p>
                ) : (
                  admins.map((user) => (
                    <div key={user.id} className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                        {user.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{user.full_name}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      </div>
                      <span className="px-2 py-1 text-xs font-semibold bg-primary-100 text-primary-700 rounded">
                        Admin
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Students ({mahasiswa.length})</h3>
              </div>
              <div className="space-y-3">
                {mahasiswa.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No students yet</p>
                ) : (
                  mahasiswa.map((user) => (
                    <div key={user.id} className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                        {user.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{user.full_name}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      </div>
                      <span className="px-2 py-1 text-xs font-semibold bg-accent-100 text-accent-700 rounded">
                        Student
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Jobsheets Section */}
      {activeSection === 'jobsheets' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Jobsheet Management</h2>
              <p className="text-sm text-gray-600 mt-1">Create and manage jobsheets</p>
            </div>
            <button
              onClick={() => setShowCreateJobsheet(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Create Jobsheet
            </button>
          </div>

          {jobsheets.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500">No jobsheets yet. Create your first jobsheet to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobsheets.map((jobsheet) => (
                <div key={jobsheet.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer group">
                  <div 
                    onClick={() => router.push(`/jobsheet/${jobsheet.id}`)}
                    className="mb-4"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                        {jobsheet.code}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{jobsheet.name}</h3>
                    {jobsheet.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{jobsheet.description}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedJobsheetForAssignments({ id: jobsheet.id, name: jobsheet.name });
                        setShowViewAssignments(true);
                      }}
                      className="px-3 py-1.5 text-sm bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
                    >
                      View Assignments
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/jobsheet/${jobsheet.id}`);
                      }}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                    >
                      View PDF
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteJobsheet(jobsheet.id);
                      }}
                      className="px-3 py-1.5 text-sm font-medium text-danger-600 bg-danger-50 rounded-lg hover:bg-danger-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quizzes Section */}
      {activeSection === 'quizzes' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Quiz Management</h2>
              <p className="text-sm text-gray-600 mt-1">Create and manage all quizzes</p>
            </div>
            <button
              onClick={() => setShowCreateQuiz(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Create Quiz
            </button>
          </div>

          {quizzes.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500">No quizzes yet. Create your first quiz to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                      {quiz.classes?.code || 'N/A'}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{quiz.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{quiz.classes?.name || 'No class'}</p>
                  {quiz.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{quiz.description}</p>
                  )}
                  <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setSelectedQuiz({ id: quiz.id, title: quiz.title })}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                    >
                      View Submissions
                    </button>
                    <button
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="px-4 py-2 bg-danger-600 text-white rounded-lg hover:bg-danger-700 transition-colors text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Grades Section */}
      {activeSection === 'grades' && (
        <div className="animate-fade-in">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Grades</h2>
            <p className="text-sm text-gray-600">View student progress, submissions, and grades</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading grades...</p>
            </div>
          ) : studentGrades.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-500 mb-2">No student grades available yet.</p>
              <p className="text-sm text-gray-400">Make sure students have submitted quizzes or assignments.</p>
              <p className="text-xs text-gray-400 mt-2">Check browser console (F12) for debugging information.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overall Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card p-4">
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{studentGrades.length}</p>
                </div>
                <div className="card p-4">
                  <p className="text-sm text-gray-600">Students with Quizzes</p>
                  <p className="text-2xl font-bold text-primary-600">
                    {studentGrades.filter(s => s.totalQuizzes > 0).length}
                  </p>
                </div>
                <div className="card p-4">
                  <p className="text-sm text-gray-600">Students with Assignments</p>
                  <p className="text-2xl font-bold text-success-600">
                    {studentGrades.filter(s => s.totalAssignments > 0).length}
                  </p>
                </div>
                <div className="card p-4">
                  <p className="text-sm text-gray-600">Average Score (All)</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {studentGrades.length > 0
                      ? Math.round(
                          studentGrades.reduce((sum, s) => sum + s.averageScore, 0) / studentGrades.length
                        )
                      : 0}%
                  </p>
                </div>
              </div>

              {/* Student List */}
              <div className="card">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Student List</h3>
                <div className="space-y-4">
                  {studentGrades.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => {
                        setSelectedStudent({ id: student.id, name: student.name, email: student.email });
                        setShowStudentDetail(true);
                      }}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary-300 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{student.name}</h4>
                          <p className="text-sm text-gray-600">{student.email}</p>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Quizzes</p>
                            <p className="text-lg font-bold text-primary-600">{student.totalQuizzes}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Assignments</p>
                            <p className="text-lg font-bold text-success-600">{student.totalAssignments}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Average</p>
                            <p className={`text-lg font-bold ${
                              student.averageScore >= 70 ? 'text-success-600' :
                              student.averageScore >= 50 ? 'text-warning-600' :
                              'text-gray-600'
                            }`}>
                              {student.averageScore}%
                            </p>
                          </div>
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Student Detail Modal */}
      {showStudentDetail && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedStudent.name}</h2>
                  <p className="text-gray-600">{selectedStudent.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowStudentDetail(false);
                    setSelectedStudent(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
                >
                  ×
                </button>
              </div>

              {(() => {
                const student = studentGrades.find(s => s.id === selectedStudent.id);
                if (!student) return <p className="text-gray-500">Student data not found.</p>;

                return (
                  <div className="space-y-6">
                    {/* Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="card p-4">
                        <p className="text-sm text-gray-600">Total Quizzes</p>
                        <p className="text-2xl font-bold text-primary-600">{student.totalQuizzes}</p>
                      </div>
                      <div className="card p-4">
                        <p className="text-sm text-gray-600">Total Assignments</p>
                        <p className="text-2xl font-bold text-success-600">{student.totalAssignments}</p>
                      </div>
                      <div className="card p-4">
                        <p className="text-sm text-gray-600">Average Score</p>
                        <p className={`text-2xl font-bold ${
                          student.averageScore >= 70 ? 'text-success-600' :
                          student.averageScore >= 50 ? 'text-warning-600' :
                          'text-gray-600'
                        }`}>
                          {student.averageScore}%
                        </p>
                      </div>
                    </div>

                    {/* Grade Chart */}
                    {student.allScores.length > 0 && (
                      <div className="card">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Grade Trend</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={student.allScores}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" fontSize={12} />
                            <YAxis domain={[0, 100]} label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }} />
                            <Tooltip formatter={(value: number) => [`${value}%`, 'Score']} />
                            <Legend />
                            <Line type="monotone" dataKey="score" name="Score (%)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Quiz Submissions */}
                    {student.quizSubmissions.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Quiz Submissions</h3>
                        <div className="space-y-3">
                          {student.quizSubmissions.map((submission: any) => {
                            const percentage = Math.round((submission.score / submission.total_points) * 100);
                            return (
                              <div key={submission.id} className="card p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-semibold text-gray-900">{submission.quizzes?.title || 'Quiz'}</p>
                                    <p className="text-sm text-gray-600">
                                      {submission.quizzes?.classes?.code || 'N/A'} - {submission.quizzes?.classes?.name || 'No class'}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-lg">
                                      {submission.score} / {submission.total_points}
                                    </p>
                                    <p className={`text-sm font-medium ${
                                      percentage >= 70 ? 'text-success-600' :
                                      percentage >= 50 ? 'text-warning-600' :
                                      'text-gray-600'
                                    }`}>
                                      {percentage}%
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {new Date(submission.submitted_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Assignment Submissions */}
                    {student.assignments.filter(a => a.grade !== null).length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Assignment Submissions</h3>
                        <div className="space-y-3">
                          {student.assignments
                            .filter(a => a.grade !== null)
                            .map((assignment: any) => {
                              const percentage = assignment.grade as number;
                              return (
                                <div key={assignment.id} className="card p-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-semibold text-gray-900">
                                        {assignment.classes?.name || assignment.file_name || 'Assignment'}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {assignment.classes?.code || 'N/A'} - {assignment.file_name}
                                      </p>
                                      {assignment.feedback && (
                                        <p className="text-sm text-gray-700 mt-1">{assignment.feedback}</p>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <p className={`text-lg font-bold ${
                                        percentage >= 70 ? 'text-success-600' :
                                        percentage >= 50 ? 'text-warning-600' :
                                        'text-gray-600'
                                      }`}>
                                        {percentage}%
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {assignment.graded_at
                                          ? new Date(assignment.graded_at).toLocaleDateString()
                                          : new Date(assignment.uploaded_at).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}

                    {student.quizSubmissions.length === 0 && student.assignments.filter(a => a.grade !== null).length === 0 && (
                      <div className="card text-center py-8">
                        <p className="text-gray-500">No submissions available for this student.</p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateJobsheet && (
        <CreateJobsheetModal
          isOpen={showCreateJobsheet}
          onClose={() => {
            setShowCreateJobsheet(false);
            loadData();
          }}
        />
      )}

      {showCreateQuiz && (
        <CreateQuizModal
          isOpen={showCreateQuiz}
          onClose={() => {
            setShowCreateQuiz(false);
            loadData();
          }}
          onSuccess={loadData}
          classes={jobsheets}
        />
      )}

      {selectedQuiz && (
        <QuizSubmissionsModal
          isOpen={!!selectedQuiz}
          onClose={() => setSelectedQuiz(null)}
          quizId={selectedQuiz.id}
          quizTitle={selectedQuiz.title}
        />
      )}

      {showViewAssignments && selectedJobsheetForAssignments && (
        <ViewAssignmentsModal
          isOpen={showViewAssignments}
          onClose={() => {
            setShowViewAssignments(false);
            setSelectedJobsheetForAssignments(null);
          }}
          jobsheetId={selectedJobsheetForAssignments.id}
          jobsheetName={selectedJobsheetForAssignments.name}
        />
      )}
    </LMSLayout>
  );
}
