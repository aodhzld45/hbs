// src/components/Layout/Layout.tsx
import React, { useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import { usePageLogger } from '../../hooks/usePageLogger';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  usePageLogger();

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#121212] text-gray-800 dark:text-gray-800">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
      <Footer isDark={isDark} toggleDark={() => setIsDark(!isDark)} />
    </div>
  );
};

export default Layout;
