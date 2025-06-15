import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search?q=${encodeURIComponent(keyword)}`);
    }
  };

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="max-w-9xl mx-auto px-5 py-5 flex items-center justify-between">
        {/* 좌측 로고 */}
        <div className="text-2xl font-bold">
          <Link to="/">HBS</Link>
        </div>

        {/* 햄버거 메뉴 (모바일용) */}
        <div className="sm:hidden">
          <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
            <img
              src="/image/Hamburger_icon.svg.png"
              alt="메뉴"
              className="h-6 w-6"
            />
          </button>
        </div>

        {/* 가운데 메뉴 (PC 전용) */}
        <nav className="hidden sm:flex space-x-6 text-sm sm:text-base">
          <Link to="/notice/board-list" className="hover:text-yellow-300">커뮤니티</Link>
          <Link to="/video/hbs/list" className="hover:text-yellow-300">HBS</Link>
          <Link to="/link/youtube/list" className="hover:text-yellow-300">유튜브 홍보영상</Link>
          <Link to="/event/board-list" className="hover:text-yellow-300">이벤트</Link>
          <Link to="/contact" className="hover:text-yellow-300">문의하기</Link>
        </nav>

        {/* 우측 검색창 (PC 전용) */}
        <form
          onSubmit={handleSearch}
          className="hidden sm:flex items-center space-x-2"
        >
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="검색어 입력"
            className="px-3 py-1 rounded text-black w-40"
          />
          <button
            type="submit"
            className="p-1 rounded hover:opacity-80"
            title="검색"
          >
            <img
              src="/image/search-light.png"
              alt="검색"
              className="w-6 h-6"
            />
          </button>
        </form>
      </div>

      {/* 모바일 메뉴 */}
      {isMobileMenuOpen && (
        <nav className="sm:hidden bg-blue-700 text-white px-4 py-3">
          <div className="flex flex-col gap-3">
            {/* 메뉴 영역 */}
            <div className="flex flex-wrap gap-4">
              <Link to="/notice/board-list" className="hover:text-yellow-300">커뮤니티</Link>
              <Link to="/video/hbs/list" className="hover:text-yellow-300">HBS</Link>
              <Link to="/link/youtube/list" className="hover:text-yellow-300">유튜브 홍보영상</Link>
              <Link to="/event/board-list" className="hover:text-yellow-300">이벤트</Link>
              <Link to="/contact" className="hover:text-yellow-300">문의하기</Link>
            </div>

            {/* 검색창 우측 정렬 */}
            <div className="flex justify-center mt-2">
              <form onSubmit={handleSearch} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="검색어"
                  className="px-2 py-1 rounded text-black"
                />
                <button type="submit" className="bg-black px-2 py-1 rounded">검색</button>
              </form>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
