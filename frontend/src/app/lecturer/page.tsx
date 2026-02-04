'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import UploadModuleModal from '@/components/UploadModuleModal';
import CreateQuizModal from '@/components/CreateQuizModal';
import QuizSubmissionsModal from '@/components/QuizSubmissionsModal';
import JobsheetSubmissionsModal from '@/components/JobsheetSubmissionsModal';
import LMSLayout from '@/components/LMSLayout';
import StatCard from '@/components/StatCard';

export const dynamic = 'force-dynamic';

interface Module {
  id: string;
  title: string;
  description: string;
  file_url: string;
  created_at: string;
  classes: {
    name: string;
    code: string;
  };
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  module_id: string;
  modules: {
    title: string;
  };
}

interface Jobsheet {
  id: string;
  name: string;
  code: string;
}

export default function LecturerDashboard() {
  const router = useRouter();
  const { profile, loadProfile } = useAuthStore();
  const [modules, setModules] = useState<Module[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [jobsheets, setJobsheets] = useState<Jobsheet[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<{ id: string; title: string } | null>(null);
  const [selectedModule, setSelectedModule] = useState<{ id: string; title: string } | null>(null);
  const [activeSection, setActiveSection] = useState<'overview' | 'modules' | 'quizzes'>('overview');
  const [loading, setLoading] = useState(true);

  // Listen to hash changes
  useEffect(() => {
    // Set default hash if none exists
    if (!window.location.hash) {
      window.location.hash = 'overview';
    }
    
    const hash = window.location.hash.replace('#', '') || 'overview';
    if (['overview', 'modules', 'quizzes'].includes(hash)) {
      setActiveSection(hash as any);
    }

    const handleHashChange = () => {
      const newHash = window.location.hash.replace('#', '') || 'overview';
      if (['overview', 'modules', 'quizzes'].includes(newHash)) {
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
      // Redirect based on actual role
      if (profile.role === 'mahasiswa') {
        router.push('/student');
      } else {
        router.push('/login');
      }
    }
  }, [profile, router, loadProfile]);

  useEffect(() => {
    if (profile && profile.role === 'admin') {
      loadData();
    }
  }, [profile]);

  const loadData = async () => {
    try {
      const [modulesRes, quizzesRes, jobsheetsRes] = await Promise.all([
        apiClient.getModules(),
        apiClient.getQuizzes(),
        apiClient.getJobsheets()
      ]);
      setModules(modulesRes.data);
      setQuizzes(quizzesRes.data);
      setJobsheets(jobsheetsRes.data);
    } catch (error: any) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      name: 'Overview',
      href: '/lecturer#overview',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: 'Modules',
      href: '/lecturer#modules',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      badge: modules.length,
    },
    {
      name: 'Quizzes',
      href: '/lecturer#quizzes',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      badge: quizzes.length,
    },
  ];

  return (
    <LMSLayout
      navItems={navItems}
      title="Lecturer Dashboard"
      subtitle={`Welcome back, ${profile?.full_name || 'Lecturer'}`}
    >
      {/* Overview Section */}
      {activeSection === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Modules"
              value={modules.length}
              gradient="primary"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
            />
            <StatCard
              title="Total Quizzes"
              value={quizzes.length}
              gradient="accent"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setShowUploadModal(true)}
                className="p-5 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 text-left group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">Upload Module</p>
                    <p className="text-sm text-gray-500 mt-1">Add new course material</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setShowQuizModal(true)}
                className="p-5 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 text-left group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">Create Quiz</p>
                    <p className="text-sm text-gray-500 mt-1">Create new assessment</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modules Section */}
      {activeSection === 'modules' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">My Modules</h2>
              <p className="text-sm text-gray-600 mt-1">Manage your course materials and resources</p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Upload Module
            </button>
          </div>

          {modules.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium mb-4">No modules uploaded yet</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Upload Your First Module
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((module) => (
                <div key={module.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                      {module.classes?.code}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{module.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{module.classes?.name}</p>
                  {module.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{module.description}</p>
                  )}
                  <div className="flex items-center space-x-2">
                    <a
                      href={module.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium text-center"
                    >
                      View PDF
                    </a>
                    <button
                      onClick={() => setSelectedModule({ id: module.id, title: module.title })}
                      className="flex-1 px-3 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors text-sm font-medium"
                    >
                      Submissions
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
              <h2 className="text-xl font-semibold text-gray-900">My Quizzes</h2>
              <p className="text-sm text-gray-600 mt-1">Create and manage quizzes for your students</p>
            </div>
            <button
              onClick={() => setShowQuizModal(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Create Quiz
            </button>
          </div>

          {quizzes.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium mb-4">No quizzes created yet</p>
              <button
                onClick={() => setShowQuizModal(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Create Your First Quiz
              </button>
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
                    <span className="px-2 py-1 text-xs font-semibold bg-success-100 text-success-700 rounded">
                      Active
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{quiz.title}</h3>
                  <p className="text-xs text-gray-500 mb-3">{quiz.modules?.title}</p>
                  {quiz.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{quiz.description}</p>
                  )}
                  <button
                    onClick={() => setSelectedQuiz({ id: quiz.id, title: quiz.title })}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    View Submissions
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <UploadModuleModal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          loadData();
        }}
        onSuccess={loadData}
        classes={jobsheets}
      />

      <CreateQuizModal
        isOpen={showQuizModal}
        onClose={() => {
          setShowQuizModal(false);
          loadData();
        }}
        onSuccess={loadData}
        classes={jobsheets}
      />

      {selectedQuiz && (
        <QuizSubmissionsModal
          isOpen={!!selectedQuiz}
          onClose={() => setSelectedQuiz(null)}
          quizId={selectedQuiz.id}
          quizTitle={selectedQuiz.title}
        />
      )}

      {selectedModule && (
        <JobsheetSubmissionsModal
          isOpen={!!selectedModule}
          onClose={() => setSelectedModule(null)}
          moduleId={selectedModule.id}
          moduleTitle={selectedModule.title}
        />
      )}
    </LMSLayout>
  );
}
