// src/components/Layout/Layout.tsx
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom'; // 추가
import Header from './Header';
import Footer from './Footer';
import { usePageLogger } from '../../hooks/usePageLogger';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation(); // 현재 경로 확인
  const isMainPage = location.pathname === '/';

  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('dark-mode');
    if (stored !== null) return stored === 'true';
    return isMainPage; // 메인페이지면 true로 시작
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
      {!isMainPage && <Header />}
      <main
        className={
          isMainPage
            ? 'flex-1 w-full px-0 py-0' // 메인 페이지: 여백 없이 꽉 채움
            : 'flex-1 w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6' // 일반 페이지
        }
      >        
        {children}
      </main>
      <Footer isDark={isDark} toggleDark={() => setIsDark(!isDark)} />
    </div>
  );
};

export default Layout;
