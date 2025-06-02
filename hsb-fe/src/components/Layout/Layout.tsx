// src/components/Layout/Layout.tsx
import React, { useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import { usePageLogger } from '../../hooks/usePageLogger';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isDark, setIsDark] = useState(() => {
    // 최초 렌더링 시 localStorage에서 불러오기
    const stored = localStorage.getItem('dark-mode');
    return stored === 'true'; // 'true'이면 true
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    localStorage.setItem('dark-mode', String(isDark));

  }, [isDark]);

  usePageLogger();

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#121212] text-gray-800 dark:text-gray-800">
      <Header />
      <main className="flex-1 w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <Footer isDark={isDark} toggleDark={() => setIsDark(!isDark)} />
    </div>
  );
};

export default Layout;
