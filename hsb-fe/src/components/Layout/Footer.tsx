import React from 'react';
import { Link } from 'react-router-dom';
import { Youtube } from 'lucide-react';

interface FooterProps {
  isDark: boolean;
  toggleDark: () => void;
}

const Footer = ({ isDark, toggleDark }: FooterProps) => {
  return (
    <footer className="bg-gray-100 text-gray-600 mt-10 dark:bg-gray-800 dark:text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
        {/* 왼쪽: 저작권 표시 */}
        <p>&copy; 2025 HSBS Corp. All rights reserved.</p>

        {/* 오른쪽: 메뉴 */}
        <div className="flex items-center space-x-4">
          {/* 다크/라이트 모드 아이콘 버튼 */}
          <img
            src={isDark ? '/image/dark-mode.png' : '/image/white-mode.png'}
            alt="모드 전환 아이콘"
            className="w-6 h-6 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={toggleDark}
            title={isDark ? '다크 모드 활성화됨 - 클릭 시 라이트 모드로' : '라이트 모드 활성화됨 - 클릭 시 다크 모드로'}
          />

          {/* 관리자 */}
          <Link
            to="/admin/index"
            className="text-sm font-medium border px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            관리자
          </Link>

          {/* GitHub */}
          <a
            href="https://github.com/aodhzld45"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub"
          >
            <img src="/image/git.png" alt="GitHub" className="w-5 h-5 hover:opacity-80" />
          </a>

          {/* YouTube */}
          <a
            href="https://www.youtube.com/"
            target="_blank"
            rel="noopener noreferrer"
            title="YouTube"
          >
            <Youtube className="w-5 h-5 hover:text-pink-500" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
