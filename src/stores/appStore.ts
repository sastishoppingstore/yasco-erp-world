import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
  tenantId: number | null;
  setTenantId: (id: number) => void;
  activeModule: string | null;
  setActiveModule: (module: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      language: 'en',
      setLanguage: (language) => set({ language }),
      tenantId: null,
      setTenantId: (tenantId) => set({ tenantId }),
      activeModule: null,
      setActiveModule: (activeModule) => set({ activeModule }),
    }),
    {
      name: 'erp-app',
      partialize: (state) => ({
        language: state.language,
        tenantId: state.tenantId,
        activeModule: state.activeModule,
      }),
    },
  ),
);
