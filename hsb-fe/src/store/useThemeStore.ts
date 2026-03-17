// src/store/useThemeStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDark: boolean;
  initialized: boolean;
  initializeTheme: () => void;
  toggleDark: () => void;
  setDark: (value: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDark: true, // 처음 기본값은 무조건 다크
      initialized: false,

      initializeTheme: () => {
        const { initialized } = get();
        if (initialized) return;

        set({ initialized: true });
      },

      toggleDark: () =>
        set((state) => ({
          isDark: !state.isDark,
        })),

      setDark: (value: boolean) => set({ isDark: value }),
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({
        isDark: state.isDark,
      }),
    }
  )
);