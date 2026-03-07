import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../../components/Layout/AdminLayout';
import { FILE_BASE_URL } from '../../../config/config';
import { BoardItem, getBoardDisplayName } from '../../../types/Admin/BoardItem';
import { fetchBoardDelete, fetchBoardDetail } from '../../../services/Admin/boardApi';

function isNoticeActive(noticeTf?: 'Y' | 'N', start?: string | null, until?: string | null): boolean {
  if (noticeTf !== 'Y') {
    return false;
  }
  const now = new Date();
  const startOk = !start || new Date(start) <= now;
  const endOk = !until || now <= new Date(until);
  return startOk && endOk;
}

const BoardDetail = () => {
  const navigate = useNavigate();
  const { boardCode = 'NOTICE', id } = useParams();
  const normalizedBoardCode = boardCode.toUpperCase();
  const [board, setBoard] = useState<BoardItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      return;
    }

    const loadDetail = async () => {
      try {
        const data = await fetchBoardDetail(Number(id));
        setBoard(data);
      } catch (error) {
        console.error('게시글 상세 조회 실패:', error);
        alert('게시글을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [id]);

  const handleDelete = async () => {
    if (!id) {
      return;
    }
    if (!window.confirm('정말 삭제하시겠습니까?')) {
      return;
    }
    try {
      await fetchBoardDelete(Number(id));
      alert('삭제되었습니다.');
      navigate(`/admin/board/${normalizedBoardCode}`);
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-500">로딩 중...</div>;
  }

  if (!board) {
    return <div className="p-10 text-center text-red-500">게시글이 존재하지 않습니다.</div>;
  }

  const boardName = getBoardDisplayName(board.boardCode, board.boardName);

  return (
    <AdminLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">{boardName} 상세</h2>
        <table className="w-full table-fixed border border-gray-300 text-sm bg-white shadow rounded">
          <tbody>
            <tr className="border-b">
              <th className="w-40 p-2 bg-gray-100 text-left">제목</th>
              <td className="p-2">{board.title}</td>
              <th className="w-40 p-2 bg-gray-100 text-left">공지 여부</th>
              <td className="p-2">
                {board.noticeTf === 'Y'
                  ? isNoticeActive(board.noticeTf, board.noticeStart, board.noticeEnd)
                    ? '공지(활성)'
                    : '공지(만료)'
                  : '일반글'}
              </td>
            </tr>
            <tr className="border-b">
              <th className="p-2 bg-gray-100 text-left">작성자</th>
              <td className="p-2">{board.writerName || '-'}</td>
              <th className="p-2 bg-gray-100 text-left">카테고리</th>
              <td className="p-2">{board.categoryCode || '-'}</td>
            </tr>
            <tr className="border-b">
              <th className="p-2 bg-gray-100 text-left">등록일</th>
              <td className="p-2">{board.regDate ? new Date(board.regDate).toLocaleString() : '-'}</td>
              <th className="p-2 bg-gray-100 text-left">조회수</th>
              <td className="p-2">{board.viewCount ?? 0}</td>
            </tr>
            <tr className="border-b">
              <th className="p-2 bg-gray-100 text-left">공지 설정</th>
              <td className="p-2" colSpan={3}>
                {board.noticeTf === 'Y' ? (
                  <div className="space-y-1">
                    <div>우선순위: <b>{board.noticeSeq ?? 0}</b></div>
                    <div>
                      노출 기간: <b>{board.noticeStart ? new Date(board.noticeStart).toLocaleString() : '상시'}</b>
                      {' ~ '}
                      <b>{board.noticeEnd ? new Date(board.noticeEnd).toLocaleString() : '상시'}</b>
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-500">일반글</span>
                )}
              </td>
            </tr>
            <tr className="border-b align-top">
              <th className="p-2 bg-gray-100 text-left">내용</th>
              <td className="p-2" colSpan={3}>
                <div dangerouslySetInnerHTML={{ __html: board.content }} />
              </td>
            </tr>
            {board.files && board.files.length > 0 && (
              <tr>
                <th className="p-2 bg-gray-100 text-left">첨부파일</th>
                <td className="p-2" colSpan={3}>
                  <ul className="list-disc pl-4">
                    {board.files.map((file) => (
                      <li key={file.id}>
                        <a
                          href={`${FILE_BASE_URL}/api/file/download?filePath=${encodeURIComponent(file.filePath)}&originalName=${encodeURIComponent(file.originalFileName)}`}
                          className="text-blue-600 hover:underline"
                        >
                          {file.originalFileName}
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
            onClick={() => navigate(`/admin/board/${normalizedBoardCode}/edit/${id}`, { state: { board } })}
          >
            수정
          </button>
          <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={handleDelete}>
            삭제
          </button>
          <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => navigate(`/admin/board/${normalizedBoardCode}`)}>
            목록
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default BoardDetail;
