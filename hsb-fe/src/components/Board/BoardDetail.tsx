import React, { useEffect, useState } from 'react';
import Layout from '../Layout/Layout';
import { useNavigate, useParams } from 'react-router-dom';
import { BoardType, BoardItem, BoardFileItem, BoardTypeTitleMap } from '../../types/Admin/BoardItem';
import { fetchBoardDetail } from '../../services/Admin/boardApi';
import { FILE_BASE_URL } from '../../config/config';
import CommentSection from '../Common/CommentSection';

const BoardDetail = () => {
  const { boardType, id } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState<BoardItem | null>(null);
  const safeBoardType = (boardType?.toUpperCase() ?? 'NOTICE') as BoardType;
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">
        게시글을 불러오는 중입니다...
      </div>
    );
  }

  if (!board) {
    return (
      <div className="p-10 text-center text-red-500">
        게시글이 존재하지 않습니다.
      </div>
    );
  }

  return (
    <Layout>  
      <div className="w-full max-w-none px-4 py-10 text-gray-800">
        {/* 제목 */}
        <h1 className="text-4xl font-bold text-center mb-6 leading-snug">
          {board.title}
        </h1>
  
        {/* 작성 정보 */}
        <div className="flex justify-center text-sm text-gray-500 mb-8 space-x-2">
          <span>{new Date(board.regDate).toLocaleDateString()}</span>
          <span>•</span>
          <span>{board.writerName}</span>
          <span>•</span>
          <span>조회수: {board.viewCount}</span>
        </div>
  
        <hr className="mb-6" />
  
        {/* 첨부파일 */}
        {board.hasFile && Array.isArray(board.files) && board.files.length > 0 && (
          <div className="mb-8">
            {board.files.map((file) => (
              <div
                key={file.id}
                className="flex items-center space-x-2 text-sm text-blue-700 mb-2"
              >
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M8.5 3a1 1 0 00-1 1v8.586l-1.793-1.793a1 1 0 00-1.414 1.414l3.5 3.5a1 1 0 001.414 0l3.5-3.5a1 1 0 00-1.414-1.414L9.5 12.586V4a1 1 0 00-1-1z" />
                </svg>
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
  
        {/* 본문 */}
        <div
          className="prose prose-sm sm:prose lg:prose-lg max-w-none mb-10"
          dangerouslySetInnerHTML={{ __html: board.content }}
        />

        {/* 댓글 영역  */}
        <CommentSection targetId={Number(id)} targetType={safeBoardType} />      
        {/* 목록으로 */}
        <div className="flex justify-end mt-10">
          <button
            onClick={() => navigate(`/${boardType}/board-list`)}
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
