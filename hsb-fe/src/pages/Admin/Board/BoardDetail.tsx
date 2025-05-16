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
        navigate(`/admin/board/${safeBoardType}`);
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
      <div className="border p-4 space-y-2 bg-white rounded shadow">
        <div><strong>제목:</strong> {board.title}</div>
        <div><strong>작성자:</strong> {board.writerName}</div>
        <div><strong>등록일:</strong> {new Date(board.regDate).toLocaleDateString()}</div>
        <div><strong>본문:</strong><div dangerouslySetInnerHTML={{ __html: board.content }} /></div>
        {board.files && board.files.length > 0 && (
          <div>
            <strong>첨부파일:</strong>
            <ul>
              {board.files.map(file => (
                <li key={file.id}>
                <a
                href={`${FILE_BASE_URL}/api/file/download?filePath=${encodeURIComponent(file.filePath)}&originalName=${encodeURIComponent(file.originalFileName)}`}
                className="text-blue-500 hover:underline"
                >
                📎 {file.originalFileName}
                </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => navigate(`/admin/board/${safeBoardType}/edit/${id}`)}
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
