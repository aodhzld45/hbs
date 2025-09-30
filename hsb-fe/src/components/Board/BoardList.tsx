import Layout from '../Layout/Layout';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BoardItem, BoardType, BoardTypeTitleMap } from '../../types/Admin/BoardItem';
import { fetchBoardList } from '../../services/Admin/boardApi';
import Pagination from '../Common/Pagination';
import { format } from 'date-fns';

const BoardList = () => {
  const { boardType } = useParams();
  const navigate = useNavigate();

  const safeBoardType = (boardType?.toUpperCase() ?? 'NOTICE') as BoardType;

  const [notices, setNotices] = useState<BoardItem[]>([]);
  const [boards, setBoards]   = useState<BoardItem[]>([]);
  const [keyword, setKeyword] = useState('');
  const [page, setPage]       = useState(0);
  const [size]                = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading]   = useState(false);

  const loadBoardList = async () => {
    try {
      setIsLoading(true);
      const res = await fetchBoardList(safeBoardType, keyword, page, size, 'Y');
      setNotices(res.notices ?? []);   // 상단 공지
      setBoards(res.items ?? []);      // 일반 목록(공지 제외)
      setTotalCount(res.totalCount);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error('게시글 조회 실패:', err);
      alert('게시글 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // boardType 변경 시 페이지 리셋
  useEffect(() => {
    setPage(0);
  }, [boardType]);

  // boardType/page/keyword 변경 시 재조회
  useEffect(() => {
    loadBoardList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardType, page, keyword]);

  return (
    <Layout>
      <div className="w-full max-w-screen-xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-center mb-8 dark:text-gray-400">
          {BoardTypeTitleMap[safeBoardType]}
        </h1>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            전체 <span className="font-medium">{totalCount}</span>건
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            <select className="border px-3 py-2 rounded text-sm w-full sm:w-auto">
              <option>전체</option>
            </select>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setPage(0);
              }}
              placeholder="검색어를 입력해주세요."
              className="border px-3 py-2 rounded text-sm w-full sm:w-60"
            />
            <button
              onClick={() => setPage(0)}
              className="bg-gray-700 text-white px-4 py-2 rounded text-sm w-full sm:w-auto"
            >
              검색
            </button>
          </div>
        </div>

        <table className="w-full table-fixed border-t border-b text-center">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr className="text-sm text-gray-900 dark:text-gray-100">
              <th className="py-3 w-[5%] dark:text-gray-400">No.</th>
              <th className="py-3 px-4 w-[45%] text-center font-bold text-[15px] leading-snug text-gray-900 dark:text-gray-400">
                제목
              </th>
              <th className="py-3 w-[15%] dark:text-gray-400">작성자</th>
              <th className="py-3 w-[20%] dark:text-gray-400">등록일</th>
              <th className="py-3 w-[10%] dark:text-gray-400">조회수</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                  데이터를 불러오는 중입니다...
                </td>
              </tr>
            ) : (
              <>
                {/*  공지 영역 */}
                {notices?.length > 0 &&
                  notices.map((n) => (
                    <tr
                      key={`notice-${n.id}`}
                      className="border-t bg-yellow-50/60 dark:bg-yellow-900/20 dark:text-gray-400"
                    >
                      <td className="py-3 text-rose-600 font-semibold">공지</td>
                      <td
                        className="text-left px-6 py-3 cursor-pointer"
                        onClick={() => navigate(`/${boardType}/board-detail/${n.id}`)}
                      >
                        <span className="inline-flex items-center gap-1 text-rose-600 font-semibold mr-2">
                          📌
                        </span>
                        <span className="text-blue-700 hover:underline dark:text-yellow-400">
                          {n.title}
                        </span>
                      </td>
                      <td className="py-3">{n.writerName || '-'}</td>
                      <td className="py-3">
                        {n.regDate ? format(new Date(n.regDate), 'yyyy-MM-dd') : '-'}
                      </td>
                      <td className="py-3">{n.viewCount ?? 0}</td>
                    </tr>
                  ))}

                {/*  일반 목록 */}
                {boards.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400 dark:text-gray-400">
                      표시할 게시물이 없습니다.
                    </td>
                  </tr>
                ) : (
                  boards.map((board, idx) => (
                    <tr key={board.id} className="border-t hover:bg-gray-50 dark:text-gray-400">
                      <td className="py-3">
                        {Math.max(0, totalCount - (page * size + idx))}
                      </td>
                      <td
                        className="text-left px-6 py-3 text-blue-700 hover:underline cursor-pointer dark:text-yellow-400"
                        onClick={() => navigate(`/${boardType}/board-detail/${board.id}`)}
                      >
                        {board.title}
                      </td>
                      <td className="py-3">{board.writerName || '-'}</td>
                      <td className="py-3">
                        {board.regDate ? format(new Date(board.regDate), 'yyyy-MM-dd') : '-'}
                      </td>
                      <td className="py-3">{board.viewCount}</td>
                    </tr>
                  ))
                )}
              </>
            )}
          </tbody>
        </table>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          className="dark:text-gray-400"
        />
      </div>
    </Layout>
  );
};

export default BoardList;
