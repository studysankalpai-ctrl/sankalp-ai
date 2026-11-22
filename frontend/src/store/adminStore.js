import { create } from 'zustand';

const useAdminStore = create((set) => ({
  admin: JSON.parse(sessionStorage.getItem('sankalp_admin_user') || 'null'),
  token: sessionStorage.getItem('sankalp_admin_token') || null,
  isAuthenticated: !!sessionStorage.getItem('sankalp_admin_token'),
  mobileSidebarOpen: false,

  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
  toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),

  login: (admin, token) => {
    sessionStorage.setItem('sankalp_admin_token', token);
    sessionStorage.setItem('sankalp_admin_user', JSON.stringify(admin));
    set({ admin, token, isAuthenticated: true });
  },

  logout: () => {
    sessionStorage.removeItem('sankalp_admin_token');
    sessionStorage.removeItem('sankalp_admin_user');
    set({ admin: null, token: null, isAuthenticated: false });
  },

  updateAdmin: (admin) => {
    sessionStorage.setItem('sankalp_admin_user', JSON.stringify(admin));
    set({ admin });
  },
}));

export default useAdminStore;
