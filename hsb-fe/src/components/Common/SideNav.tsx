// components/Common/SideNav.tsx
import { useEffect, useState } from 'react';
import { ArrowUpRight, Youtube, ChevronsUp } from 'lucide-react';

const sections = [
  { id: 'about',    label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills',   label: 'Skills' },
  { id: 'securitiesData', label: 'Securities Data' },
  { id: 'deploy',   label: 'Deploy' },
  { id: 'sections', label: 'Sections' },
  { id: 'contents', label: 'Contents' }, // 외부 링크
];

export default function SideNav() {
  const [activeId, setActiveId] = useState<string>('');

  const scrollToSection = (id: string) => {
    if (id === 'contents') {
      window.open('/link/youtube/list', '_blank');
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // 현재 스크롤 위치 추적 (모바일/데스크톱 공통)
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (!el) continue;
        const offsetTop = el.offsetTop - 120;
        if (y >= offsetTop) {
          setActiveId(sections[i].id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* 데스크톱: 우측 고정 세로 버튼 */}
      <div className="fixed right-6 top-1/3 z-50 hidden md:flex flex-col gap-3 items-end">
        {sections.map((s) =>
          s.id === 'contents' ? (
            <button
              key={s.id}
              onClick={() => window.open('/link/youtube/list', '_blank')}
              className="flex items-center gap-2 px-3 py-1 rounded-full border border-blue-400 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-600 shadow text-sm font-medium transition"
              title="YouTube 콘텐츠로 이동"
            >
              <Youtube className="w-4 h-4" />
              {s.label}
              <ArrowUpRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              key={s.id}
              onClick={() => scrollToSection(s.id)}
              className={`px-3 py-1 rounded shadow text-sm font-medium transition
                ${activeId === s.id
                  ? 'bg-blue-600 text-white dark:bg-blue-500'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-blue-600 dark:hover:bg-blue-500'}
              `}
            >
              {s.label}
            </button>
          )
        )}

        <button
          onClick={scrollToTop}
          className="mt-4 w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-all duration-200 shadow-md"
          title="맨 위로 이동"
        >
          ↑
        </button>
      </div>

      {/* 모바일: 하단 고정 바 */}
      <div
        className="
          fixed bottom-0 left-0 right-0 z-50 md:hidden
          bg-white/90 dark:bg-gray-900/90 backdrop-blur
          border-t border-gray-200 dark:border-gray-700
          px-2 pt-2 pb-[calc(8px+env(safe-area-inset-bottom))]  /* 안전영역 */
        "
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <div className="flex-1 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 min-w-max">
              {sections.map((s) =>
                s.id === 'contents' ? (
                  <button
                    key={s.id}
                    onClick={() => window.open('/link/youtube/list', '_blank')}
                    className="flex items-center gap-1 px-3 py-2 rounded-full border border-blue-400 text-blue-600 dark:text-blue-300 bg-white dark:bg-gray-800 text-xs font-medium whitespace-nowrap"
                    title="YouTube 콘텐츠로 이동"
                  >
                    <Youtube className="w-4 h-4" />
                    {s.label}
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                ) : (
                  <button
                    key={s.id}
                    onClick={() => scrollToSection(s.id)}
                    className={`px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap
                      ${activeId === s.id
                        ? 'bg-blue-600 text-white dark:bg-blue-500'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'}
                    `}
                  >
                    {s.label}
                  </button>
                )
              )}
            </div>
          </div>

          {/* 맨 위로 */}
          <button
            onClick={scrollToTop}
            className="ml-2 flex-none w-9 h-9 rounded-full flex items-center justify-center bg-blue-600 text-white shadow-md active:scale-95"
            aria-label="맨 위로"
            title="맨 위로"
          >
            <ChevronsUp className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
}
