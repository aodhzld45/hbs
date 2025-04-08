// src/components/Layout/Header.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">HBS CMS</h1>
        <nav className="space-x-6 text-lg">
          <Link to="/" className="hover:text-yellow-300">홈</Link>
          <Link to="/news" className="hover:text-yellow-300">뉴스</Link>
          <Link to="/prom" className="hover:text-yellow-300">홍보자료</Link>
          <Link to="/event" className="hover:text-yellow-300">이벤트</Link>
          <Link to="/media" className="hover:text-yellow-300">미디어</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
