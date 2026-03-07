import React, { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../../components/Layout/AdminLayout';
import Pagination from '../../../components/Common/Pagination';
import { BoardItem, getBoardDisplayName } from '../../../types/Admin/BoardItem';
import { fetchBoardList, fetchExcelDownload, updateBoardUseTf } from '../../../services/Admin/boardApi';
import { fetchBoardConfigByCode } from '../../../services/Admin/boardConfigApi';
import { useAuth } from '../../../context/AuthContext';

const BoardManager: React.FC = () => {
  const navigate = useNavigate();
  const { boardCode = 'NOTICE' } = useParams();
  const normalizedBoardCode = boardCode.toUpperCase();
  const { admin } = useAuth();

  const [adminId, setAdminId] = useState<string | null>(admin?.id ?? null);
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
    setAdminId(admin?.id ?? null);
  }, [admin?.id]);

  useEffect(() => {
    fetchBoardConfigByCode(normalizedBoardCode)
      .then((config) => setBoardName(config.boardName))
      .catch(() => setBoardName(normalizedBoardCode));
  }, [normalizedBoardCode]);

  const loadBoardList = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetchBoardList(normalizedBoardCode, keyword, page, size);
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

  const handleToggleUseTf = async (board: BoardItem) => {
    if (!adminId) {
      alert('관리자 정보가 없습니다. 다시 로그인해주세요.');
      return;
    }

    try {
      const nextUseTf = board.useTf === 'Y' ? 'N' : 'Y';
      await updateBoardUseTf(board.id, nextUseTf, adminId);
      await loadBoardList();
    } catch (error) {
      console.error('게시글 사용 여부 변경 실패:', error);
      alert('사용 여부 변경에 실패했습니다.');
    }
  };

  const handleExcelDownload = async () => {
    try {
      const res = await fetchExcelDownload(normalizedBoardCode, keyword);
      const blob = new Blob([res.data], { type: res.headers['content-type'] });
      const rawHeader = res.headers['content-disposition'];
      const filename = (() => {
        if (!rawHeader) {
          return `${normalizedBoardCode}.xlsx`;
        }
        const utf8Match = rawHeader.match(/filename\*=UTF-8''([^;]+)/i);
        if (utf8Match?.[1]) {
          return decodeURIComponent(utf8Match[1]);
        }
        const fallbackMatch = rawHeader.match(/filename="?([^"]+)"?/i);
        return fallbackMatch?.[1] ? decodeURIComponent(fallbackMatch[1]) : `${normalizedBoardCode}.xlsx`;
      })();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('엑셀 다운로드 실패:', error);
      alert('엑셀 다운로드에 실패했습니다.');
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">{boardName} 관리</h2>

        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-700">총 {totalCount}건</span>
          <div className="flex gap-2">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setPage(0);
                  loadBoardList();
                }
              }}
              placeholder="검색어 입력"
              className="border px-3 py-2 rounded"
            />
            <button
              onClick={() => {
                setPage(0);
                loadBoardList();
              }}
              className="bg-gray-700 text-white px-4 rounded"
            >
              검색
            </button>
          </div>
        </div>

        <table className="w-full table-auto border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">No</th>
              <th className="border p-2">제목</th>
              <th className="border p-2">작성자</th>
              <th className="border p-2">등록일</th>
              <th className="border p-2">조회수</th>
              <th className="border p-2">사용 여부</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">데이터를 불러오는 중입니다...</td>
              </tr>
            ) : (
              <>
                {notices.map((notice) => (
                  <tr key={`notice-${notice.id}`} className="text-center hover:bg-gray-50 bg-yellow-50">
                    <td className="border p-2 text-rose-600 font-semibold">공지</td>
                    <td
                      className="border p-2 text-left text-blue-600 cursor-pointer hover:underline"
                      onClick={() => navigate(`/admin/board/${normalizedBoardCode}/detail/${notice.id}`)}
                    >
                      {notice.title}
                    </td>
                    <td className="border p-2">{notice.writerName || '-'}</td>
                    <td className="border p-2">{notice.regDate ? format(new Date(notice.regDate), 'yyyy-MM-dd') : '-'}</td>
                    <td className="border p-2">{notice.viewCount ?? 0}</td>
                    <td className="border p-2">
                      <button
                        onClick={() => handleToggleUseTf(notice)}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          notice.useTf === 'Y' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {notice.useTf === 'Y' ? '사용' : '미사용'}
                      </button>
                    </td>
                  </tr>
                ))}

                {boards.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">표시할 게시물이 없습니다.</td>
                  </tr>
                ) : (
                  boards.map((board, idx) => (
                    <tr key={board.id} className="text-center hover:bg-gray-50">
                      <td className="border p-2">{Math.max(totalCount - (page * size + idx), 0)}</td>
                      <td
                        className="border p-2 text-left text-blue-600 cursor-pointer hover:underline"
                        onClick={() => navigate(`/admin/board/${normalizedBoardCode}/detail/${board.id}`)}
                      >
                        {board.title}
                      </td>
                      <td className="border p-2">{board.writerName || '-'}</td>
                      <td className="border p-2">{board.regDate ? format(new Date(board.regDate), 'yyyy-MM-dd') : '-'}</td>
                      <td className="border p-2">{board.viewCount ?? 0}</td>
                      <td className="border p-2">
                        <button
                          onClick={() => handleToggleUseTf(board)}
                          className={`px-3 py-1 rounded text-xs font-medium ${
                            board.useTf === 'Y' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {board.useTf === 'Y' ? '사용' : '미사용'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </>
            )}
          </tbody>
        </table>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={handleExcelDownload} className="bg-green-600 text-white px-4 py-2 rounded">
            검색한 자료 엑셀로 받기
          </button>
          <button
            onClick={() => navigate(`/admin/board/${normalizedBoardCode}/write`)}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            등록
          </button>
        </div>

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </AdminLayout>
  );
};

export default BoardManager;