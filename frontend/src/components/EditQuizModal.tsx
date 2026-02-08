'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

interface Class {
  id: string;
  name: string;
  code: string;
}

interface Question {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D' | 'E';
  points: number;
}

interface EditQuizModalProps {
  isOpen: boolean;
  quizId: string | null;
  onClose: () => void;
  onSuccess: () => void;
  classes: Class[];
}

export default function EditQuizModal({
  isOpen,
  quizId,
  onClose,
  onSuccess,
  classes
}: EditQuizModalProps) {
  const [formData, setFormData] = useState({
    classId: '',
    title: '',
    description: '',
    timeLimit: ''
  });
  const [questions, setQuestions] = useState<Question[]>([
    {
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      optionE: '',
      correctAnswer: 'A',
      points: 1
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !quizId) return;
    setLoading(true);
    apiClient
      .getQuiz(quizId)
      .then((res) => {
        const quiz = res.data;
        const classId = quiz.class_id || '';
        setFormData({
          classId,
          title: quiz.title || '',
          description: quiz.description || '',
          timeLimit: quiz.time_limit != null ? String(quiz.time_limit) : ''
        });
        const qs = (quiz.questions || []).map((q: any) => ({
          questionText: q.question_text || '',
          optionA: q.option_a || '',
          optionB: q.option_b || '',
          optionC: q.option_c || '',
          optionD: q.option_d || '',
          optionE: q.option_e || '',
          correctAnswer: (q.correct_answer || 'A') as 'A' | 'B' | 'C' | 'D' | 'E',
          points: q.points ?? 1
        }));
        setQuestions(qs.length > 0 ? qs : [{
          questionText: '',
          optionA: '',
          optionB: '',
          optionC: '',
          optionD: '',
          optionE: '',
          correctAnswer: 'A',
          points: 1
        }]);
      })
      .catch((err) => {
        const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to load quiz';
        toast.error(msg);
        onClose();
      })
      .finally(() => setLoading(false));
  }, [isOpen, quizId, onClose]);

  if (!isOpen) return null;

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        optionE: '',
        correctAnswer: 'A',
        points: 1
      }
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizId) return;
    if (!formData.title) {
      toast.error('Please fill in quiz title');
      return;
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText || !q.optionA || !q.optionB || !q.optionC || !q.optionD || !q.optionE) {
        toast.error(`Please complete question ${i + 1} (all options A-E are required)`);
        return;
      }
    }

    setSaving(true);
    try {
      const questionsData = questions.map((q, index) => ({
        questionText: q.questionText,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        optionE: q.optionE,
        correctAnswer: q.correctAnswer,
        points: q.points,
        orderIndex: index
      }));

      await apiClient.updateQuiz(quizId, {
        title: formData.title,
        description: formData.description || undefined,
        timeLimit: formData.timeLimit ? parseInt(formData.timeLimit) : undefined,
        questions: questionsData
      });

      toast.success('Quiz updated successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      const msg = error.response?.data?.error || error.response?.data?.message || 'Failed to update quiz';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const selectedClass = classes.find((c) => c.id === formData.classId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Edit Quiz</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-500">Loading quiz...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class (Jobsheet)
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={selectedClass ? `${selectedClass.code} - ${selectedClass.name}` : (formData.classId ? 'Loading...' : '—')}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">Class cannot be changed when editing.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Optional"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quiz Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Quiz title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={2}
                  placeholder="Quiz description (optional)"
                />
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Questions</h3>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                  >
                    + Add Question
                  </button>
                </div>

                <div className="space-y-6">
                  {questions.map((question, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Question {index + 1}</h4>
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(index)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Question Text <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={question.questionText}
                            onChange={(e) => updateQuestion(index, 'questionText', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            rows={2}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {(['A', 'B', 'C', 'D', 'E'] as const).map((opt) => (
                            <div key={opt}>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Option {opt} <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={question[`option${opt}` as keyof Question] as string}
                                onChange={(e) => updateQuestion(index, `option${opt}` as keyof Question, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                required
                              />
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Correct Answer <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={question.correctAnswer}
                              onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value as 'A' | 'B' | 'C' | 'D' | 'E')}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                              required
                            >
                              <option value="A">A</option>
                              <option value="B">B</option>
                              <option value="C">C</option>
                              <option value="D">D</option>
                              <option value="E">E</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Points <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              value={question.points}
                              onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value) || 1)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                              min="1"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Update Quiz'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
