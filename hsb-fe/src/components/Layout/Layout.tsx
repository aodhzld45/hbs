// src/components/Layout/Layout.tsx
import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <Header />
      <main style={{ padding: '2rem' }}>
        {children}
      </main>
      <Footer />
    </>
  );
};

export default Layout;
