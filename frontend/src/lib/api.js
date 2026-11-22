import axios from 'axios';
import { API_BASE } from './constants';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Admin JWT token interceptor
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('sankalp_admin_token');
  if (token && config.url && (config.url.startsWith('/admin') || config.url.startsWith('/auth/me') || config.url.startsWith('/auth/change-password'))) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Public Student API (No login required)
export const publicApi = {
  getCourses: () => api.get('/public/courses'),
  getSemesters: (courseId) => api.get(`/public/courses/${courseId}/semesters`),
  getSubjects: (semesterId) => api.get(`/public/semesters/${semesterId}/subjects`),
  getSubjectDetail: (subjectId) => api.get(`/public/subjects/${subjectId}`),
  getPapers: (subjectId) => api.get(`/public/subjects/${subjectId}/papers`),
  getSyllabus: (semesterId) => api.get(`/public/semesters/${semesterId}/syllabus`),
  getFolderContents: (folderId) => api.get(`/public/folders/${folderId}`),
  getFile: (fileId) => api.get(`/public/files/${fileId}`),
  getLibraryTree: () => api.get('/public/library/tree'),
  getTopics: (subjectId) => api.get('/public/topics', { params: { subject_id: subjectId } }),
  getAnalysis: (subjectId) => api.get(`/public/analysis/${subjectId}`),
  getQuestions: (params) => api.get('/public/questions', { params }),
  getBooks: (params) => api.get('/public/books', { params }),
  getSubjectBooks: (subjectId) => api.get(`/public/subjects/${subjectId}/books`),
  getStats: () => api.get('/public/stats'),
  search: (q) => api.get('/public/search', { params: { q } }),
};

// Admin API
export const adminApi = {
  login: (creds) => api.post('/auth/login', creds),
  register: (creds) => api.post('/auth/register', creds),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
  getStats: () => api.get('/admin/stats'),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  getStorage: () => api.get('/admin/storage'),

  // Courses
  getCourses: () => api.get('/admin/courses'),
  getCourse: (id) => api.get(`/admin/courses/${id}`),
  createCourse: (data) => api.post('/admin/courses', data),
  updateCourse: (id, data) => api.put(`/admin/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/admin/courses/${id}`),
  togglePublishCourse: (id) => api.put(`/admin/courses/${id}/publish`),
  toggleArchiveCourse: (id) => api.put(`/admin/courses/${id}/archive`),

  // Semesters
  getSemesters: (courseId) => api.get('/admin/semesters', { params: { course_id: courseId } }),
  createSemester: (data) => api.post('/admin/semesters', data),
  updateSemester: (id, data) => api.put(`/admin/semesters/${id}`, data),
  deleteSemester: (id) => api.delete(`/admin/semesters/${id}`),

  // Subjects
  getSubjects: (semesterId) => api.get('/admin/subjects', { params: { semester_id: semesterId } }),
  getSubject: (id) => api.get(`/admin/subjects/${id}`),
  createSubject: (data) => api.post('/admin/subjects', data),
  updateSubject: (id, data) => api.put(`/admin/subjects/${id}`, data),
  deleteSubject: (id) => api.delete(`/admin/subjects/${id}`),

  // Folders
  getFolders: (params) => api.get('/admin/folders', { params }),
  getFolder: (id) => api.get(`/admin/folders/${id}`),
  createFolder: (data) => api.post('/admin/folders', data),
  updateFolder: (id, data) => api.put(`/admin/folders/${id}`, data),
  moveFolder: (id, data) => api.put(`/admin/folders/${id}/move`, data),
  deleteFolder: (id) => api.delete(`/admin/folders/${id}`),

  // Files
  uploadFile: (formData) => api.post('/admin/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteFile: (id) => api.delete(`/admin/files/${id}`),

  // Syllabus
  getSyllabusList: (semesterId) => api.get('/admin/syllabus', { params: { semester_id: semesterId } }),
  uploadSyllabus: (formData) => api.post('/admin/syllabus/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  activateSyllabus: (id) => api.put(`/admin/syllabus/${id}/activate`),
  archiveSyllabus: (id) => api.put(`/admin/syllabus/${id}/archive`),
  processSyllabus: (id) => api.post(`/admin/syllabus/${id}/process`),

  // Question Papers
  getPapers: (params) => api.get('/admin/papers', { params }),
  uploadPaper: (formData) => api.post('/admin/papers/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updatePaper: (id, data) => api.put(`/admin/papers/${id}`, data),
  deletePaper: (id) => api.delete(`/admin/papers/${id}`),
  processPaper: (id) => api.post(`/admin/papers/${id}/process`),

  // Textbooks & Reference Books
  getAdminBooks: (params) => api.get('/admin/books', { params }),
  uploadBook: (formData) => api.post('/admin/books/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  inspectBook: (formData) => api.post('/admin/books/inspect', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateBook: (id, data) => api.put(`/admin/books/${id}`, data),
  deleteBook: (id) => api.delete(`/admin/books/${id}`),
  processBook: (id) => api.post(`/admin/books/${id}/process`),

  // Processing Overview
  getProcessingStatus: () => api.get('/admin/processing/status'),
  getPendingDocs: () => api.get('/admin/processing/pending'),
  getFailedDocs: () => api.get('/admin/processing/failed'),

  // Extracted Questions
  getQuestions: (params) => api.get('/admin/questions', { params }),
  updateQuestion: (id, data) => api.put(`/admin/questions/${id}`, data),
  verifyQuestion: (id) => api.put(`/admin/questions/${id}/verify`),
  deleteQuestion: (id) => api.delete(`/admin/questions/${id}`),

  // Topics
  getTopics: (params) => api.get('/admin/topics', { params }),
  generateTopics: (data) => api.post('/admin/topics/generate', data),
  updateTopic: (id, data) => api.put(`/admin/topics/${id}`, data),
  publishTopic: (id) => api.put(`/admin/topics/${id}/publish`),
  deleteTopic: (id) => api.delete(`/admin/topics/${id}`),

  // Analysis
  getAnalyses: (params) => api.get('/admin/analysis', { params }),
  generateAnalysis: (data) => api.post('/admin/analysis/generate', data),
  publishAnalysis: (id) => api.put(`/admin/analysis/${id}/publish`),
  deleteAnalysis: (id) => api.delete(`/admin/analysis/${id}`),
};

// AI BYOK Endpoints (Sends API key in request payload, never persisted on server)
export const aiApi = {
  testConnection: (apiKey, model) => api.post('/ai/test-connection', { apiKey, model }),
  getModels: (apiKey) => api.post('/ai/models', { apiKey }),
  chat: (payload) => api.post('/ai/chat', payload),
  generateQuestions: (payload) => api.post('/ai/generate-questions', payload),
  generateAnswer: (payload) => api.post('/ai/generate-answer', payload),
  evaluate: (payload) => api.post('/ai/evaluate', payload),
  generateStudyPlan: (payload) => api.post('/ai/study-plan', payload),
  generatePredictions: (payload) => api.post('/ai/predictions', payload),
  generateRevisionNotes: (payload) => api.post('/ai/revision-notes', payload),
  generateFlashcards: (payload) => api.post('/ai/flashcards', payload),
  generateFinalPaper: (payload) => api.post('/ai/generate-final-paper', payload),
  generateTopics: (payload) => api.post('/ai/generate-topics', payload),
};

export default api;
