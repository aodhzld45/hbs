import React, { useEffect, useState } from 'react';

// 관리자 정보 불러오기
import AdminLayout from "../../../components/Layout/AdminLayout";
import { useAuth } from '../../../context/AuthContext';

import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { BoardItem, BoardType, BoardTypeTitleMap } from '../../../types/Admin/BoardItem';
import { fetchBoardList, fetchExcelDownload, updateBoardUseTf } from '../../../services/Admin/boardApi';
import Pagination from '../../../components/Common/Pagination';


const BoardManager: React.FC = () => {

  const  admin  = useAuth();
  const [adminId, setAdminId] = useState(admin.admin?.id || null);
  
  const navigate = useNavigate();
  const { boardType } = useParams();
  const [notices, setNotices] = useState<BoardItem[]>([]);
  const [boards, setBoards] = useState<BoardItem[]>([]);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [size] = useState(10); // 한 페이지에 보여줄 게시물 수 지정
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 소문자 파라미터를 BoardItem에 맞추어 대문자로 변경 ex) notice -> NOTICE
  const safeBoardType = (boardType?.toUpperCase() ?? 'NOTICE') as BoardType;


  useEffect(() => {
    //console.log('현재 boardType:', boardType);
    //console.log('safeBoardType (대문자):', safeBoardType);
  }, [boardType]);

  const loadBoardList = async () => {
      try {
          setIsLoading(true); //  로딩 시작

          const res = await fetchBoardList(safeBoardType, keyword, page, size);
          setNotices(res.notices ?? []);   // 상단 공지
          setBoards(res.items ?? []);      // 일반 목록(공지 제외)
          setTotalCount(res.totalCount);
          setTotalPages(res.totalPages);
          
      } catch (err) {
          console.error('공지사항 조회 실패:', err);
          alert('공지사항 목록을 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);  // 로딩 종료
      }          
  };

    const handleToggleUseTf = async (board: BoardItem) => {
      try {
        const newUseTf = board.useTf === 'Y' ? 'N' : 'Y';

        if(!adminId) {
          alert('관리자 정보가 없습니다. 다시 로그인 해주세요.');
          return;
        }

        await updateBoardUseTf(board.id, newUseTf, adminId);
        alert('게시글 사용여부가 성공적으로 변경되었습니다.');
        await loadBoardList();
      } catch (error) {
        console.error('useTf 변경 실패:', error);
        alert('사용여부 변경에 실패했습니다.');
      }   
    };

    //엑셀 다운로드 핸들러
    const handleExcelDownload = async () => {
      try {
        const res = await fetchExcelDownload(safeBoardType, keyword);
    
        const blob = new Blob([res.data], {
          type: res.headers['content-type'],
        });
    
        //  Content-Disposition 헤더에서 filename 추출
        const rawHeader = res.headers['content-disposition'];
        const filename = (() => {
          if (!rawHeader) return 'download.xlsx';
    
          try {
            // 1. UTF-8 형식 우선
            const utf8Match = rawHeader.match(/filename\*=UTF-8''([^;]+)/i);
            if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1]);
    
            // 2. 일반 형식 fallback
            const fallbackMatch = rawHeader.match(/filename="?([^"]+)"?/);
            if (fallbackMatch?.[1]) return decodeURIComponent(fallbackMatch[1]);
    
          } catch (e) {
            console.warn(' 파일명 디코딩 실패:', e);
          }
    
          // 3. 최종 fallback – 이론상 거의 도달하지 않음
          return 'download.xlsx';
        })();
    
        //  다운로드 트리거
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
    
      } catch (err) {
        alert('엑셀 다운로드 실패');
        console.error(err);
      }
    };
    

    // 1. boardType이 변경될 때만 page 리셋
    useEffect(() => {
      setPage(0);
    }, [boardType]);

    // 2. page나 keyword, safeBoardType이 바뀔 때 목록 재조회
    useEffect(() => {
      loadBoardList();
    }, [boardType, page]);

      return (
       <AdminLayout> 
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">
            {BoardTypeTitleMap[safeBoardType] || '게시판'} 관리
          </h2>
    
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-700">총 {totalCount}개</span>
    
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
                <td colSpan={5} className="py-8 text-center text-gray-500">
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
                      className="text-center hover:bg-gray-50"
                    >
                      <td className="py-3 text-rose-600 font-semibold">공지</td>
                      <td
                        className="text-left px-6 py-3 cursor-pointer"
                        onClick={() => navigate(`/admin/board/${boardType}/detail/${n.id}`)}
                      >
                        <span className="inline-flex items-center gap-1 text-rose-600 font-semibold mr-2">
                          📌
                        </span>
                        <span className="text-blue-700 hover:underline dark:text-yellow-400">
                          {n.title}
                        </span>
                      </td>
                      <td className="border p-2">{n.writerName || '-'}</td>
                      <td className="border p-2">
                        {n.regDate ? format(new Date(n.regDate), 'yyyy-MM-dd') : '-'}
                      </td>
                      <td className="border p-2">{n.viewCount ?? 0}</td>
                      <td className="border p-2 text-sm">
                        <button
                            onClick={() => handleToggleUseTf(n)}
                            className={`px-3 py-1 rounded text-xs font-medium ${
                              n.useTf === 'Y'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-200 text-gray-600'
                            } hover:bg-green-200`}
                          >
                            {n.useTf === 'Y' ? '사용' : '미사용'}
                        </button>                  
                      </td>
                    </tr>
                  ))}

              {/*  일반 목록 */}
              {boards.length === 0 ? (
                <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">
                    표시할 게시물이 없습니다.
                </td>
                </tr>
            ) : (  
              boards.map((board, idx) => (
                <tr key={board.id} className="text-center hover:bg-gray-50">
                  <td className="border p-2">{totalCount - (page * size + idx)}</td>
                  <td
                    className="border p-2 text-left text-blue-600 cursor-pointer hover:underline"
                    onClick={() => navigate(`/admin/board/${boardType}/detail/${board.id}`)}
                  >
                    {board.title}
                  </td>
                  <td className="border p-2">{board.writerName || '-'}</td>
                  <td className="border p-2">
                    {format(new Date(board.regDate), 'yyyy-MM-dd')}
                  </td>
                  <td className="border p-2">{board.viewCount}</td>
                  <td className="border p-2 text-sm">
                    <button
                        onClick={() => handleToggleUseTf(board)}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          board.useTf === 'Y'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-200 text-gray-600'
                        } hover:bg-green-200`}
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
            <button
              onClick={handleExcelDownload}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              검색한 자료 엑셀로 받기
            </button>

            <button
              onClick={() => navigate(`/admin/board/${boardType}/write`)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              등록
            </button>
          </div>
    
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
        </AdminLayout>
      );
    };


export default BoardManager;