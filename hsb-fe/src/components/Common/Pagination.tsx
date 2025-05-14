import React from 'react';

interface PaginationProps {
  currentPage: number;     // 현재 페이지 (0-based)
  totalPages: number;      // 전체 페이지 수
  onPageChange: (page: number) => void;
  className?: string;      // 선택적으로 외부 스타일링 클래스
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, className = '' }) => {
  if (totalPages === 0) return null;

  const pageNumbers = [];
  for (let i = 0; i < totalPages; i++) {
    pageNumbers.push(i);
  }

  const handleClick = (page: number) => {
    if (page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <div className={`flex justify-center mt-6 space-x-1 ${className}`}>
      <button
        onClick={() => handleClick(Math.max(0, currentPage - 1))}
        disabled={currentPage === 0}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        &lt;
      </button>

      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => handleClick(page)}
          className={`px-3 py-1 border rounded ${
            page === currentPage ? 'bg-blue-600 text-white' : ''
          }`}
        >
          {page + 1}
        </button>
      ))}

      <button
        onClick={() => handleClick(Math.min(totalPages - 1, currentPage + 1))}
        disabled={currentPage === totalPages - 1}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        &gt;
      </button>
    </div>
  );
};

export default Pagination;
