import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import SearchModal from '../common/SearchModal';
import ErrorBoundary from '../common/ErrorBoundary';
import useAppStore from '../../store/appStore';

export default function AppLayout() {
  const { sidebarCollapsed, initTheme, initAiCredentials } = useAppStore();

  useEffect(() => {
    initTheme();
    initAiCredentials();
  }, [initTheme, initAiCredentials]);

  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-[#0B1020] text-gray-900 dark:text-gray-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Top Header */}
      <Header />

      {/* Main Content Area */}
      <main
        className={`flex-1 transition-all duration-300 pt-16 min-h-[calc(100vh-4rem)] ${
          sidebarCollapsed ? 'pl-0 md:pl-20' : 'pl-0 md:pl-64'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>

      {/* Global Search Dialog */}
      <SearchModal />
    </div>
  );
}
