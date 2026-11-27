import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Upload,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Eye,
  Loader2,
  FileText,
  Bookmark,
  Layers,
  GraduationCap,
  Sparkles,
  Download,
} from 'lucide-react';
import { adminApi } from '../../lib/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatFileSize, formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function Books() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [semesters, setSemesters] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload Form State
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [edition, setEdition] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [inspecting, setInspecting] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // 1. Load Courses
  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await adminApi.getCourses();
        if (res.data?.success && res.data.data.length > 0) {
          setCourses(res.data.data);
          setSelectedCourseId(res.data.data[0]._id);
        }
      } catch (err) {
        toast.error('Failed to load courses');
      }
    }
    loadCourses();
  }, []);

  // 2. Load Semesters for selected course
  useEffect(() => {
    async function loadSemesters() {
      if (!selectedCourseId) return;
      try {
        const res = await adminApi.getSemesters(selectedCourseId);
        if (res.data?.success && res.data.data.length > 0) {
          setSemesters(res.data.data);
          setSelectedSemesterId(res.data.data[0]._id);
        } else {
          setSemesters([]);
          setSelectedSemesterId('');
          setSubjects([]);
          setSelectedSubjectId('');
        }
      } catch (err) {
        toast.error('Failed to load semesters');
      }
    }
    loadSemesters();
  }, [selectedCourseId]);

  // 3. Load Subjects for selected semester
  useEffect(() => {
    async function loadSubjects() {
      if (!selectedSemesterId) return;
      try {
        const res = await adminApi.getSubjects(selectedSemesterId);
        if (res.data?.success && res.data.data.length > 0) {
          setSubjects(res.data.data);
          setSelectedSubjectId(res.data.data[0]._id);
        } else {
          setSubjects([]);
          setSelectedSubjectId('');
        }
      } catch (err) {
        toast.error('Failed to load subjects');
      }
    }
    loadSubjects();
  }, [selectedSemesterId]);

  // 4. Load Books whenever subject changes
  const loadBooks = async () => {
    if (!selectedSubjectId) {
      setBooks([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await adminApi.getAdminBooks({ subject_id: selectedSubjectId });
      if (res.data?.success) {
        setBooks(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load textbooks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, [selectedSubjectId]);

  // Auto-detect metadata when PDF file is selected (instant client-side parsing)
  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);

    // 1. Instant client-side metadata parsing from filename (0ms latency, no blocking network upload)
    const rawName = selectedFile.name.replace(/\.[^/.]+$/, '').trim();
    let cleanTitle = rawName.replace(/[_-]+/g, ' ').trim();
    let detectedAuthor = 'Prescribed University Author';
    let detectedEdition = 'Standard University Edition';

    // Check for "by Author" pattern (e.g. "Computer Fundamentals by PK Sinha")
    const byMatch = cleanTitle.match(/^(.+?)\s+(?:by|-)\s+([A-Za-z\s\.\&]+)$/i);
    if (byMatch && byMatch[1] && byMatch[2]) {
      cleanTitle = byMatch[1].trim();
      detectedAuthor = byMatch[2].trim();
    }

    // Check for edition pattern (e.g. "6th Edition")
    const edMatch = cleanTitle.match(/(\b(?:\d+(?:st|nd|rd|th)?|first|second|third|fourth|fifth|sixth)\s+ed(?:ition)?\b)/i);
    if (edMatch) {
      detectedEdition = edMatch[1].trim();
    }

    setTitle(cleanTitle);
    setAuthor(detectedAuthor);
    setEdition(detectedEdition);
    setDescription(`Prescribed academic textbook for syllabus topics (${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB).`);
    toast.success(`Loaded "${cleanTitle}" — ready to upload!`);
  };

  // Optional manual deep scan for complex PDFs
  const handleDeepInspect = async () => {
    if (!file) {
      toast.error('Select a PDF file first');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      setInspecting(true);
      const res = await adminApi.inspectBook(formData);
      if (res.data?.success && res.data.data) {
        const d = res.data.data;
        if (d.title) setTitle(d.title);
        if (d.author && d.author !== 'Prescribed University Author') setAuthor(d.author);
        if (d.edition) setEdition(d.edition);
        if (d.description) setDescription(d.description);
        toast.success(`Deep scan complete: ${d.totalPages} pages detected`);
      }
    } catch (err) {
      toast.error('Deep inspection could not read metadata, keep current title');
    } finally {
      setInspecting(false);
    }
  };

  // Handle Book Upload
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a PDF textbook to upload');
      return;
    }
    if (!selectedSubjectId) {
      toast.error('Please select a subject first');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title.trim() || file.name.replace(/\.[^/.]+$/, ''));
    formData.append('author', author.trim() || 'Prescribed University Author');
    formData.append('edition', edition.trim() || 'Standard Edition');
    formData.append('description', description.trim());
    formData.append('course_id', selectedCourseId);
    formData.append('semester_id', selectedSemesterId);
    formData.append('subject_id', selectedSubjectId);

    try {
      setUploading(true);
      const res = await adminApi.uploadBook(formData);
      if (res.data?.success) {
        toast.success('Textbook uploaded and indexed successfully!');
        setFile(null);
        setTitle('');
        setAuthor('');
        setEdition('');
        setDescription('');
        // Reset file input element
        const fileInput = document.getElementById('book-file-input');
        if (fileInput) fileInput.value = '';
        loadBooks();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Re-process / Re-index Text
  const handleProcess = async (bookId) => {
    try {
      setProcessingId(bookId);
      const res = await adminApi.processBook(bookId);
      if (res.data?.success) {
        toast.success(`Text re-extracted: ${res.data.data.totalPages} pages indexed`);
        loadBooks();
      }
    } catch (err) {
      toast.error('Failed to re-index textbook');
    } finally {
      setProcessingId(null);
    }
  };

  // Delete Book
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await adminApi.deleteBook(deleteTarget._id);
      if (res.data?.success) {
        toast.success('Textbook deleted');
        setDeleteTarget(null);
        loadBooks();
      }
    } catch (err) {
      toast.error('Failed to delete textbook');
    }
  };

  const activeSubject = subjects.find((s) => s._id === selectedSubjectId);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-indigo-400" /> Textbooks & Reference Books
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Upload and organize official university textbooks per Semester & Subject for SANKALP AI "Learn by Book" mode.
          </p>
        </div>
      </div>

      {/* Selectors: Course -> Semester -> Subject */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-400" /> 1. Select Course
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" /> 2. Select Semester
          </label>
          <select
            value={selectedSemesterId}
            onChange={(e) => setSelectedSemesterId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {semesters.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} (Sem {s.number})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5 text-indigo-400" /> 3. Select Subject
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {subjects.length === 0 && <option value="">No subjects in this semester</option>}
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Upload Form */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Upload className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-bold text-white">
            Upload Textbook for {activeSubject ? `${activeSubject.code} - ${activeSubject.name}` : 'Selected Subject'}
          </h2>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          {/* File Picker with Auto-Detection Banner */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-200">
                1. Select Textbook PDF File (Up to 100MB) *
              </label>
              <span className="text-[11px] text-indigo-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Auto-extracts Title, Author & Description
              </span>
            </div>

            <input
              id="book-file-input"
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => handleFileSelect(e.target.files[0] || null)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
            />

            {file && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-emerald-400 font-medium">
                  ✓ File ready ({(file.size / (1024 * 1024)).toFixed(1)} MB) — metadata instantly filled below
                </span>
                <button
                  type="button"
                  onClick={handleDeepInspect}
                  disabled={inspecting}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {inspecting ? <Loader2 className="w-3 h-3 animate-spin text-indigo-400" /> : <Sparkles className="w-3 h-3 text-indigo-400" />}
                  {inspecting ? 'Deep Scanning...' : 'Deep Scan PDF'}
                </button>
              </div>
            )}

            {inspecting && (
              <div className="flex items-center gap-2 text-xs text-indigo-300 font-semibold animate-pulse pt-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                <span>Scanning PDF pages... auto-extracting book title, author, edition & table of contents...</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Book Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Auto-detected from PDF..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Author / Publisher
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Auto-detected from PDF..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Edition / Session
              </label>
              <input
                type="text"
                value={edition}
                onChange={(e) => setEdition(e.target.value)}
                placeholder="Auto-detected from PDF..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description / Prescribed Units Covered
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Auto-detected table of contents and covered units..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={uploading || inspecting || !file || !selectedSubjectId}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? 'Uploading & Indexing Textbook...' : 'Upload & Index Textbook'}
            </button>
          </div>
        </form>
      </div>

      {/* Book Catalog List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-300 flex items-center justify-between">
          <span>Uploaded Textbooks ({books.length})</span>
          {activeSubject && <span className="text-xs text-slate-500">{activeSubject.name}</span>}
        </h3>

        {loading ? (
          <LoadingSpinner text="Loading textbooks..." />
        ) : books.length === 0 ? (
          <div className="p-10 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-300">No Textbooks Uploaded for this Subject</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Upload the primary textbook or reference book above to unlock "Learn by Book" precise explanations in SANKALP AI.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {books.map((book) => (
              <div
                key={book._id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 flex items-center justify-center shrink-0">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate" title={book.title}>
                      {book.title}
                    </h4>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      By {book.author} • {book.edition}
                    </p>
                    {book.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">
                        {book.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                      <span className="inline-flex items-center gap-1">
                        <FileText className="w-3 h-3 text-indigo-400" />
                        {book.total_pages || 0} Pages
                      </span>
                      <span>•</span>
                      <span>{formatFileSize(book.file_size)}</span>
                      <span>•</span>
                      <span>{formatDate(book.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Ready for AI
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleProcess(book._id)}
                      disabled={processingId === book._id}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                      title="Re-extract & Index Text"
                    >
                      {processingId === book._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RotateCcw className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <a
                      href={`/pdf/${book._id}?type=book`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Read
                    </a>

                    <button
                      onClick={() => setDeleteTarget(book)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 text-xs transition-colors"
                      title="Delete Textbook"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Textbook"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
