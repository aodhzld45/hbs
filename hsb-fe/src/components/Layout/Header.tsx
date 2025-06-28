import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserMenuNode } from '../../types/Admin/UserMenuNode';
import { fetchUserMenuTree } from '../../services/Admin/userMenuApi';

const Header = () => {
  const [menuTree, setMenuTree] = useState<UserMenuNode[]>([]);
  const [keyword, setKeyword] = useState('');
  const [isOverlayOpen, setOverlayOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [hoveredMenuId, setHoveredMenuId] = useState<number | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // 마우스를 올렸을 때
  const handleMouseEnter = (id: number) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredMenuId(id);
  };

  // 마우스를 뗐을 때
  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredMenuId(null);
    }, 300); // 300ms 지연
  };

  useEffect(() => {
    const loadTree = async () => {
      try {
        const data = await fetchUserMenuTree();
        setMenuTree(data);
      } catch (err) {
        console.error('메뉴 트리 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };
    loadTree();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    alert('통합검색 기능 구현중입니다.');
  };

  const topMenus = menuTree.filter(
    (m) => m.depth === 0 && m.useTf === 'Y'
  ); 

  return (
    <>
      <header className="relative z-50">
        <div className="bg-blue-600 text-white shadow-md">
          <div className="max-w-9xl mx-auto px-5 py-5 flex items-center justify-between">
            {/* 로고 */}
            <div className="text-2xl font-bold">
              <Link to="/">HBS</Link>
            </div>

            {/* PC 메뉴 */}
            <nav className="hidden sm:flex gap-8 text-sm sm:text-base font-semibold relative">
            {topMenus.map((menu) => (
              <div
                key={menu.id}
                className="relative"
                onMouseEnter={() => handleMouseEnter(menu.id)}
                onMouseLeave={handleMouseLeave}
              >
                {menu.url ? (
                  <Link to={menu.url} className="hover:text-yellow-300 px-2">
                    {menu.name}
                  </Link>
                ) : (
                  <span className="hover:text-yellow-300 px-2 cursor-default">
                    {menu.name}
                  </span>
                )}
                {hoveredMenuId === menu.id &&
                  menu.children &&
                  menu.children.filter(child => child.useTf === 'Y').length > 0 && (
                  <div className="absolute left-0 top-full mt-2 w-48 bg-white text-black shadow-md rounded z-40">
                    <ul className="flex flex-col py-2">
                      {menu.children.map((child) => (
                        <li key={child.id}>
                          <Link
                            to={child.url || '#'}
                            className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 whitespace-nowrap"
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}

            </nav>

            {/* 검색창 */}
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
                <img src="/image/search-light.png" alt="검색" className="w-6 h-6" />
              </button>
            </form>

            {/* 햄버거 */}
            <div className="block sm:block">
              <button onClick={() => setOverlayOpen(true)}>
                <img src="/image/Hamburger_icon.svg.png" alt="메뉴" className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 모바일 오버레이 메뉴 */}
      {isOverlayOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-50"
          onClick={() => setOverlayOpen(false)}
        >
          <div
            className="absolute right-0 top-0 w-4/5 sm:w-full h-full bg-white shadow-lg flex flex-col transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 상단 닫기 */}
            <div className="flex items-start justify-between p-4 border-b border-gray-200 bg-blue-600 text-white">
              <button
                onClick={() => setOverlayOpen(false)}
                className="text-white text-2xl font-light"
              >
                &times;
              </button>
            </div>

            {/* 본문 메뉴 */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-10">
                <h2 className="text-xl font-bold mb-2">HBS에 오신 것을 환영합니다</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm text-gray-800">
                <div>
                  <h3 className="font-bold mb-2">커뮤니티</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link to="/notice/board-list" onClick={() => setOverlayOpen(false)}>
                        공지사항
                      </Link>
                    </li>
                    <li>
                      <Link to="/event/board-list" onClick={() => setOverlayOpen(false)}>
                        이벤트
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold mb-2">HBS 콘텐츠</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link to="/video/hbs/list" onClick={() => setOverlayOpen(false)}>
                        HBS
                      </Link>
                    </li>
                    <li>
                      <Link to="/link/youtube/list" onClick={() => setOverlayOpen(false)}>
                        유튜브 홍보영상
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold mb-2">고객지원</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link to="/contact" onClick={() => setOverlayOpen(false)}>
                        문의하기
                      </Link>
                    </li>
                  </ul>
                </div>
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
