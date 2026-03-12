import Layout from '../Layout/Layout';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import Pagination from '../Common/Pagination';
import { BoardItem, getBoardDisplayName } from '../../types/Admin/BoardItem';
import { BoardConfigItem } from '../../types/Admin/BoardConfigItem';
import { fetchBoardList } from '../../services/Admin/boardApi';
import { fetchBoardConfigByCode } from '../../services/Admin/boardConfigApi';
import { FILE_BASE_URL } from '../../config/config';
import PageLoader from '../../features/common/PageLoader';

const BoardList = () => {
  const { boardCode = 'NOTICE' } = useParams();
  const normalizedBoardCode = boardCode.toLowerCase();
  const navigate = useNavigate();

  const [boardName, setBoardName] = useState<string>(normalizedBoardCode);
  const [boardConfig, setBoardConfig] = useState<BoardConfigItem | null>(null);
  const [notices, setNotices] = useState<BoardItem[]>([]);
  const [boards, setBoards] = useState<BoardItem[]>([]);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBoardConfigByCode(normalizedBoardCode)
      .then((config) => {
        setBoardConfig(config);
        setBoardName(config.boardName);
      })
      .catch(() => {
        setBoardConfig(null);
        setBoardName(getBoardDisplayName(normalizedBoardCode));
      });
  }, [normalizedBoardCode]);

  const loadBoardList = useCallback(async () => {
    try {
      const res = await fetchBoardList(normalizedBoardCode, keyword, page, size, 'Y');
      setNotices(res.notices ?? []);
      setBoards(res.items ?? []);
      setTotalCount(res.totalCount);
      setTotalPages(res.totalPages);
      const representative = res.notices[0] ?? res.items[0];
      if (representative) {
        setBoardName(getBoardDisplayName(representative.boardCode, representative.boardName));
      }

      setIsLoading(false);

    } catch (error) {
      console.error('게시글 목록 조회 실패:', error);
      alert('게시글 목록을 불러오지 못했습니다.');
    } finally {
    }
  }, [keyword, normalizedBoardCode, page, size]);

  useEffect(() => {
    setPage(0);
  }, [normalizedBoardCode]);

  useEffect(() => {
    loadBoardList();
  }, [loadBoardList]);

  const isGallerySkin = boardConfig?.skinType === 'GALLERY';

  const renderGalleryCard = (board: BoardItem, emphasized = false) => {
    const imageSrc = `${FILE_BASE_URL}${board.imagePath}`;

    return (
      <button
        key={`${emphasized ? 'notice' : 'board'}-${board.id}`}
        type="button"
        onClick={() => navigate(`/${normalizedBoardCode}/board-detail/${board.id}`)}
        className={`group overflow-hidden rounded-2xl border text-left transition hover:-translate-y-1 hover:shadow-lg ${
          emphasized
            ? 'border-amber-300 bg-amber-50/70 dark:border-amber-700 dark:bg-amber-900/20'
            : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'
        }`}
      >
        <div className="aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={board.title}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400 dark:text-gray-500">
              No Image
            </div>
          )}
        </div>
        <div className="space-y-3 p-5">
          <div className="flex items-center justify-between gap-3">
            {emphasized && (
              <span className="inline-flex rounded-full bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white">
                공지
              </span>
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {board.regDate ? format(new Date(board.regDate), 'yyyy-MM-dd') : '-'}
            </span>
          </div>
          <h2 className="line-clamp-2 text-lg font-semibold text-gray-900 group-hover:text-blue-700 dark:text-gray-100 dark:group-hover:text-yellow-400">
            {board.title}
          </h2>
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{board.writerName || '-'}</span>
            <span>조회수 {board.viewCount ?? 0}</span>
          </div>
        </div>
      </button>
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <PageLoader message="데이터를 불러오는 중입니다." />
      </Layout>
    )
  }

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

        {isGallerySkin ? (
          <>
            {isLoading ? (
              <div className="rounded-2xl border border-dashed py-16 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
                데이터를 불러오는 중입니다...
              </div>
            ) : (
              <div className="space-y-10">
                {notices.length > 0 && (
                  <section className="space-y-4">
                    <div className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">
                      Notice
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                      {notices.map((notice) => renderGalleryCard(notice, true))}
                    </div>
                  </section>
                )}

                {boards.length === 0 ? (
                  <div className="rounded-2xl border border-dashed py-16 text-center text-gray-400 dark:border-gray-700 dark:text-gray-500">
                    표시할 게시물이 없습니다.
                  </div>
                ) : (
                  <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {boards.map((board) => renderGalleryCard(board))}
                  </section>
                )}
              </div>
            )}
          </>
        ) : (
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
        )}

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} className="dark:text-gray-400" />
      </div>
    </Layout>
  );
};

export default BoardList;
