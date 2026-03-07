import Layout from '../Layout/Layout';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import Pagination from '../Common/Pagination';
import { BoardItem, getBoardDisplayName } from '../../types/Admin/BoardItem';
import { fetchBoardList } from '../../services/Admin/boardApi';
import { fetchBoardConfigByCode } from '../../services/Admin/boardConfigApi';

const BoardList = () => {
  const { boardCode = 'NOTICE' } = useParams();
  const normalizedBoardCode = boardCode.toLowerCase();
  const navigate = useNavigate();

  const [boardName, setBoardName] = useState<string>(normalizedBoardCode);
  const [notices, setNotices] = useState<BoardItem[]>([]);
  const [boards, setBoards] = useState<BoardItem[]>([]);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchBoardConfigByCode(normalizedBoardCode)
      .then((config) => setBoardName(config.boardName))
      .catch(() => setBoardName(getBoardDisplayName(normalizedBoardCode)));
  }, [normalizedBoardCode]);

  const loadBoardList = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetchBoardList(normalizedBoardCode, keyword, page, size, 'Y');
      setNotices(res.notices ?? []);
      setBoards(res.items ?? []);
      setTotalCount(res.totalCount);
      setTotalPages(res.totalPages);
      const representative = res.notices[0] ?? res.items[0];
      if (representative) {
        setBoardName(getBoardDisplayName(representative.boardCode, representative.boardName));
      }
    } catch (error) {
      console.error('게시글 목록 조회 실패:', error);
      alert('게시글 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [keyword, normalizedBoardCode, page, size]);

  useEffect(() => {
    setPage(0);
  }, [normalizedBoardCode]);

  useEffect(() => {
    loadBoardList();
  }, [loadBoardList]);

  return (
    <Layout>
      <div className="w-full max-w-screen-xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-center mb-8 dark:text-gray-400">{boardName}</h1>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            전체 <span className="font-medium">{totalCount}</span>건
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setPage(0);
                }
              }}
              placeholder="검색어를 입력해주세요."
              className="border px-3 py-2 rounded text-sm w-full sm:w-60"
            />
            <button onClick={() => setPage(0)} className="bg-gray-700 text-white px-4 py-2 rounded text-sm w-full sm:w-auto">
              검색
            </button>
          </div>
        </div>

        <table className="w-full table-fixed border-t border-b text-center">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr className="text-sm text-gray-900 dark:text-gray-100">
              <th className="py-3 w-[5%] dark:text-gray-400">No.</th>
              <th className="py-3 px-4 w-[45%] text-center font-bold text-[15px] leading-snug text-gray-900 dark:text-gray-400">제목</th>
              <th className="py-3 w-[15%] dark:text-gray-400">작성자</th>
              <th className="py-3 w-[20%] dark:text-gray-400">등록일</th>
              <th className="py-3 w-[10%] dark:text-gray-400">조회수</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">데이터를 불러오는 중입니다...</td>
              </tr>
            ) : (
              <>
                {notices.map((notice) => (
                  <tr key={`notice-${notice.id}`} className="border-t bg-yellow-50/60 dark:bg-yellow-900/20 dark:text-gray-400">
                    <td className="py-3 text-rose-600 font-semibold">공지</td>
                    <td
                      className="text-left px-6 py-3 cursor-pointer"
                      onClick={() => navigate(`/${normalizedBoardCode}/board-detail/${notice.id}`)}
                    >
                      <span className="text-blue-700 hover:underline dark:text-yellow-400">{notice.title}</span>
                    </td>
                    <td className="py-3">{notice.writerName || '-'}</td>
                    <td className="py-3">{notice.regDate ? format(new Date(notice.regDate), 'yyyy-MM-dd') : '-'}</td>
                    <td className="py-3">{notice.viewCount ?? 0}</td>
                  </tr>
                ))}

                {boards.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400 dark:text-gray-400">표시할 게시물이 없습니다.</td>
                  </tr>
                ) : (
                  boards.map((board, idx) => (
                    <tr key={board.id} className="border-t hover:bg-gray-50 dark:text-gray-400">
                      <td className="py-3">{Math.max(totalCount - (page * size + idx), 0)}</td>
                      <td
                        className="text-left px-6 py-3 text-blue-700 hover:underline cursor-pointer dark:text-yellow-400"
                        onClick={() => navigate(`/${normalizedBoardCode}/board-detail/${board.id}`)}
                      >
                        {board.title}
                      </td>
                      <td className="py-3">{board.writerName || '-'}</td>
                      <td className="py-3">{board.regDate ? format(new Date(board.regDate), 'yyyy-MM-dd') : '-'}</td>
                      <td className="py-3">{board.viewCount ?? 0}</td>
                    </tr>
                  ))
                )}
              </>
            )}
          </tbody>
        </table>

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} className="dark:text-gray-400" />
      </div>
    </Layout>
  );
};

export default BoardList;