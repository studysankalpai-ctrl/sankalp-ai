import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Student Layout & Pages
import AppLayout from './components/layout/AppLayout';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Library from './pages/Library';
import PdfViewerPage from './pages/PdfViewerPage';
import Subjects from './pages/Subjects';
import Mentor from './pages/Mentor';
import Topics from './pages/Topics';
import Predictions from './pages/Predictions';
import Practice from './pages/Practice';
import Tests from './pages/Tests';
import Planner from './pages/Planner';
import Revision from './pages/Revision';
import Bookmarks from './pages/Bookmarks';
import Settings from './pages/Settings';
import Guide from './pages/Guide';

// Admin Layout & Pages
import AdminLayout from './components/layout/AdminLayout';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import Courses from './pages/admin/Courses';
import Semesters from './pages/admin/Semesters';
import SubjectsAdmin from './pages/admin/Subjects';
import Folders from './pages/admin/Folders';
import Syllabus from './pages/admin/Syllabus';
import Papers from './pages/admin/Papers';
import BooksAdmin from './pages/admin/Books';
import Processing from './pages/admin/Processing';
import Questions from './pages/admin/Questions';
import Analysis from './pages/admin/Analysis';
import Storage from './pages/admin/Storage';
import AdminSettings from './pages/admin/AdminSettings';

export default function App() {
  return (
    <BrowserRouter>
      {/* Toast Notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#111827',
            color: '#F9FAFB',
            borderRadius: '1rem',
            border: '1px solid #374151',
            fontSize: '12px',
          },
        }}
      />

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
          <Route path="/mentor" element={<Mentor />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/practice" element={<Practice />} />
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
    </BrowserRouter>
  );
}
