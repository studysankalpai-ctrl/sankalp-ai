import React from 'react';
import { Download, X, Share2, PlusSquare, Smartphone, Sparkles, CheckCircle2 } from 'lucide-react';
import { usePwaStore } from '../../store/pwaStore';

export default function PwaInstallPrompt() {
  const {
    isInstallable,
    isInstalled,
    isIos,
    iosModalOpen,
    setIosModalOpen,
    bannerDismissed,
    dismissBanner,
    promptInstall,
  } = usePwaStore();

  // If already running inside installed standalone app, show nothing
  if (isInstalled) return null;

  return (
    <>
      {/* Floating Bottom/Mobile Install Banner */}
      {!bannerDismissed && (isInstallable || isIos) && (
        <aside
          aria-label="Install SANKALP Mobile App Banner"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-40 animate-fade-in"
        >
          <div className="bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border border-indigo-200 dark:border-indigo-900/60 rounded-2xl p-3.5 sm:p-4 shadow-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 p-0.5 shrink-0 shadow-xs flex items-center justify-center">
                <img
                  src="/pwa-192x192.png"
                  alt="SANKALP AI"
                  className="w-full h-full object-contain rounded-[10px]"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                    Install SANKALP App
                  </h4>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-[9px] font-extrabold text-emerald-700 dark:text-emerald-300 shrink-0">
                    Mobile PWA
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                  1-Tap home screen access for daily revision & study
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={promptInstall}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
              <button
                onClick={dismissBanner}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* iOS Safari Installation Guide Modal */}
      {iosModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-sm sm:max-w-md p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    Install on iPhone / iPad
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Fast 3-step home screen installation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIosModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 py-2 text-xs text-gray-600 dark:text-gray-300">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60">
                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                    Tap the Share icon <Share2 className="w-3.5 h-3.5 text-indigo-500" />
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    At the bottom bar of your Safari browser window.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60">
                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                    Select &apos;Add to Home Screen&apos; <PlusSquare className="w-3.5 h-3.5 text-indigo-500" />
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Scroll down in the share sheet and tap &quot;Add to Home Screen&quot;.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60">
                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                    Tap &apos;Add&apos; in Top-Right <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    SANKALP AI will appear on your phone screen just like any App Store app!
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIosModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-xs hover:opacity-90 transition-opacity"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
}
