'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import PDFViewer from '@/components/PDFViewer';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Jobsheet {
  id: string;
  name: string;
  code: string;
  description: string;
  file_url: string;
  admin_id: string;
  created_at: string;
}

export default function JobsheetViewPage() {
  const params = useParams();
  const router = useRouter();
  const { profile, loadProfile } = useAuthStore();
  const [jobsheet, setJobsheet] = useState<Jobsheet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) {
      loadProfile();
    }
  }, [profile, loadProfile]);

  useEffect(() => {
    if (!profile) {
      loadProfile();
    }
  }, [profile, loadProfile]);

  useEffect(() => {
    if (params.id && profile) {
      loadJobsheet();
    }
  }, [params.id, profile]);

  const loadJobsheet = async () => {
    if (!params.id) return;
    
    setLoading(true);
    try {
      const response = await apiClient.getJobsheet(params.id as string);
      setJobsheet(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load jobsheet');
      // Redirect based on role
      if (profile?.role === 'admin') {
        router.push('/admin#jobsheets');
      } else {
        router.push('/student#jobsheets');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (jobsheet?.file_url) {
      const link = document.createElement('a');
      link.href = jobsheet.file_url;
      link.download = `${jobsheet.code}-${jobsheet.name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!jobsheet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Jobsheet not found</p>
          <button
            onClick={() => router.push('/admin')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{jobsheet.name}</h1>
                <p className="text-sm text-gray-600">{jobsheet.code}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download PDF</span>
              </button>
            </div>
          </div>
          {jobsheet.description && (
            <p className="mt-3 text-gray-600">{jobsheet.description}</p>
          )}
        </div>
      </header>

      {/* PDF Viewer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-[calc(100vh-200px)]">
            {jobsheet.file_url ? (
              <iframe
                src={jobsheet.file_url}
                className="w-full h-full border-0"
                title={jobsheet.name}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-gray-500 mb-4">No PDF file available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
