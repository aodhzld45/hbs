import React from 'react';
import { Link } from 'react-router-dom';
import { Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 text-gray-600 mt-10">
      <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
        {/* 왼쪽: 저작권등 요구사항 표시 */}
        <p>&copy; 2025 HSB Corp. All rights reserved.</p>

        {/* 오른쪽: SNS 아이콘 + 관리자 링크 (임시)*/}
        <div className="flex items-center space-x-4">
          <Link to="/admin/index" className="text-sm font-medium border px-3 py-1 rounded hover:bg-gray-200">
            관리자
          </Link>   
          <a href="https://www.youtube.com/channel/UCpR8UwUbF20GCWJy4hxCOdQ" target="_blank" rel="noopener noreferrer">
            <Youtube className="w-5 h-5 hover:text-pink-500" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
