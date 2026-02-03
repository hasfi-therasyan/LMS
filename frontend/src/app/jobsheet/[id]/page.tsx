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
  const [pdfError, setPdfError] = useState(false);

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
      const jobsheetData = response.data;
      
      // Validate file_url
      if (jobsheetData.file_url) {
        // Check if URL is valid
        try {
          const url = new URL(jobsheetData.file_url);
          console.log('Jobsheet file URL:', jobsheetData.file_url);
        } catch (urlError) {
          console.error('Invalid file URL:', jobsheetData.file_url);
          toast.error('File URL tidak valid. Silakan hubungi administrator.');
        }
      }
      
      setJobsheet(jobsheetData);
    } catch (error: any) {
      console.error('Error loading jobsheet:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load jobsheet';
      toast.error(errorMessage);
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
              pdfError ? (
                <div className="flex items-center justify-center h-full bg-gray-50">
                  <div className="text-center p-8">
                    <svg
                      className="w-16 h-16 text-gray-400 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-gray-600 mb-2 font-semibold">PDF tidak dapat ditampilkan</p>
                    <p className="text-gray-500 mb-6 text-sm">Silakan buka atau download PDF untuk melihat</p>
                    <div className="flex items-center justify-center space-x-4">
                      <a
                        href={jobsheet.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium inline-flex items-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <span>Buka di Tab Baru</span>
                      </a>
                      <button
                        onClick={handleDownload}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium inline-flex items-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Download PDF</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <iframe
                  src={`${jobsheet.file_url}#toolbar=1&navpanes=1&scrollbar=1`}
                  className="w-full h-full border-0"
                  title={jobsheet.name}
                  onError={() => {
                    console.error('Iframe failed to load PDF');
                    setPdfError(true);
                  }}
                  onLoad={() => {
                    // Set timeout to check if PDF actually loaded
                    setTimeout(() => {
                      // If iframe is still loading after 5 seconds, might be an issue
                      // But we can't reliably detect cross-origin iframe errors
                      console.log('PDF iframe load attempt completed');
                    }, 5000);
                  }}
                />
              )
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-gray-500 mb-4">Tidak ada file PDF tersedia</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
