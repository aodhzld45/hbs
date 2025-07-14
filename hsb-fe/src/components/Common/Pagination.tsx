import React from 'react';

interface PaginationProps {
  currentPage: number;     // 현재 페이지 (0-based)
  totalPages: number;      // 전체 페이지 수
  onPageChange: (page: number) => void; // 페이지 변경 콜백
  className?: string;      // optional: 외부 스타일 적용용 클래스명
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  if (totalPages === 0) return null; // 페이지가 없으면 아무것도 렌더링하지 않음

  const visiblePages = 5; // 한 번에 보여줄 페이지 버튼 개수 (블럭 크기)

  /**
   * 현재 몇 번째 블럭인지 계산
   * 예) visiblePages = 5
   *    currentPage 0~4 → block 0
   *    currentPage 5~9 → block 1
   */
  const currentBlock = Math.floor(currentPage / visiblePages);

  /**
   * 현재 블럭의 시작 페이지 번호
   * ex) block 0 → 0
   *     block 1 → 5
   */
  const startPage = currentBlock * visiblePages;
  /**
   * 현재 블럭의 마지막 페이지 번호
   * ex) block 0 → 4
   *     block 1 → 9
   * 단, totalPages - 1 을 넘지 않도록 보정
   */
  const endPage = Math.min(startPage + visiblePages - 1, totalPages - 1);

  /**
   * 현재 블럭에 표시할 페이지 번호 배열 생성
   * ex) [0, 1, 2, 3, 4]
   */
  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  /**
   * 페이지 버튼 클릭 시 호출
   */
  const handlePageClick = (page: number) => {
    if (page !== currentPage) {
      onPageChange(page);
    }
  };

  /**
   * 이전 블럭 버튼 클릭 시
   * → 이전 블럭의 마지막 페이지로 이동
   * ex) 현재 블럭 11~15라면 이전 블럭 마지막 페이지 10번으로 이동
   */ 
  const handlePrevBlock = () => {
    if (currentBlock > 0) {
      const prevBlockStart = (currentBlock - 1) * visiblePages;
      const prevBlockEnd = Math.min(
        prevBlockStart + visiblePages - 1,
        totalPages - 1
      );
      onPageChange(prevBlockEnd);
    }
  };

  /**
   * 다음 블럭 버튼 클릭 시
   * → 다음 블럭의 첫 페이지로 이동
   */
  const handleNextBlock = () => {
    const nextBlockStart = (currentBlock + 1) * visiblePages;
    if (nextBlockStart < totalPages) {
      onPageChange(nextBlockStart);
    }
  };

  /**
   * 맨 처음 페이지로 이동
   */
  const handleFirstPage = () => {
    onPageChange(0);
  };

  /**
   * 맨 끝 페이지로 이동
   */
  const handleLastPage = () => {
    onPageChange(totalPages - 1);
  };

  return (
    <div className={`flex justify-center mt-6 space-x-1 ${className}`}>
      {/* 맨앞으로 */}
      <button
        onClick={handleFirstPage}
        disabled={currentPage === 0}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        &laquo;
      </button>

      {/* 이전 블럭 */}
      <button
        onClick={handlePrevBlock}
        disabled={currentBlock === 0}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        &lt;
      </button>

      {/* 페이지 번호 버튼들 */}
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => handlePageClick(page)}
          className={`px-3 py-1 border rounded ${
            page === currentPage ? 'bg-blue-600 text-white' : ''
          }`}
        >
          {page + 1}
        </button>
      ))}

      {/* > 다음 블럭으로 */}
      <button
        onClick={handleNextBlock}
        disabled={(currentBlock + 1) * visiblePages >= totalPages}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        &gt;
      </button>

      {/* 맨끝으로 */}
      <button
        onClick={handleLastPage}
        disabled={currentPage === totalPages - 1}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        &raquo;
      </button>
    </div>
  );
};

export default Pagination;
