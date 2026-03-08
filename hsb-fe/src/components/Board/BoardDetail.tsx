import { useEffect, useState } from 'react';
import Layout from '../Layout/Layout';
import { useNavigate, useParams } from 'react-router-dom';
import CommentSection from '../Common/CommentSection';
import { FILE_BASE_URL } from '../../config/config';
import { BoardItem, getBoardDisplayName } from '../../types/Admin/BoardItem';
import { BoardConfigItem } from '../../types/Admin/BoardConfigItem';
import { fetchBoardDetail } from '../../services/Admin/boardApi';
import { fetchBoardConfigByCode } from '../../services/Admin/boardConfigApi';

const BoardDetail = () => {
  const { boardCode = 'NOTICE', id } = useParams();
  const normalizedBoardCode = boardCode.toLowerCase();
  const navigate = useNavigate();
  const [board, setBoard] = useState<BoardItem | null>(null);
  const [boardConfig, setBoardConfig] = useState<BoardConfigItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      return;
    }

    const loadDetail = async () => {
      try {
        const data = await fetchBoardDetail(Number(id));
        setBoard(data);

        const detailBoardCode = (data.boardCode || normalizedBoardCode).toUpperCase();
        try {
          const config = await fetchBoardConfigByCode(detailBoardCode);
          setBoardConfig(config);
        } catch {
          setBoardConfig(null);
        }
      } catch (error) {
        console.error('게시글 상세 조회 실패:', error);
        alert('게시글을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [id, normalizedBoardCode]);

  if (loading) {
    return <div className="p-10 text-center text-gray-500">게시글을 불러오는 중입니다...</div>;
  }

  if (!board) {
    return <div className="p-10 text-center text-red-500">게시글이 존재하지 않습니다.</div>;
  }

  const effectiveBoardCode = (board.boardCode || normalizedBoardCode).toUpperCase();
  const boardName = getBoardDisplayName(effectiveBoardCode, boardConfig?.boardName ?? board.boardName);
  const canUseComment = boardConfig?.commentTf === 'Y';
  const isGallerySkin = boardConfig?.skinType === 'GALLERY';

  return (
    <Layout>
      <div className="w-full max-w-none px-4 py-10 text-gray-800 dark:text-gray-300">
        <div className="text-center text-sm text-gray-500 mb-2">{boardName}</div>
        <h1 className="text-4xl font-bold text-center mb-6 leading-snug text-gray-900 dark:text-white">{board.title}</h1>

        <div className="flex justify-center text-sm text-gray-500 dark:text-gray-400 mb-8 space-x-2">
          <span>{board.regDate ? new Date(board.regDate).toLocaleDateString() : '-'}</span>
          <span>|</span>
          <span>{board.writerName || '-'}</span>
          <span>|</span>
          <span>조회수 {board.viewCount ?? 0}</span>
        </div>

        <hr className="mb-6" />

        {isGallerySkin && (
          <div className="mb-8 overflow-hidden rounded-3xl bg-gray-100 dark:bg-gray-800">
            <img src={`${FILE_BASE_URL}${board.imagePath}`} alt={board.title} className="max-h-[560px] w-full object-cover" />
          </div>
        )}

        {board.hasFile && Array.isArray(board.files) && board.files.length > 0 && (
          <div className="mb-8">
            {board.files.map((file) => (
              <div key={file.id} className="flex items-center space-x-2 text-sm text-blue-700 dark:text-blue-400 mb-2">
                <a
                  href={`${FILE_BASE_URL}/api/file/download?filePath=${encodeURIComponent(file.filePath)}&originalName=${encodeURIComponent(file.originalFileName)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {file.originalFileName}
                </a>
              </div>
            ))}
          </div>
        )}

        <div className="prose prose-sm sm:prose lg:prose-lg max-w-none mb-10 dark:prose-invert" dangerouslySetInnerHTML={{ __html: board.content }} />

        {canUseComment && <CommentSection targetId={Number(id)} targetType={effectiveBoardCode} />}

        <div className="flex justify-end mt-10">
          <button
            onClick={() => navigate(`/${normalizedBoardCode}/board-list`)}
            className="bg-gray-800 text-white px-5 py-2 rounded hover:bg-gray-700"
          >
            목록으로
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default BoardDetail;
