import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search?q=${encodeURIComponent(keyword)}`);
    }
  };

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between">
        {/* 좌측 로고 */}
        <div className="text-2xl font-bold mb-2 sm:mb-0">
          <Link to={"/"}>HYOSUNG</Link>

        </div>

        {/* 가운데 메뉴 */}
        <nav className="flex-1 text-center space-x-4 text-sm sm:text-lg mb-2 sm:mb-0">
          <Link to="/notice/board-list" className="hover:text-yellow-300">공지사항</Link>
          <Link to="/hbs-list" className="hover:text-yellow-300">뉴스</Link>
          <Link to="/prom" className="hover:text-yellow-300">홍보자료</Link>
          <Link to="/event" className="hover:text-yellow-300">이벤트</Link>
          <Link to="/media" className="hover:text-yellow-300">미디어</Link>
        </nav>

        {/* 우측 검색창 */}
        <form
          onSubmit={handleSearch}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="검색어 입력"
            className="px-3 py-1 rounded text-black w-28 sm:w-40"
          />
          <button
            type="submit"
            className="bg-black hover:bg-gray-800 text-white p-2 rounded"
            title="검색"
          >
            {/* 🔍 돋보기 아이콘 (Heroicons 기반 SVG) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.35z"
              />
            </svg>
          </button>
        </form>
      </div>
    </header>
  );
};

export default Header;
