import React from 'react';
import { Link } from 'react-router-dom';
import { Youtube } from 'lucide-react';

interface FooterProps {
  isDark: boolean;
  toggleDark: () => void;
  sticky?: boolean; // 선택: 하단 고정하고 싶을 때
}

const Footer = ({ isDark, toggleDark, sticky = false }: FooterProps) => {
  return (
    <footer
      className={[
        "mt-10 border-t bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
        sticky ? "sticky bottom-0 z-20" : ""
      ].join(" ")}
    >
      <div className="mx-auto max-w-7xl px-4 py-4 pb-[env(safe-area-inset-bottom)]">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          {/* 왼쪽: 저작권 */}
          <p className="text-xs sm:text-sm">&copy; 2025 HSBS Corp. All rights reserved.</p>

          {/* 오른쪽: 메뉴 */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 다크/라이트 버튼 */}
            <button
              type="button"
              onClick={toggleDark}
              aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border bg-white hover:bg-gray-50 focus:outline-none focus:ring dark:border-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
              title={isDark ? '다크 모드 활성화됨 - 클릭 시 라이트 모드로' : '라이트 모드 활성화됨 - 클릭 시 다크 모드로'}
            >
              <img
                src={isDark ? '/image/dark-mode.png' : '/image/white-mode.png'}
                alt=""
                className="h-5 w-5"
                draggable={false}
              />
            </button>

            {/* 관리자 */}
            <Link
              to="/admin/index"
              className="inline-flex h-11 items-center rounded-lg border px-4 text-sm font-medium hover:bg-gray-200 focus:outline-none focus:ring dark:border-gray-700 dark:hover:bg-gray-700"
            >
              관리자
            </Link>

            {/* GitHub */}
            <a
              href="https://github.com/aodhzld45"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border bg-white hover:bg-gray-50 focus:outline-none focus:ring dark:border-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
              title="GitHub"
            >
              <img src="/image/git.png" alt="GitHub" className="h-5 w-5" />
            </a>

            {/* YouTube */}
            <a
              href="https://www.youtube.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border bg-white hover:bg-gray-50 focus:outline-none focus:ring dark:border-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
              title="YouTube"
            >
              <Youtube className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
