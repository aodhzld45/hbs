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
    const [boards, setBoards] = useState<BoardItem[]>([]);
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const safeBoardType = (boardType?.toUpperCase() ?? 'NOTICE') as BoardType;
    const loadBoardList = async () => {
        try {
            setIsLoading(true); //  로딩 시작

            const res = await fetchBoardList(safeBoardType, keyword, page, size);
            setBoards(res.items);
            setTotalCount(res.totalCount);
            setTotalPages(res.totalPages);

        } catch (err) {
            console.error('공지사항 조회 실패:', err);
            alert('공지사항 목록을 불러오지 못했습니다.');
        } finally {
            setIsLoading(false);  // 로딩 종료
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
    <Layout>
        <div className="w-full max-w-screen-xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-bold text-center mb-8 dark:text-gray-400">{BoardTypeTitleMap[safeBoardType]}</h1>

            <div className="flex justify-between mb-4">
                <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">전체 {totalCount}건</span>
                </div>
                <div className="flex gap-2">
                    <select className="border px-3 py-2 rounded text-sm">
                    <option>전체</option>
                    </select>
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
                        placeholder="검색어를 입력해주세요."
                        className="border px-3 py-2 rounded text-sm"
                    />
                    <button
                    onClick={() => {
                        setPage(0);
                        loadBoardList();
                    }}
                    className="bg-gray-700 text-white px-4 py-2 rounded text-sm"
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
            ) : boards.length === 0 ? (
                <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400 dark:text-gray-400">
                    표시할 게시물이 없습니다.
                </td>
                </tr>
            ) : (            
              boards.map((board, idx) => (
                <tr key={board.id} className="border-t hover:bg-gray-50 dark:text-gray-400">
                <td className="py-3">{Math.max(0, totalCount - (page * size + idx))}</td>

                <td
                    className="text-left px-6 py-3 text-blue-700 hover:underline cursor-pointer dark:text-yellow-400"
                    onClick={() =>
                    navigate(`/${boardType}/board-detail/${board.id}`)
                    }
                >
                    {board.title}
                </td>

                <td className="py-3">{board.writerName || '-'}</td>

                <td className="py-3">
                    {format(new Date(board.regDate), 'yyyy-MM-dd')}
                </td>

                <td className="py-3">{board.viewCount}</td>
                </tr>
                ))
             )}
            </tbody>
            </table>

            <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                className='dark:text-gray-400'
            />
        </div>
    </Layout>

    );
}

export default BoardList;
