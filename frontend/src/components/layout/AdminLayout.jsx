import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import ErrorBoundary from '../common/ErrorBoundary';
import useAdminStore from '../../store/adminStore';

export default function AdminLayout() {
  const { isAuthenticated } = useAdminStore();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 flex font-sans selection:bg-indigo-600 selection:text-white">
      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-slate-950">
        <AdminHeader />

        <main className="flex-1 h-[calc(100vh-4rem-env(safe-area-inset-top,0px))] overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto pb-16">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
