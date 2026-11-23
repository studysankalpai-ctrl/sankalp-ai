import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import SearchModal from '../common/SearchModal';
import ErrorBoundary from '../common/ErrorBoundary';
import PwaInstallPrompt from '../common/PwaInstallPrompt';
import useAppStore from '../../store/appStore';
import { usePwaStore } from '../../store/pwaStore';

export default function AppLayout() {
  const { sidebarCollapsed, initTheme, initAiCredentials } = useAppStore();
  const { initPwa } = usePwaStore();
  const location = useLocation();
  const isPdfPage = location.pathname.startsWith('/pdf/');

  useEffect(() => {
    initTheme();
    initAiCredentials();
    initPwa();
  }, [initTheme, initAiCredentials, initPwa]);

  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-[#0B1020] text-gray-900 dark:text-gray-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Top Header */}
      <Header />

      {/* Main Content Area */}
      <main
        className={`flex-1 transition-all duration-300 ${
          isPdfPage
            ? 'p-0 m-0'
            : 'min-h-[calc(100vh-4rem)] pt-16 flex flex-col justify-between'
        } ${sidebarCollapsed ? 'pl-0 md:pl-20' : 'pl-0 md:pl-64'}`}
      >
        <div
          className={
            isPdfPage
              ? 'p-0 m-0 w-full'
              : 'max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 flex-1 w-full'
          }
        >
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>

        {/* Global Student App Footer (hidden on full-screen PDF study reader) */}
        {!isPdfPage && (
          <footer className="mt-auto border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-950/40 backdrop-blur-sm py-4 px-4 sm:px-8 text-xs text-gray-500 dark:text-gray-400">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
                  SANKALP AI
                </span>
                <span>&bull;</span>
                <span>St. John&apos;s College, Agra</span>
                <span className="hidden sm:inline">&bull;</span>
                <span className="text-[11px] text-gray-400 hidden sm:inline">
                  Autonomous University Exam Intelligence
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] sm:text-xs">
                <a
                  href="mailto:study.sankalp.ai@gmail.com"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-mono"
                >
                  study.sankalp.ai@gmail.com
                </a>
                <span>&copy; {new Date().getFullYear()} SANKALP AI</span>
              </div>
            </div>
          </footer>
        )}
      </main>

      {/* Global Search Dialog */}
      <SearchModal />

      {/* PWA Mobile App Installation Prompt */}
      <PwaInstallPrompt />
    </div>
  );
}
