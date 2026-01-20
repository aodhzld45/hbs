import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import type { UserMenuNode } from "../../types/Admin/UserMenuNode";
import { fetchUserMenuTree } from "../../services/Admin/userMenuApi";

const Header = () => {
  const [menuTree, setMenuTree] = useState<UserMenuNode[]>([]);
  const [keyword, setKeyword] = useState("");
  const [isOverlayOpen, setOverlayOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // PC 드롭다운
  const [hoveredMenuId, setHoveredMenuId] = useState<number | null>(null);
  const hoverTimeoutRef = useRef<number | null>(null);

  // 모바일 아코디언
  const [openGroupId, setOpenGroupId] = useState<number | null>(null);

  const onlyUsable = true;
  const location = useLocation();

  // --- hover handlers (브라우저 안전 타입) ---
  const handleMouseEnter = (id: number) => {
    if (hoverTimeoutRef.current) window.clearTimeout(hoverTimeoutRef.current);
    setHoveredMenuId(id);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = window.setTimeout(() => {
      setHoveredMenuId(null);
    }, 200);
  };

  useEffect(() => {
    const loadTree = async () => {
      try {
        const data = await fetchUserMenuTree(onlyUsable);
        setMenuTree(data);
      } catch (err) {
        console.error("메뉴 트리 조회 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    loadTree();
  }, [onlyUsable]);

  const topMenus = useMemo(
    () => menuTree.filter((m) => m.depth === 0 && m.useTf === "Y"),
    [menuTree]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    alert("통합검색 기능 구현중입니다.");
  };

  const isActivePath = (url?: string | null) => {
    if (!url) return false;
    // exact match + 하위 경로도 활성 처리하고 싶으면 startsWith로 바꾸면 됨
    return location.pathname === url || location.pathname.startsWith(url + "/");
  };

  const closeOverlay = () => {
    setOverlayOpen(false);
    setOpenGroupId(null);
  };

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50">
        {/* 배경 레이어 (블러 + 은은한 그라데이션) */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600">
          <div className="backdrop-blur supports-[backdrop-filter]:bg-white/10">
            <div className="mx-auto max-w-screen-2xl px-4 sm:px-6">
              <div className="flex h-16 items-center justify-between">
                {/* 로고 */}
                <Link
                  to="/"
                  className="group inline-flex items-center gap-2 rounded-xl px-3 py-2 text-white/95 hover:bg-white/10 transition"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20">
                    {/* 로고 아이콘 느낌 (원하면 교체) */}
                    <span className="text-sm font-extrabold">H</span>
                  </span>
                  <span className="text-lg font-extrabold tracking-tight">
                    HSBS
                  </span>
                </Link>

                {/* PC 메뉴 */}
                <nav className="hidden sm:flex items-center gap-2">
                  {topMenus.map((menu) => {
                    const visibleChildren =
                      menu.children?.filter((c) => c.useTf === "Y") ?? [];
                    const hasChildren = visibleChildren.length > 0;
                    const active = isActivePath(menu.url);

                    return (
                      <div
                        key={menu.id}
                        className="relative"
                        onMouseEnter={() => handleMouseEnter(menu.id)}
                        onMouseLeave={handleMouseLeave}
                      >
                        {/* 상위 메뉴 버튼 */}
                        {menu.url && !hasChildren ? (
                          <Link
                            to={menu.url}
                            className={[
                              "relative rounded-lg px-3 py-2 text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 transition",
                              active ? "text-white bg-white/10" : "",
                            ].join(" ")}
                          >
                            {menu.name}
                            {/* 밑줄 애니메이션 */}
                            <span
                              className={[
                                "pointer-events-none absolute left-3 right-3 -bottom-0.5 h-[2px] rounded-full bg-yellow-300/90 transition-transform duration-200",
                                active ? "scale-x-100" : "scale-x-0",
                                "origin-left group-hover:scale-x-100",
                              ].join(" ")}
                            />
                          </Link>
                        ) : (
                          <button
                            type="button"
                            className={[
                              "relative rounded-lg px-3 py-2 text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 transition",
                              hoveredMenuId === menu.id ? "bg-white/10" : "",
                            ].join(" ")}
                          >
                            <span className="inline-flex items-center gap-1">
                              {menu.name}
                              {hasChildren && (
                                <svg
                                  className={[
                                    "h-4 w-4 transition-transform",
                                    hoveredMenuId === menu.id ? "rotate-180" : "",
                                  ].join(" ")}
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                  aria-hidden="true"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </span>
                          </button>
                        )}

                        {/* 드롭다운 */}
                        {hoveredMenuId === menu.id && hasChildren && (
                          <div className="absolute left-0 top-full pt-3">
                            <div
                              className="w-56 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5"
                              onMouseEnter={() => handleMouseEnter(menu.id)}
                              onMouseLeave={handleMouseLeave}
                            >
                              <div className="px-3 py-2">
                                <p className="text-xs font-semibold text-gray-400">
                                  {menu.name}
                                </p>
                              </div>
                              <ul className="py-2">
                                {visibleChildren.map((child) => {
                                  const childActive = isActivePath(child.url);
                                  return (
                                    <li key={child.id}>
                                      <Link
                                        to={child.url || "#"}
                                        className={[
                                          "flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition",
                                          childActive ? "bg-blue-50 text-blue-700 font-semibold" : "",
                                        ].join(" ")}
                                      >
                                        <span className="truncate">{child.name}</span>
                                        <span className="text-gray-300">→</span>
                                      </Link>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>

                {/* 검색 */}
                <form
                  onSubmit={handleSearch}
                  className="hidden sm:flex items-center"
                >
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/70">
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.5 3.5a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM2 8.5a6.5 6.5 0 1 1 11.3 4.1l3.05 3.05a.75.75 0 1 1-1.06 1.06l-3.05-3.05A6.5 6.5 0 0 1 2 8.5Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>

                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="검색어 입력"
                      className="
                        w-40 focus:w-64
                        transition-all duration-200
                        rounded-xl bg-white/15 text-white placeholder:text-white/70
                        ring-1 ring-white/20 focus:ring-2 focus:ring-yellow-300/70
                        pl-9 pr-3 py-2 text-sm outline-none
                      "
                    />
                  </div>
                </form>

                {/* 햄버거 (모바일) */}
                <button
                  type="button"
                  onClick={() => setOverlayOpen(true)}
                  className="inline-flex items-center justify-center rounded-xl p-2 text-white/90 hover:bg-white/10 transition"
                  aria-label="메뉴 열기"
                >
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 얇은 구분선(고급스러운 라인) */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      </header>

      {/* ===== Mobile Overlay (Drawer) ===== */}
      {isOverlayOpen && (
        <div className="fixed inset-0 z-50">
          {/* dim */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeOverlay}
          />

          {/* drawer */}
          <div className="absolute right-0 top-0 h-full w-[88%] max-w-sm bg-white shadow-2xl">
            {/* header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-700 to-indigo-600 px-4 py-4 text-white">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                  <span className="text-sm font-extrabold">H</span>
                </span>
                <div>
                  <p className="text-lg font-extrabold leading-none">HSBS</p>
                  <p className="text-xs text-white/75">Navigation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeOverlay}
                className="rounded-xl p-2 hover:bg-white/10 transition"
                aria-label="메뉴 닫기"
              >
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" d="M6 6l12 12M18 6l-12 12" />
                </svg>
              </button>
            </div>

            {/* body */}
            <div className="h-[calc(100%-72px)] overflow-y-auto p-5">
              {/* Search (mobile) */}
              <form onSubmit={handleSearch} className="mb-5">
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.5 3.5a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM2 8.5a6.5 6.5 0 1 1 11.3 4.1l3.05 3.05a.75.75 0 1 1-1.06 1.06l-3.05-3.05A6.5 6.5 0 0 1 2 8.5Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="검색어 입력"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </form>

              {loading && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                  메뉴를 불러오는 중입니다...
                </div>
              )}

              {!loading && (
                <div className="space-y-3">
                  {topMenus.map((menu) => {
                    const visibleChildren =
                      menu.children?.filter((c) => c.useTf === "Y") ?? [];
                    const hasChildren = visibleChildren.length > 0;
                    const isOpen = openGroupId === menu.id;

                    // 자식 없고 url 있으면 그냥 링크 카드
                    if (menu.url && !hasChildren) {
                      const active = isActivePath(menu.url);
                      return (
                        <Link
                          key={menu.id}
                          to={menu.url}
                          onClick={closeOverlay}
                          className={[
                            "flex items-center justify-between rounded-2xl border px-4 py-4 transition",
                            active
                              ? "border-blue-200 bg-blue-50 text-blue-700"
                              : "border-gray-200 bg-white hover:bg-gray-50",
                          ].join(" ")}
                        >
                          <span className="font-semibold">{menu.name}</span>
                          <span className="text-gray-300">→</span>
                        </Link>
                      );
                    }

                    // 아코디언 그룹
                    return (
                      <div
                        key={menu.id}
                        className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setOpenGroupId((prev) =>
                              prev === menu.id ? null : menu.id
                            )
                          }
                          className="flex w-full items-center justify-between px-4 py-4 text-left hover:bg-gray-50 transition"
                        >
                          <span className="font-semibold text-gray-800">
                            {menu.name}
                          </span>
                          <svg
                            className={[
                              "h-5 w-5 text-gray-400 transition-transform",
                              isOpen ? "rotate-180" : "",
                            ].join(" ")}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>

                        {isOpen && (
                          <div className="border-t border-gray-100 bg-gray-50 px-2 py-2">
                            {/* 상위 메뉴에 url이 있고 “자식도 있는” 케이스면 상위로 이동 버튼 하나 추가 */}
                            {menu.url && (
                              <Link
                                to={menu.url}
                                onClick={closeOverlay}
                                className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-gray-700 hover:bg-white transition"
                              >
                                <span>{menu.name} (전체)</span>
                                <span className="text-gray-300">→</span>
                              </Link>
                            )}

                            {visibleChildren.map((child) => {
                              const active = isActivePath(child.url);
                              return (
                                <Link
                                  key={child.id}
                                  to={child.url || "#"}
                                  onClick={closeOverlay}
                                  className={[
                                    "flex items-center justify-between rounded-xl px-3 py-3 text-sm transition",
                                    active
                                      ? "bg-white text-blue-700 font-semibold"
                                      : "text-gray-700 hover:bg-white hover:text-blue-700",
                                  ].join(" ")}
                                >
                                  <span className="truncate">{child.name}</span>
                                  <span className="text-gray-300">→</span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
