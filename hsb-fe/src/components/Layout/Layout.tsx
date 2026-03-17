// src/components/Layout/Layout.tsx
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { usePageLogger } from '../../hooks/usePageLogger';
import { useThemeStore } from '../../store/useThemeStore';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const isMainPage = location.pathname === '/';

  const isDark = useThemeStore((state) => state.isDark);
  const initializeTheme = useThemeStore((state) => state.initializeTheme);
  const toggleDark = useThemeStore((state) => state.toggleDark);

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  usePageLogger();

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#121212] text-gray-800 dark:text-gray-100">
      {!isMainPage && <Header />}

      <main
        className={
          isMainPage
            ? 'flex-none w-full px-0 py-0'
            : 'flex-1 w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6'
        }
      >
        {children}
      </main>

      <Footer isDark={isDark} toggleDark={toggleDark} />
    </div>
  );
};

export default Layout;