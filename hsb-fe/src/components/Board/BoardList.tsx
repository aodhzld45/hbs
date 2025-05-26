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
  
    const safeBoardType = (boardType?.toUpperCase() ?? 'NOTICE') as BoardType;

    console.log(boardType);
    console.log(safeBoardType);


    const loadBoardList = async () => {
        try {
            const res = await fetchBoardList(safeBoardType, keyword, page, size);
            setBoards(res.items);
            setTotalCount(res.totalCount);
            setTotalPages(res.totalPages);

            console.log('가져온 데이터 =', res);
            
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
    <Layout>
        <div className="w-full max-w-screen-xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-bold text-center mb-8">{BoardTypeTitleMap[safeBoardType]}</h1>

            <div className="flex justify-between mb-4">
                <div>
                    <span className="text-sm text-gray-600">전체 {totalCount}건</span>
                </div>
                <div className="flex gap-2">
                    <select className="border px-3 py-2 rounded text-sm">
                    <option>전체</option>
                    </select>
                    <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
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
            <thead className="bg-gray-50">
                <tr className="text-sm">
                <th className="py-3 w-[5%]">No.</th>
                <th className="py-3 px-4 w-[45%] text-center font-bold text-[15px] leading-snug text-gray-900">
                    제목
                </th>
                <th className="py-3 w-[15%]">작성자</th>
                <th className="py-3 w-[20%]">등록일</th>
                <th className="py-3 w-[10%]">조회수</th>
                </tr>
            </thead>
            <tbody>
            {boards.map((board, idx) => (
                <tr key={board.id} className="border-t hover:bg-gray-50">
                <td className="py-3">{Math.max(0, totalCount - (page * size + idx))}</td>

                <td
                    className="text-left px-6 py-3 text-blue-700 hover:underline cursor-pointer"
                    onClick={() =>
                    navigate(`/${boardType}/board-detail?id=${board.id}`)
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
            ))}
            </tbody>
            </table>

            <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            />
        </div>
    </Layout>

    );
}

export default BoardList;
