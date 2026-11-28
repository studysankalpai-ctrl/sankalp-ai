import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import PwaInstallPrompt from './components/common/PwaInstallPrompt';
import { usePwaStore } from './store/pwaStore';

// Eagerly loaded for instant 1-frame paint on mobile and desktop
import Landing from './pages/Landing';

// Lazy load Student App to keep initial landing page bundle ultra-lightweight
const AppLayout = lazy(() => import('./components/layout/AppLayout'));
const Home = lazy(() => import('./pages/Home'));
const Library = lazy(() => import('./pages/Library'));
const PdfViewerPage = lazy(() => import('./pages/PdfViewerPage'));
const Subjects = lazy(() => import('./pages/Subjects'));
const VivaRoom = lazy(() => import('./pages/VivaRoom'));
const Mentor = lazy(() => import('./pages/Mentor'));
const Topics = lazy(() => import('./pages/Topics'));
const Predictions = lazy(() => import('./pages/Predictions'));
const Practice = lazy(() => import('./pages/Practice'));
const Tests = lazy(() => import('./pages/Tests'));
const Planner = lazy(() => import('./pages/Planner'));
const Revision = lazy(() => import('./pages/Revision'));
const Bookmarks = lazy(() => import('./pages/Bookmarks'));
const Settings = lazy(() => import('./pages/Settings'));
const Guide = lazy(() => import('./pages/Guide'));
const CodingLab = lazy(() => import('./pages/CodingLab'));
const BusinessLab = lazy(() => import('./pages/BusinessLab'));

// Lazy load Admin Portal (zero overhead for regular students & mobile visitors)
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'));
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const Courses = lazy(() => import('./pages/admin/Courses'));
const Semesters = lazy(() => import('./pages/admin/Semesters'));
const SubjectsAdmin = lazy(() => import('./pages/admin/Subjects'));
const Folders = lazy(() => import('./pages/admin/Folders'));
const Syllabus = lazy(() => import('./pages/admin/Syllabus'));
const Papers = lazy(() => import('./pages/admin/Papers'));
const BooksAdmin = lazy(() => import('./pages/admin/Books'));
const Processing = lazy(() => import('./pages/admin/Processing'));
const Questions = lazy(() => import('./pages/admin/Questions'));
const Analysis = lazy(() => import('./pages/admin/Analysis'));
const Storage = lazy(() => import('./pages/admin/Storage'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

function PageLoader() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3 text-zinc-400">
        <Loader2 className="w-6 h-6 animate-spin text-white" />
        <span className="text-xs font-mono tracking-wider">LOADING SANKALP AI...</span>
      </div>
    </div>
  );
}

export default function App() {
  const { initPwa } = usePwaStore();

  useEffect(() => {
    initPwa();
  }, [initPwa]);

  return (
    <BrowserRouter>
      {/* Toast Notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0a0a0a',
            color: '#F9FAFB',
            borderRadius: '1rem',
            border: '1px solid #262626',
            fontSize: '12px',
          },
        }}
      />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Standalone Black & White Landing Page */}
          <Route path="/" element={<Landing />} />

          {/* Student Web App (No student registration/login) */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/library" element={<Library />} />
            <Route path="/pdf/:fileId" element={<PdfViewerPage />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/viva" element={<VivaRoom />} />
            <Route path="/mentor" element={<Mentor />} />
            <Route path="/topics" element={<Topics />} />
            <Route path="/predictions" element={<Predictions />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/coding-lab" element={<CodingLab />} />
            <Route path="/coding-lab/:slug" element={<CodingLab />} />
            <Route path="/business-lab" element={<BusinessLab />} />
            <Route path="/tests" element={<Tests />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/revision" element={<Revision />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/guide" element={<Guide />} />
            <Route path="/manual" element={<Navigate to="/guide" replace />} />
          </Route>

          {/* Admin Login Route */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Console */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="courses" element={<Courses />} />
            <Route path="semesters" element={<Semesters />} />
            <Route path="subjects" element={<SubjectsAdmin />} />
            <Route path="folders" element={<Folders />} />
            <Route path="syllabus" element={<Syllabus />} />
            <Route path="papers" element={<Papers />} />
            <Route path="books" element={<BooksAdmin />} />
            <Route path="processing" element={<Processing />} />
            <Route path="questions" element={<Questions />} />
            <Route path="analysis" element={<Analysis />} />
            <Route path="storage" element={<Storage />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      {/* Global PWA Mobile App Installation Prompt & Guide Dialog */}
      <PwaInstallPrompt />
    </BrowserRouter>
  );
}
