import { create } from 'zustand';

export const usePwaStore = create((set, get) => ({
  deferredPrompt: null,
  isInstallable: false,
  isInstalled: false,
  isIos: false,
  iosModalOpen: false,
  bannerDismissed: false,

  setDeferredPrompt: (prompt) =>
    set({
      deferredPrompt: prompt,
      isInstallable: !!prompt,
    }),

  setIsInstalled: (installed) => set({ isInstalled: installed }),
  setIsIos: (isIos) => set({ isIos }),
  setIosModalOpen: (open) => set({ iosModalOpen: open }),
  dismissBanner: () => {
    try {
      localStorage.setItem('sankalp_pwa_banner_dismissed', 'true');
    } catch (_) {}
    set({ bannerDismissed: true });
  },

  promptInstall: async () => {
    const { deferredPrompt, isIos } = get();

    if (isIos) {
      set({ iosModalOpen: true });
      return { outcome: 'ios_instructions' };
    }

    if (!deferredPrompt) {
      return { outcome: 'unavailable' };
    }

    // Trigger native browser install dialog
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      set({ deferredPrompt: null, isInstallable: false, isInstalled: true });
    }

    return { outcome };
  },

  initPwa: () => {
    if (typeof window === 'undefined') return;

    // Check if already in standalone app mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      set({ isInstalled: true });
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice =
      /iphone|ipad|ipod/.test(userAgent) && !window.MSStream;
    set({ isIos: isIosDevice });

    // Check dismissed banner
    try {
      const dismissed = localStorage.getItem('sankalp_pwa_banner_dismissed') === 'true';
      if (dismissed) set({ bannerDismissed: true });
    } catch (_) {}

    // Listen for beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      set({ deferredPrompt: e, isInstallable: true });
    });

    // Listen for appinstalled
    window.addEventListener('appinstalled', () => {
      set({ deferredPrompt: null, isInstallable: false, isInstalled: true });
      console.log('[SANKALP AI PWA] Successfully installed as native app!');
    });
  },
}));
