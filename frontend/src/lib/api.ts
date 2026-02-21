/**
 * API Client
 * 
 * Centralized API client for making requests to the backend.
 * Handles authentication, error handling, and request formatting.
 */

import axios from 'axios';
import { getSession } from './supabase';

// Use relative path for Next.js API routes (same domain)
// All API routes are now in the same Next.js app at /api/*
// If NEXT_PUBLIC_API_URL is set, use it (for external backend), otherwise use relative path
// In browser, we need to use absolute URL for relative paths to work correctly
const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return `${process.env.NEXT_PUBLIC_API_URL}/api`;
  }
  // Use relative path - axios will resolve it correctly
  return '/api';
};

// Create axios instance
const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API methods
export const apiClient = {
  // Auth
  getProfile: () => api.get('/auth/me'),
  signup: (data: { email: string; password: string; full_name: string }) =>
    api.post('/auth/signup', data),
  createAdmin: (data: { userId: string; email: string; fullName: string }) =>
    api.post('/auth/create-admin', data),

  // Modules
  getModules: () => api.get('/modules'),
  getModule: (id: string) => api.get(`/modules/${id}`),
  uploadModule: (formData: FormData) =>
    api.post('/modules', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  // Quizzes
  getQuizzes: () => api.get('/quizzes'),
  getQuiz: (id: string) => api.get(`/quizzes/${id}`),
  createQuiz: (data: any) => api.post('/quizzes', data),
  updateQuiz: (id: string, data: any) => api.put(`/quizzes/${id}`, data),
  setQuizPublish: (id: string, isPublished: boolean) =>
    api.patch(`/quizzes/${id}/publish`, { is_published: isPublished }),
  deleteQuiz: (id: string) => api.delete(`/quizzes/${id}`),
  submitQuiz: (quizId: string, answers: Array<{ questionId: string; answer: string }>) =>
    api.post(`/quizzes/${quizId}/submit`, { answers }),

  // AI Chat
  startChat: (submissionId: string, questionId: string) =>
    api.post('/ai/chat/start', { submissionId, questionId }),
  sendMessage: (sessionId: string, content: string) =>
    api.post(`/ai/chat/${sessionId}/message`, { content }),
  getChatSession: (sessionId: string) =>
    api.get(`/ai/chat/${sessionId}`),

  // Jobsheet
  getJobsheets: () => api.get('/jobsheet'),
  getJobsheet: (id: string) => api.get(`/jobsheet/${id}`),
  createJobsheet: (formData: FormData) =>
    api.post('/jobsheet', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  deleteJobsheet: (id: string) => api.delete(`/jobsheet/${id}`),

  // Submissions
  getQuizSubmissions: (quizId: string) => api.get(`/submissions/quiz/${quizId}`),
  getQuizAnalytics: (quizId: string) => api.get(`/submissions/analytics/${quizId}`),
  getStudentSubmissions: () => api.get('/submissions/student'),
  getAllSubmissions: () => api.get('/submissions/all'),

  // Admin
  getUsers: () => api.get('/admin/users'),

  // Jobsheet Submissions
  submitJobsheet: (formData: FormData) =>
    api.post('/jobsheet-submissions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getJobsheetSubmissions: (moduleId: string) =>
    api.get(`/jobsheet-submissions/module/${moduleId}`),
  getStudentJobsheetSubmissions: () =>
    api.get('/jobsheet-submissions/student'),
  gradeJobsheetSubmission: (submissionId: string, data: { grade: number; feedback?: string }) =>
    api.patch(`/jobsheet-submissions/${submissionId}/grade`, data),

  // Jobsheet Assignments
  uploadAssignment: (formData: FormData) =>
    api.post('/jobsheet-assignments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getStudentAssignments: () =>
    api.get('/jobsheet-assignments/student'),
  getAssignmentsForJobsheet: (jobsheetId: string) =>
    api.get(`/jobsheet-assignments/jobsheet/${jobsheetId}`),
  getAllAssignments: () =>
    api.get('/jobsheet-assignments/all'),
  gradeAssignment: (assignmentId: string, data: { grade: number; feedback?: string }) =>
    api.put(`/jobsheet-assignments/${assignmentId}/grade`, data),
  deleteAssignment: (assignmentId: string) =>
    api.delete(`/jobsheet-assignments/${assignmentId}`)
};

export default api;
