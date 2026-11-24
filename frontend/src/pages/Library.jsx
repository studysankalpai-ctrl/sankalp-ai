import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Folder,
  FolderOpen,
  FolderTree,
  FileText,
  Download,
  Eye,
  ChevronRight,
  Search,
  Grid,
  List,
  ArrowUpDown,
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  ArrowLeft,
  FileQuestion,
  ExternalLink,
} from 'lucide-react';
import { publicApi } from '../lib/api';
import useAppStore from '../store/appStore';
import { formatFileSize, formatDate } from '../lib/utils';
import { API_BASE } from '../lib/constants';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import PageHeader from '../components/common/PageHeader';

export default function Library() {
  const { selectedCourse, selectedSemester } = useAppStore();
  const [activeTab, setActiveTab] = useState('folders'); // 'folders' | 'books'
  const [tree, setTree] = useState(null);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [childFolders, setChildFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [booksList, setBooksList] = useState([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'date'
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load books for current course & semester
  useEffect(() => {
    async function loadBooks() {
      try {
        setBooksLoading(true);
        const params = {};
        if (selectedCourse?._id) params.course_id = selectedCourse._id;
        if (selectedSemester?._id) params.semester_id = selectedSemester._id;
        const res = await publicApi.getBooks(params);
        if (res.data?.success) {
          setBooksList(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load textbooks in library:', err);
      } finally {
        setBooksLoading(false);
      }
    }
    loadBooks();
  }, [selectedCourse?._id, selectedSemester?._id]);

  // Load root library tree or folders
  useEffect(() => {
    async function loadLibrary() {
      try {
        setLoading(true);
        const res = await publicApi.getLibraryTree();
        if (res.data?.success) {
          setTree(res.data.data);

          // Find root folder for current course if selected, otherwise first root
          let targetFolder = null;
          if (selectedCourse && res.data.data.rootFolders) {
            targetFolder = res.data.data.rootFolders.find(
              (f) => String(f.course_id) === String(selectedCourse._id)
            );
          }
          if (!targetFolder && res.data.data.rootFolders?.length > 0) {
            targetFolder = res.data.data.rootFolders[0];
          }

          if (targetFolder) {
            openFolder(targetFolder._id);
          } else {
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('Failed to load library:', err);
        setLoading(false);
      }
    }
    loadLibrary();
  }, [selectedCourse]);

  const openFolder = async (folderId) => {
    try {
      setLoading(true);
      const res = await publicApi.getFolderContents(folderId);
      if (res.data?.success) {
        setCurrentFolder(res.data.data.folder);
        setChildFolders(res.data.data.childFolders || []);
        setFiles(res.data.data.files || []);
        setBreadcrumbs(res.data.data.breadcrumbs || []);
      }
    } catch (err) {
      console.error('Error fetching folder:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered and sorted files
  const filteredFiles = files
    .filter((f) =>
      f.original_filename?.toLowerCase().includes(searchFilter.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.original_filename.localeCompare(b.original_filename);
      return new Date(b.upload_date) - new Date(a.upload_date);
    });

  const filteredFolders = childFolders.filter((f) =>
    f.name?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredBooks = booksList.filter((b) => {
    const q = searchFilter.toLowerCase();
    return (
      b.title?.toLowerCase().includes(q) ||
      b.author?.toLowerCase().includes(q) ||
      b.subject_id?.name?.toLowerCase().includes(q) ||
      b.subject_id?.code?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Library & Textbooks"
        description="Read prescribed textbooks with SANKALP AI, download syllabus, and explore past question papers."
        badge={selectedCourse ? `${selectedCourse.code} • Library` : 'Library'}
        actions={
          activeTab === 'folders' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                title={viewMode === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}
              >
                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
              </button>
            </div>
          )
        }
      />

      {/* Section Tabs: Papers & Folders vs Prescribed Textbooks (Scrollable on mobile) */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('folders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'folders'
              ? 'bg-gray-950 dark:bg-white text-white dark:text-gray-950 shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Papers, Syllabus & Folders</span>
        </button>

        <button
          onClick={() => setActiveTab('books')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'books'
              ? 'bg-black dark:bg-white text-white dark:text-black shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Prescribed Textbooks & Books</span>
          {booksList.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === 'books' ? 'bg-white/20 dark:bg-black/20' : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'}`}>
              {booksList.length}
            </span>
          )}
        </button>
      </div>

      {/* Books Tab View */}
      {activeTab === 'books' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3 p-4 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 shadow-2xs">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  Prescribed Textbooks for {selectedSemester ? selectedSemester.name : 'Your Course'}
                </h3>
                <p className="text-xs text-gray-400">
                  Read textbooks online or activate SANKALP AI "Learn by Book" for sharp, to-the-point answers.
                </p>
              </div>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, author, or subject..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {booksLoading ? (
            <LoadingSpinner text="Loading prescribed textbooks..." />
          ) : filteredBooks.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No Textbooks Uploaded for this Semester Yet"
              description="Your professors or administrators have not uploaded textbooks for this semester yet. You can upload them in the Admin Console under 'Textbooks & Books'."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBooks.map((book) => (
                <div
                  key={book._id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <BookOpen className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {book.subject_id && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                            {book.subject_id.code || 'Subject'}
                          </span>
                        )}
                        <span className="text-[10px] font-medium text-gray-400">
                          {book.edition || 'Standard Edition'}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate" title={book.title}>
                        {book.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        By {book.author || 'Prescribed Author'}
                      </p>

                      {book.description && (
                        <p className="text-[11px] text-gray-400 line-clamp-2 mt-1.5 leading-relaxed">
                          {book.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2.5 text-[11px] text-gray-400 mt-2.5 font-medium">
                        <span>{book.total_pages || 0} Pages</span>
                        <span>•</span>
                        <span>{formatFileSize(book.file_size)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2 flex-wrap">
                    <Link
                      to={`/mentor?subjectId=${book.subject_id?._id}&bookId=${book._id}&learnByBook=true`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                      title="Ask questions answered directly from this textbook"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Learn by Book</span>
                    </Link>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/pdf/${book._id}?type=book`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Read
                      </Link>
                      <a
                        href={`${API_BASE}/public/files/${book._id}/download`}
                        className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Folders & Papers Tab View */}
      {activeTab === 'folders' && (
        <div className="space-y-6">
      {/* Breadcrumb Navigation Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 p-3.5 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 shadow-2xs">
        <nav className="flex items-center gap-1.5 text-xs sm:text-sm font-medium overflow-x-auto no-scrollbar py-1 max-w-full">
          <button
            onClick={() => {
              if (tree?.rootFolders?.[0]) openFolder(tree.rootFolders[0]._id);
            }}
            className="flex items-center gap-1 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 shrink-0"
          >
            <FolderTree className="w-4 h-4" />
            <span>Root</span>
          </button>

          {breadcrumbs.map((b, idx) => (
            <React.Fragment key={b.id}>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <button
                onClick={() => openFolder(b.id)}
                className={`truncate max-w-[150px] sm:max-w-xs transition-colors shrink-0 ${
                  idx === breadcrumbs.length - 1
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                {b.name}
              </button>
            </React.Fragment>
          ))}
        </nav>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Filter current folder..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={() => setSortBy(sortBy === 'name' ? 'date' : 'name')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 shrink-0"
            title="Sort files"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{sortBy === 'name' ? 'Name' : 'Date'}</span>
          </button>
        </div>
      </div>

      {/* Explorer Content */}
      {loading ? (
        <LoadingSpinner text="Reading folder contents..." />
      ) : (
        <div className="space-y-6">
          {/* Subfolders Section */}
          {filteredFolders.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3 px-1 flex items-center gap-1.5">
                <Folder className="w-4 h-4" /> Subfolders ({filteredFolders.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredFolders.map((folder) => (
                  <div
                    key={folder._id}
                    onClick={() => openFolder(folder._id)}
                    className="group flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md cursor-pointer transition-all duration-150"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Folder className="w-5 h-5 fill-amber-500/20" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {folder.name}
                      </p>
                      <p className="text-[11px] text-gray-400 capitalize">
                        {folder.folder_type === 'papers' ? 'Question Papers' : folder.folder_type}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files Section */}
          {filteredFiles.length > 0 ? (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3 px-1 flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> Academic Files & Documents ({filteredFiles.length})
              </h3>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFiles.map((file) => (
                    <div
                      key={file._id}
                      className="p-4 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-800 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                            PDF
                          </span>
                        </div>

                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-2 mb-1.5">
                          {file.original_filename}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatFileSize(file.file_size)} • {formatDate(file.upload_date)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/80">
                        <Link
                          to={`/pdf/${file._id}`}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Read & Solve
                        </Link>
                        <a
                          href={`${API_BASE}/public/files/${file._id}/download`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-900/50">
                        <th className="py-3 px-4">Filename</th>
                        <th className="py-3 px-4">Size</th>
                        <th className="py-3 px-4">Uploaded</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {filteredFiles.map((file) => (
                        <tr key={file._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
                            <FileText className="w-4 h-4 text-red-500 shrink-0" />
                            <span className="truncate max-w-sm">{file.original_filename}</span>
                          </td>
                          <td className="py-3 px-4 text-xs text-gray-500">{formatFileSize(file.file_size)}</td>
                          <td className="py-3 px-4 text-xs text-gray-500">{formatDate(file.upload_date)}</td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <Link
                              to={`/pdf/${file._id}`}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                              <Eye className="w-3.5 h-3.5" /> Read
                            </Link>
                            <a
                              href={`${API_BASE}/public/files/${file._id}/download`}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            filteredFolders.length === 0 && (
              <EmptyState
                icon={FolderOpen}
                title={!currentFolder ? "Academic Library is empty" : "This folder is empty"}
                description={
                  !currentFolder
                    ? "No courses or folders have been uploaded yet. Log into the Admin Console to create courses and upload syllabus and question papers."
                    : "No academic files or subfolders have been published in this section yet."
                }
              />
            )
          )}
        </div>
      )}
        </div>
      )}
    </div>
  );
}
