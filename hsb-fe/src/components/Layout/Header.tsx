import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const [keyword, setKeyword] = useState('');
  const [isOverlayOpen, setOverlayOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    alert("통합검색 기능 구현중입니다.");
    return;
    // if (keyword.trim()) {
    //   navigate(`/search?q=${encodeURIComponent(keyword)}`);
    //   setOverlayOpen(false); // 검색 후 메뉴 닫기
    // }
  };

  return (
    <>
      <header className="bg-blue-600 text-white shadow-md z-20 relative">
        <div className="max-w-9xl mx-auto px-5 py-5 flex items-center justify-between">
          {/* 로고 */}
          <div className="text-2xl font-bold">
            <Link to="/">HBS</Link>
          </div>

          {/* 가운데 메뉴 (PC 전용) */}
          <nav className="hidden sm:flex space-x-6 text-sm sm:text-base">
            <Link to="/notice/board-list" className="hover:text-yellow-300">커뮤니티</Link>
            <Link to="/video/hbs/list" className="hover:text-yellow-300">HBS</Link>
            <Link to="/link/youtube/list" className="hover:text-yellow-300">유튜브 홍보영상</Link>
            <Link to="/event/board-list" className="hover:text-yellow-300">이벤트</Link>
            <Link to="/contact" className="hover:text-yellow-300">문의하기</Link>
          </nav>

          {/* 검색창 (PC 전용) */}
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
            <button type="submit" className="p-1 rounded hover:opacity-80" title="검색">
              <img
                src="/image/search-light.png"
                alt="검색"
                className="w-6 h-6"
              />
            </button>
          </form>

          {/* 햄버거 버튼 (모바일 + PC) */}
          <div className="block sm:block">
            <button onClick={() => setOverlayOpen(true)}>
              <img
                src="/image/Hamburger_icon.svg.png"
                alt="메뉴"
                className="h-6 w-6"
              />
            </button>
          </div>
        </div>
      </header>

      {/* 우측 슬라이드 메뉴 */}
      {isOverlayOpen && (
      <div
        className="fixed inset-0 bg-black/30 z-50"
        onClick={() => setOverlayOpen(false)}
      >
      <div
          className="absolute right-0 top-0 w-4/5 sm:w-full h-full bg-white shadow-lg flex flex-col transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
      >
          {/* 상단 헤더 */}
          <div className="flex items-start justify-between p-4 border-b border-gray-200 bg-blue-600 text-white">
            <button
              onClick={() => setOverlayOpen(false)}
              className="text-white text-2xl font-light"
            >
              &times;
            </button>
          </div>
      
          {/* 본문 콘텐츠 (메뉴) */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* 인사 및 로그인 */}
            <div className="mb-10">
              <h2 className="text-xl font-bold mb-2">HBS에 오신 것을 환영합니다</h2>
            </div>
      
            {/* 카테고리별 메뉴 (PC: 가로정렬 / Mobile: 세로) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm text-gray-800">
              {/* 첫 번째 카테고리 */}
              <div>
                <h3 className="font-bold mb-2">커뮤니티</h3>
                <ul className="space-y-2">
                  <li><Link to="/notice/board-list" onClick={() => setOverlayOpen(false)}>공지사항</Link></li>
                  <li><Link to="/event/board-list" onClick={() => setOverlayOpen(false)}>이벤트</Link></li>
                </ul>
              </div>
      
              {/* 두 번째 카테고리 */}
              <div>
                <h3 className="font-bold mb-2">HBS 콘텐츠</h3>
                <ul className="space-y-2">
                  <li><Link to="/video/hbs/list" onClick={() => setOverlayOpen(false)}>HBS</Link></li>
                  <li><Link to="/link/youtube/list" onClick={() => setOverlayOpen(false)}>유튜브 홍보영상</Link></li>
                </ul>
              </div>
      
              {/* 세 번째 카테고리 */}
              <div>
                <h3 className="font-bold mb-2">고객지원</h3>
                <ul className="space-y-2">
                  <li><Link to="/contact" onClick={() => setOverlayOpen(false)}>문의하기</Link></li>
                </ul>
              </div>
      
              {/* 검색 */}
              <div>
                <h3 className="font-bold mb-2">검색</h3>
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="검색어 입력"
                    className="flex-grow px-3 py-2 rounded border text-sm"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                  >
                    검색
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </>
  );
};

export default Header;
