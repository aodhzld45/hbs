import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {BoardType, BoardItem, BoardFileItem, BoardTypeTitleMap } from '../../../types/Admin/BoardItem';
import { fetchBoardDetail, fetchBoardDelete } from '../../../services/Admin/boardApi';
import AdminLayout from '../../../components/Layout/AdminLayout';
import { FILE_BASE_URL } from '../../../config/config';

const BoardDetail = () => {
  const navigate = useNavigate();
  const { boardType, id } = useParams();
  const [board, setBoard] = useState<BoardItem | null>(null);
  const [boardFile, setBoardFile] = useState<BoardFileItem | null>(null);
  const [loading, setLoading] = useState(true);

  const safeBoardType = (boardType?.toUpperCase() ?? 'NOTICE') as BoardType;

  useEffect(() => {
    const loadDetail = async () => {
      try {
        const data = await fetchBoardDetail(Number(id));
        setBoard(data);
      } catch (error) {
        alert('게시글을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (id) loadDetail();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await fetchBoardDelete(Number(id));
        alert('삭제되었습니다.');
        navigate(`/admin/board/${boardType}`);
      } catch (err) {
        alert('삭제 실패');
      }
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (!board) return <div>게시글이 존재하지 않습니다.</div>;

  return (
    <AdminLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">{BoardTypeTitleMap[safeBoardType]} 상세</h2>
        <table className="w-full table-fixed border border-gray-300 text-sm bg-white shadow rounded">
          <tbody>
            <tr className="border-b">
              <th className="w-40 p-2 bg-gray-100 text-left">제목</th>
              <td className="p-2">{board.title}</td>
            </tr>
            <tr className="border-b">
              <th className="p-2 bg-gray-100 text-left">작성자</th>
              <td className="p-2">{board.writerName}</td>
            </tr>
            <tr className="border-b">
              <th className="p-2 bg-gray-100 text-left">등록일</th>
              <td className="p-2">{new Date(board.regDate).toLocaleString()}</td>
            </tr>
            <tr className="border-b align-top">
              <th className="p-2 bg-gray-100 text-left">내용</th>
              <td className="p-2">
                <div dangerouslySetInnerHTML={{ __html: board.content }} />
              </td>
            </tr>
            {board.files && board.files.length > 0 && (
              <tr className="border-b">
                <th className="p-2 bg-gray-100 text-left">첨부파일</th>
                <td className="p-2">
                  <ul className="list-disc pl-4">
                    {board.files.map((file) => (
                      <li key={file.id}>
                        <a
                          href={`${FILE_BASE_URL}/api/file/download?filePath=${encodeURIComponent(file.filePath)}&originalName=${encodeURIComponent(file.originalFileName)}`}
                          className="text-blue-600 hover:underline"
                        >
                          📎 {file.originalFileName}
                        </a>
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="mt-6 flex gap-3">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={ () =>
              // React Router의 navigate(path, { state })를 활용하면, 페이지 전환 시 props처럼 데이터를 넘길 수 있음
              navigate(`/admin/board/${boardType}/edit/${id}`, { state: { board } })
            }
          >
            수정
          </button>
          <button
            className="bg-red-600 text-white px-4 py-2 rounded"
            onClick={handleDelete}
          >
            삭제
          </button>
          <button
            className="bg-gray-400 text-white px-4 py-2 rounded"
            onClick={() => navigate(`/admin/board/${safeBoardType}`)}
          >
            목록
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default BoardDetail;
