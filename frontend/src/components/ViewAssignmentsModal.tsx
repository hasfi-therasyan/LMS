'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import PDFViewer from './PDFViewer';

interface Assignment {
  id: string;
  jobsheet_id: string;
  student_id: string;
  nim: string;
  file_url: string;
  file_name: string;
  uploaded_at: string;
  grade: number | null;
  feedback: string | null;
  graded_at: string | null;
  profiles: {
    id: string;
    full_name: string;
    email: string;
  };
  classes: {
    id: string;
    name: string;
    code: string;
  };
}

interface ViewAssignmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobsheetId: string;
  jobsheetName: string;
}

export default function ViewAssignmentsModal({
  isOpen,
  onClose,
  jobsheetId,
  jobsheetName
}: ViewAssignmentsModalProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [groupedAssignments, setGroupedAssignments] = useState<Record<string, Assignment[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [gradingAssignmentId, setGradingAssignmentId] = useState<string | null>(null);
  const [grade, setGrade] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [isGrading, setIsGrading] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setSearchQuery(''); // Reset search when modal opens
      loadAssignments();
    }
  }, [isOpen, jobsheetId]);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getAssignmentsForJobsheet(jobsheetId);
      setAssignments(response.data.assignments || []);
      
      // Group by student (NIM) - response already has groupedByStudent
      if (response.data.groupedByStudent) {
        const grouped: Record<string, Assignment[]> = {};
        response.data.groupedByStudent.forEach((group: any) => {
          const key = `${group[0]?.student_id}_${group[0]?.nim}`;
          grouped[key] = group;
        });
        setGroupedAssignments(grouped);
      } else {
        // Fallback: group manually
        const grouped: Record<string, Assignment[]> = {};
        response.data.assignments?.forEach((assignment: Assignment) => {
          const key = `${assignment.student_id}_${assignment.nim}`;
          if (!grouped[key]) {
            grouped[key] = [];
          }
          grouped[key].push(assignment);
        });
        setGroupedAssignments(grouped);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeClick = (assignment: Assignment) => {
    setGradingAssignmentId(assignment.id);
    setGrade(assignment.grade?.toString() || '');
    setFeedback(assignment.feedback || '');
  };

  const handleSaveGrade = async () => {
    if (!gradingAssignmentId) return;

    const parsedGrade = parseInt(grade);
    if (isNaN(parsedGrade) || parsedGrade < 0 || parsedGrade > 100) {
      toast.error('Grade must be a number between 0 and 100');
      return;
    }

    setIsGrading(true);
    try {
      await apiClient.gradeAssignment(gradingAssignmentId, { grade: parsedGrade, feedback });
      toast.success('Grade saved successfully!');
      setGradingAssignmentId(null);
      setGrade('');
      setFeedback('');
      loadAssignments(); // Refresh assignments
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save grade');
    } finally {
      setIsGrading(false);
    }
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started');
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
        'NIM',
        'File Name',
        'Upload Date',
        'Grade',
        'Feedback',
        'Graded Date'
      ]);

      // Add data rows
      let rowNumber = 1;
      filteredGroupedAssignments.forEach(([key, studentAssignments]) => {
        const student = studentAssignments[0].profiles;
        
        studentAssignments.forEach((assignment) => {
          exportData.push([
            rowNumber++,
            student.full_name || '',
            student.email || '',
            assignment.nim || '',
            assignment.file_name || '',
            new Date(assignment.uploaded_at).toLocaleString() || '',
            assignment.grade !== null ? assignment.grade : 'Not Graded',
            assignment.feedback || '',
            assignment.graded_at ? new Date(assignment.graded_at).toLocaleString() : ''
          ]);
        });
      });

      // Convert to CSV format
      const csvContent = exportData.map(row => {
        return row.map((cell: any) => {
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
      link.download = `Assignments_${jobsheetName.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
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

  // Filter grouped assignments based on search query
  const filteredGroupedAssignments = Object.entries(groupedAssignments).filter(([key, studentAssignments]) => {
    if (!searchQuery.trim()) return true;
    
    const student = studentAssignments[0].profiles;
    const searchLower = searchQuery.toLowerCase().trim();
    
    return (
      student.full_name.toLowerCase().includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower) ||
      studentAssignments[0].nim.toLowerCase().includes(searchLower)
    );
  });

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Assignments for "{jobsheetName}"</h2>
                <p className="text-sm text-gray-600 mt-1">View and grade student assignments</p>
              </div>
              <div className="flex items-center space-x-3">
                {!loading && Object.keys(groupedAssignments).length > 0 && (
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
            {!loading && Object.keys(groupedAssignments).length > 0 && (
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
                    placeholder="Search by student name, email, or NIM..."
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
                {searchQuery && (
                  <p className="text-xs text-gray-500 mt-2">
                    Found {filteredGroupedAssignments.length} student{filteredGroupedAssignments.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading assignments...</p>
              </div>
            ) : Object.keys(groupedAssignments).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No assignments submitted yet for this jobsheet.</p>
              </div>
            ) : filteredGroupedAssignments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No students found matching "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-sm text-primary-600 hover:text-primary-700"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredGroupedAssignments.map(([key, studentAssignments]) => {
                  const student = studentAssignments[0].profiles;
                  const nim = studentAssignments[0].nim;
                  
                  return (
                    <div key={key} className="card p-6">
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{student.full_name}</h3>
                          <p className="text-sm text-gray-600">{student.email}</p>
                          <p className="text-xs text-gray-500 mt-1">NIM: {nim}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Total Files: {studentAssignments.length} / 4</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {studentAssignments.map((assignment) => (
                          <div key={assignment.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">{assignment.file_name}</p>
                                <p className="text-xs text-gray-500">
                                  Uploaded: {new Date(assignment.uploaded_at).toLocaleString()}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                {assignment.grade !== null && (
                                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                    assignment.grade >= 70 ? 'bg-success-100 text-success-700' :
                                    assignment.grade >= 50 ? 'bg-warning-100 text-warning-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    Grade: {assignment.grade}
                                  </span>
                                )}
                                <button
                                  onClick={() => setSelectedPdfUrl(assignment.file_url)}
                                  className="btn-secondary px-3 py-1.5 text-sm"
                                >
                                  View PDF
                                </button>
                                <button
                                  onClick={() => handleDownload(assignment.file_url, assignment.file_name)}
                                  className="btn-secondary px-3 py-1.5 text-sm"
                                >
                                  Download
                                </button>
                                <button
                                  onClick={() => handleGradeClick(assignment)}
                                  className="btn-primary px-3 py-1.5 text-sm"
                                >
                                  {assignment.grade !== null ? 'Edit Grade' : 'Grade'}
                                </button>
                              </div>
                            </div>

                            {gradingAssignmentId === assignment.id && (
                              <div className="mt-4 p-4 bg-white rounded-lg border border-gray-300">
                                <h4 className="font-semibold text-gray-900 mb-3">Grade Assignment</h4>
                                <div className="space-y-3">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Grade (0-100)</label>
                                    <input
                                      type="number"
                                      value={grade}
                                      onChange={(e) => setGrade(e.target.value)}
                                      min="0"
                                      max="100"
                                      className="input-field w-full"
                                      placeholder="e.g., 85"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
                                    <textarea
                                      value={feedback}
                                      onChange={(e) => setFeedback(e.target.value)}
                                      rows={3}
                                      className="input-field w-full"
                                      placeholder="Provide feedback to the student..."
                                    />
                                  </div>
                                  <div className="flex justify-end space-x-2">
                                    <button
                                      type="button"
                                      onClick={() => setGradingAssignmentId(null)}
                                      className="btn-secondary px-4 py-2 text-sm"
                                      disabled={isGrading}
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={handleSaveGrade}
                                      className="btn-primary px-4 py-2 text-sm"
                                      disabled={isGrading}
                                    >
                                      {isGrading ? 'Saving...' : 'Save Grade'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {assignment.feedback && gradingAssignmentId !== assignment.id && (
                              <div className="mt-3 p-3 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">
                                <p className="font-semibold mb-1">Feedback:</p>
                                <p>{assignment.feedback}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedPdfUrl && (
        <PDFViewer
          url={selectedPdfUrl}
          title="Student Assignment"
          onClose={() => setSelectedPdfUrl(null)}
        />
      )}
    </>
  );
}
