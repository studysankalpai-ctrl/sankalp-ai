import React from 'react';
import {
  Download,
  X,
  Share2,
  PlusSquare,
  Smartphone,
  Laptop,
  CheckCircle2,
  MoreVertical,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { usePwaStore } from '../../store/pwaStore';

export default function PwaInstallPrompt() {
  const {
    isInstallable,
    isInstalled,
    isIos,
    isAndroid,
    isDesktop,
    installGuideOpen,
    setInstallGuideOpen,
    activeGuideTab,
    setActiveGuideTab,
    bannerDismissed,
    dismissBanner,
    promptInstall,
    deferredPrompt,
  } = usePwaStore();

  // If already running inside installed standalone app, show nothing
  if (isInstalled) return null;

  return (
    <>
      {/* 1. Floating Bottom/Mobile Install Banner */}
      {!bannerDismissed && (
        <aside
          aria-label="Install SANKALP Mobile App Banner"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-40 animate-in fade-in slide-in-from-bottom-3 duration-300"
        >
          <div className="bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md border border-gray-200 dark:border-neutral-800 rounded-2xl p-3.5 sm:p-4 shadow-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700/80 p-1 shrink-0 shadow-xs flex items-center justify-center">
                <img
                  src="/pwa-192x192.png"
                  alt="SANKALP AI"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                    Install SANKALP App
                  </h4>
                  <span className="px-1.5 py-0.2 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-[9px] font-extrabold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shrink-0">
                    PWA
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                  1-Tap home screen access for exams & revision
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={promptInstall}
                className="px-3 py-1.5 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:opacity-90 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
              <button
                type="button"
                onClick={dismissBanner}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 2. Universal Installation Guide Modal (Android, iOS & Desktop) */}
      {installGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0d0d0d] border border-gray-200 dark:border-neutral-800 rounded-3xl w-full max-w-sm sm:max-w-md p-5 sm:p-6 shadow-2xl space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white shrink-0">
                  <img
                    src="/pwa-192x192.png"
                    alt="SANKALP AI"
                    className="w-7 h-7 object-contain rounded-lg"
                  />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                    Install SANKALP App
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Full-screen native experience on your device
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInstallGuideOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Platform Selector Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 dark:bg-neutral-900/90 rounded-2xl border border-gray-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setActiveGuideTab('android')}
                className={`py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  activeGuideTab === 'android'
                    ? 'bg-white dark:bg-neutral-800 text-gray-950 dark:text-white shadow-2xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveGuideTab('ios')}
                className={`py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  activeGuideTab === 'ios'
                    ? 'bg-white dark:bg-neutral-800 text-gray-950 dark:text-white shadow-2xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>iPhone / iPad</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveGuideTab('desktop')}
                className={`py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  activeGuideTab === 'desktop'
                    ? 'bg-white dark:bg-neutral-800 text-gray-950 dark:text-white shadow-2xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>PC / Laptop</span>
              </button>
            </div>

            {/* If 1-Click Native Install is ready, show quick trigger banner */}
            {deferredPrompt && (
              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                    Ready for 1-Click Install
                  </span>
                </div>
                <button
                  type="button"
                  onClick={promptInstall}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Install Now</span>
                </button>
              </div>
            )}

            {/* Step-by-Step Instructions by Platform */}
            <div className="space-y-2.5 py-1 text-xs text-gray-700 dark:text-gray-300">
              {activeGuideTab === 'android' && (
                <>
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800/80">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-xs">
                      1
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                        Tap Three Dots Menu <MoreVertical className="w-3.5 h-3.5 text-indigo-500" />
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        In the top-right corner of Chrome, Edge, or Brave browser.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800/80">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-xs">
                      2
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                        Select &apos;Install app&apos; or &apos;Add to Home screen&apos; <Download className="w-3.5 h-3.5 text-indigo-500" />
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        Scroll down in the browser menu and tap &quot;Install app&quot;.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800/80">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-xs">
                      3
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                        Tap &apos;Install&apos; <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        SANKALP AI will be added to your home screen with its official icon!
                      </p>
                    </div>
                  </div>
                </>
              )}

              {activeGuideTab === 'ios' && (
                <>
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800/80">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-xs">
                      1
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                        Tap the Share icon <Share2 className="w-3.5 h-3.5 text-indigo-500" />
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        At the bottom navigation bar of your Safari browser window.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800/80">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-xs">
                      2
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                        Tap &apos;Add to Home Screen&apos; <PlusSquare className="w-3.5 h-3.5 text-indigo-500" />
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        Scroll down the share sheet and select &quot;Add to Home Screen&quot;.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800/80">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-xs">
                      3
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                        Tap &apos;Add&apos; in Top-Right <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        SANKALP AI will open like a native iOS app with full screen view!
                      </p>
                    </div>
                  </div>
                </>
              )}

              {activeGuideTab === 'desktop' && (
                <>
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800/80">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-xs">
                      1
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                        Look at the Address Bar <Download className="w-3.5 h-3.5 text-indigo-500" />
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        Click the small &quot;Install SANKALP AI&quot; icon (⊞ or ⬇) in the right side of the address bar.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800/80">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-xs">
                      2
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                        Or via Browser Menu <MoreVertical className="w-3.5 h-3.5 text-indigo-500" />
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        Click the three dots menu (⋮) &gt; &quot;Save and share&quot; &gt; &quot;Install SANKALP AI&quot;.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800/80">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-xs">
                      3
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                        Launch Desktop Window <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        SANKALP AI runs in its own distraction-free desktop window with desktop shortcuts!
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Bottom Dismiss Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setInstallGuideOpen(false)}
                className="w-full py-2.5 rounded-xl bg-gray-950 dark:bg-white text-white dark:text-black font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
