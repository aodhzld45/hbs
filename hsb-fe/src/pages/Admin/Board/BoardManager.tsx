import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../components/Layout/AdminLayout';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { BoardItem, BoardType, BoardTypeTitleMap } from '../../../types/Admin/BoardItem';
import { fetchBoardList } from '../../../services/Admin/boardApi';
import Pagination from '../../../components/Common/Pagination';

const BoardManager = () => {

    const navigate = useNavigate();
    const { boardType } = useParams();
    const [boards, setBoards] = useState<BoardItem[]>([]);
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(0);
    const [size] = useState(10); // 한 페이지에 보여줄 게시물 수 지정
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    // 소문자 파라미터를 BoardItem에 맞추어 대문자로 변경 ex) notice -> NOTICE
    const safeBoardType = (boardType?.toUpperCase() ?? 'NOTICE') as BoardType;

    useEffect(() => {
      console.log('현재 boardType:', boardType);
      console.log('safeBoardType (대문자):', safeBoardType);
    }, [boardType]);

    const loadBoardList = async () => {
        try {
            const res = await fetchBoardList(safeBoardType, keyword, page, size);
            setBoards(res.items);
            setTotalCount(res.totalCount);
            setTotalPages(res.totalPages);
            
        } catch (err) {
            console.error('공지사항 조회 실패:', err);
            alert('공지사항 목록을 불러오지 못했습니다.');
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
              <button           
                onClick={() => navigate(`/admin/board/${boardType}/write`)}
                className="bg-blue-600 text-white px-4 rounded"
              >
                등록
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
                <th className="border p-2">노출여부</th>
              </tr>
            </thead>
            <tbody>
              {boards.map((board, idx) => (
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
                    {board.useTf === 'Y' ? '보이기' : <span className="text-red-500">보이지 않기</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
    
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