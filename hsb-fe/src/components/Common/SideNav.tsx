import { useEffect, useState } from 'react';
import { ArrowUpRight, Youtube } from 'lucide-react';

const sections = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'sections', label: 'Sections' },
  { id: 'contents', label: 'Contents' }, // 외부 링크로 이동
];

const SideNav = () => {
  const [activeId, setActiveId] = useState<string>('');

  const scrollToSection = (id: string) => {
    if (id === 'contents') {
      window.open('/link/youtube/list', '_blank');
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 현재 스크롤 위치 추적
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el) {
          const offsetTop = el.offsetTop - 120;
          if (scrollY >= offsetTop) {
            setActiveId(sections[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 초기화
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed right-6 top-1/3 z-50 hidden md:flex flex-col gap-3 items-end">
      {/* 섹션 버튼들 */}
      {sections.map((section) => {
        if (section.id === 'contents') {
          return (
            <button
              key={section.id}
              onClick={() => window.open('/link/youtube/list', '_blank')}
              className="flex items-center gap-2 px-3 py-1 rounded-full border border-blue-400 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-600 shadow text-sm font-medium transition"
              title="YouTube 콘텐츠로 이동"
            >
              <Youtube className="w-4 h-4" />
              {section.label}
              <ArrowUpRight className="w-4 h-4" />
            </button>
          );
        }

        return (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className={`px-3 py-1 rounded shadow text-sm font-medium transition
              ${activeId === section.id
                ? 'bg-blue-600 text-white dark:bg-blue-500'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-blue-600 dark:hover:bg-blue-500'}
            `}
          >
            {section.label}
          </button>
        );
      })}

      {/* 맨 위로 버튼 */}
      <button
        onClick={scrollToTop}
        className="mt-4 w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-all duration-200 shadow-md"
        title="맨 위로 이동"
      >
        ↑
      </button>
    </div>
  );
};

export default SideNav;
