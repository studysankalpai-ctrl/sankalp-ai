import { create } from 'zustand';

export const usePwaStore = create((set, get) => ({
  deferredPrompt: null,
  isInstallable: false,
  isInstalled: false,
  isIos: false,
  isAndroid: false,
  isDesktop: false,
  installGuideOpen: false,
  activeGuideTab: 'auto',
  bannerDismissed: false,

  setDeferredPrompt: (prompt) =>
    set({
      deferredPrompt: prompt,
      isInstallable: !!prompt,
    }),

  setIsInstalled: (installed) => set({ isInstalled: installed }),
  setIsIos: (isIos) => set({ isIos }),
  setIsAndroid: (isAndroid) => set({ isAndroid }),
  setIsDesktop: (isDesktop) => set({ isDesktop }),
  setInstallGuideOpen: (open, tab) =>
    set((state) => ({
      installGuideOpen: open,
      activeGuideTab: tab || state.activeGuideTab,
    })),
  setActiveGuideTab: (tab) => set({ activeGuideTab: tab }),

  dismissBanner: () => {
    try {
      localStorage.setItem('sankalp_pwa_banner_dismissed_at', Date.now().toString());
    } catch (_) {}
    set({ bannerDismissed: true });
  },

  promptInstall: async () => {
    const { deferredPrompt, isIos } = get();

    // 1. If native deferred prompt is available (Chrome / Edge / Chromium)
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          set({ deferredPrompt: null, isInstallable: false, isInstalled: true, installGuideOpen: false });
          return { outcome: 'accepted' };
        }
        return { outcome: 'dismissed' };
      } catch (err) {
        console.warn('[PWA] Native prompt error, showing guide:', err);
      }
    }

    // 2. If native prompt is not yet dispatched or not supported (iOS Safari, Firefox, or browser menu),
    // open the beautiful universal step-by-step install guide modal
    set({ installGuideOpen: true });
    return { outcome: isIos ? 'ios_instructions' : 'guide_opened' };
  },

  initPwa: () => {
    if (typeof window === 'undefined') return;

    // 1. Check if already running in standalone app mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      set({ isInstalled: true });
    }

    // 2. Detect Platform
    const ua = (window.navigator.userAgent || '').toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua) && !window.MSStream;
    const isAndroidDevice = /android/.test(ua);
    const isDesktopDevice = !isIosDevice && !isAndroidDevice;

    const detectedTab = isIosDevice ? 'ios' : isAndroidDevice ? 'android' : 'desktop';

    set({
      isIos: isIosDevice,
      isAndroid: isAndroidDevice,
      isDesktop: isDesktopDevice,
      activeGuideTab: detectedTab,
    });

    // 3. Check banner dismissal timestamp (auto-restore banner after 3 days)
    try {
      const dismissedAt = localStorage.getItem('sankalp_pwa_banner_dismissed_at');
      if (dismissedAt) {
        const diffMs = Date.now() - parseInt(dismissedAt, 10);
        // 3 days = 3 * 24 * 60 * 60 * 1000 = 259,200,000 ms
        if (diffMs < 259200000) {
          set({ bannerDismissed: true });
        } else {
          localStorage.removeItem('sankalp_pwa_banner_dismissed_at');
          set({ bannerDismissed: false });
        }
      }
    } catch (_) {}

    // 4. Capture any prompt that was already dispatched before React loaded
    if (window.__deferredPrompt) {
      set({ deferredPrompt: window.__deferredPrompt, isInstallable: true });
    }

    // 5. Connect future event capture
    window.__onDeferredPrompt = (prompt) => {
      set({ deferredPrompt: prompt, isInstallable: true });
    };

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      window.__deferredPrompt = e;
      set({ deferredPrompt: e, isInstallable: true });
    });

    // 6. Listen for successful app installation
    window.addEventListener('appinstalled', () => {
      set({ deferredPrompt: null, isInstallable: false, isInstalled: true, installGuideOpen: false });
      console.log('[SANKALP AI PWA] Successfully installed as native app!');
    });
  },
}));
