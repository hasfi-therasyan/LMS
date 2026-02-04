'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

interface UploadAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  jobsheetId: string;
  jobsheetName: string;
}

export default function UploadAssignmentModal({
  isOpen,
  onClose,
  onSuccess,
  jobsheetId,
  jobsheetName
}: UploadAssignmentModalProps) {
  const [nim, setNim] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed');
        return;
      }
      if (droppedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setFile(droppedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nim.trim()) {
      toast.error('Please enter your NIM');
      return;
    }

    if (!file) {
      toast.error('Please select a PDF file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('jobsheetId', jobsheetId);
      formData.append('nim', nim.trim());
      formData.append('file', file);

      await apiClient.uploadAssignment(formData);
      toast.success('Assignment uploaded successfully!');
      onSuccess();
      handleClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload assignment');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setNim('');
    setFile(null);
    setUploading(false);
    setDragActive(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Upload Assignment</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
              disabled={uploading}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nama Jobsheet (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Nama Jobsheet
              </label>
              <input
                type="text"
                value={jobsheetName}
                disabled
                className="input-field w-full bg-gray-50 cursor-not-allowed"
              />
            </div>

            {/* NIM Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                NIM <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                className="input-field w-full"
                placeholder="Enter your NIM"
                required
                disabled={uploading}
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Upload File (PDF) <span className="text-red-500">*</span>
              </label>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <p className="text-xs text-blue-800">
                  <span className="font-semibold">Format Nama File:</span> File harus berformat <span className="font-mono font-semibold">NamaMahasiswa_NomorJobsheet.pdf</span>
                  <br />
                  <span className="text-blue-700 mt-1 block">Contoh: HasfiRasya_JS01.pdf</span>
                </p>
              </div>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${
                  dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
                } border-dashed rounded-md transition-colors`}
              >
                <div className="space-y-1 text-center">
                  {file ? (
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="mt-2 text-sm text-red-600 hover:text-red-700"
                        disabled={uploading}
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <>
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-4V8m-12 8h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            onChange={handleFileChange}
                            accept="application/pdf"
                            disabled={uploading}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={uploading || !file || !nim.trim()}
              >
                {uploading ? 'Uploading...' : 'Upload Assignment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
