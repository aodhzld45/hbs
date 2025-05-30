import React, { useEffect, useState } from 'react';
import Layout from '../Layout/Layout';
import { useNavigate, useParams } from 'react-router-dom';
import { BoardType, BoardItem, BoardFileItem, BoardTypeTitleMap } from '../../types/Admin/BoardItem';
import { fetchBoardDetail } from '../../services/Admin/boardApi';
import { FILE_BASE_URL } from '../../config/config';

import {
  fetchCommentList,
  fetchCommentCreate,
  fetchUpdateComment,
  fetchDeleteComment,
  fetchPasswordConfirm
} from '../../services/Common/CommentApi';
import { CommentItem } from '../../types/Common/CommentItem';
import PasswordModal from '../Common/PasswordModal';
import EditCommentModal from '../Common/EditCommentModal';

const BoardDetail = () => {
  const { boardType, id } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState<BoardItem | null>(null);
  const safeBoardType = (boardType?.toUpperCase() ?? 'NOTICE') as BoardType;
  const [loading, setLoading] = useState(true);

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentWriterName, setcommentWriterName] = useState('');
  const [password, setPassword] = useState('');

  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<'edit' | 'delete' | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editTargetComment, setEditTargetComment] = useState<CommentItem | null>(null);

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

  // 댓글 목록 불러오기
  useEffect(() => {
    const loadComments = async () => {
      try {
        if (id) {
          const res = await fetchCommentList('BOARD', Number(id));
          setComments(res);
        }
      } catch (err) {
        console.error('댓글 로딩 실패', err);
      }
    };

    loadComments();
  }, [id]);

  // 댓글 등록
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;

    try {
      await fetchCommentCreate({
        targetType: 'BOARD',
        targetId: Number(id),
        parentId: null,
        writerName: commentWriterName, // 사용자 이름
        password : password,
        content: newComment,
      });

      setNewComment('');
      const updated = await fetchCommentList('BOARD', Number(id));
      setComments(updated);
    } catch (err) {
      console.error('댓글 등록 실패', err);
      alert('댓글 등록 실패');
    }
  };

  const handleClickAction = (id: number, action: 'edit' | 'delete') => {
    setSelectedCommentId(id);
    setActionType(action);
    setShowPasswordModal(true);
  };
  
  const handlePasswordConfirm = async (password: string) => {
    if (!selectedCommentId || !actionType) return;
  
    try {
      // 비밀번호 검증
      const verified = await fetchPasswordConfirm(selectedCommentId, password);
      
      if (verified) {
        if (actionType === 'delete') {
          await fetchDeleteComment(selectedCommentId);
          const updated = await fetchCommentList('BOARD', Number(id));
          setComments(updated);
        } else if (actionType === 'edit') {
          const target = comments.find((c) => c.id === selectedCommentId);
          if (target) {
            setEditTargetComment(target);
            setShowEditModal(true);
          }
        }
      } else {
        alert('비밀번호가 일치하지 않습니다.');
      }
    } catch (err) {
      alert('댓글 등록시 비밀번호를 다시 확인해주세요.');
    } finally {
      setShowPasswordModal(false);
      setSelectedCommentId(null);
      setActionType(null);
    }
  };

  const handleSaveEditedComment = async (newContent: string) => {
    if (!editTargetComment) return;
  
    await fetchUpdateComment(editTargetComment.id, newContent);
    const updated = await fetchCommentList('BOARD', Number(id));
    setComments(updated);
    setShowEditModal(false);
    setEditTargetComment(null);
  };

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

        {/* 댓글 영역 */}
        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-2">💬 댓글</h3>

        {/* 댓글 입력창 */}
        <div className="mb-6 space-y-3">
          {/* 작성자 + 비밀번호 */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="작성자"
              className="border rounded px-3 py-2 text-sm sm:w-40 w-full"
              value={commentWriterName}
              onChange={(e) => setcommentWriterName(e.target.value)}
            />
            <input
              type="password"
              placeholder="비밀번호"
              className="border rounded px-3 py-2 text-sm sm:w-40 w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* 댓글 + 등록 버튼 */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="댓글을 입력하세요"
              className="border rounded px-3 py-2 text-sm flex-1 w-full"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button
              onClick={handleCommentSubmit}
              className="bg-blue-600 text-white px-4 py-2 rounded sm:w-auto w-full"
            >
              등록
            </button>
          </div>
        </div>

          {/* 댓글 목록 */}
          <ul className="space-y-2">
            {comments.length === 0 && (
              <li className="text-sm text-gray-500">댓글이 없습니다.</li>
            )}
            {comments.map((comment) => (
              <li key={comment.id} className="border border-gray-200 rounded px-4 py-2 text-sm bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="font-medium text-gray-700">{comment.writerName}</div>
                <div className="flex gap-2 text-xs">
                  <button onClick={() => handleClickAction(comment.id, 'edit')} className="text-blue-500 hover:underline">수정</button>
                  <button onClick={() => handleClickAction(comment.id, 'delete')} className="text-red-500 hover:underline">삭제</button>
                </div>
              </div>
              <div className="text-gray-800">{comment.content}</div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(comment.regDate).toLocaleString()}
              </div>
            </li>
            ))}
          </ul>
        </div>

        {showPasswordModal && actionType && (
          <PasswordModal
            action={actionType}
            onClose={() => setShowPasswordModal(false)}
            onConfirm={handlePasswordConfirm}
          />
        )}

        {showEditModal && editTargetComment && (
          <EditCommentModal
            initialContent={editTargetComment.content}
            onClose={() => setShowEditModal(false)}
            onSave={handleSaveEditedComment}
          />
        )}

        {/* 목록으로 */}
        <div className="flex justify-end">
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
