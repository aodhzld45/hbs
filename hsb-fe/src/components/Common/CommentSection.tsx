import React, { useState, useEffect } from 'react';
import { CommentItem } from '../../types/Common/CommentItem';
import {
  fetchCommentList,
  fetchCommentCreate,
  fetchUpdateComment,
  fetchDeleteComment,
  fetchPasswordConfirm
} from '../../services/Common/CommentApi';
import PasswordModal from './PasswordModal';
import EditCommentModal from './EditCommentModal';

interface CommentSectionProps {
  targetType: string;
  targetId: number;
}

  const CommentSection = ({ targetType, targetId }: CommentSectionProps) => {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentWriterName, setcommentWriterName] = useState('');
  const [password, setPassword] = useState('');

  // 대댓글 관련
  const [replyFormVisibleId, setReplyFormVisibleId] = useState<number | null>(null);
  const [replyWriterName, setReplyWriterName] = useState('');
  const [replyPassword, setReplyPassword] = useState('');
  const [replyContent, setReplyContent] = useState('');

  // 모달 관련
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<'edit' | 'delete' | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTargetComment, setEditTargetComment] = useState<CommentItem | null>(null);

  // 댓글 목록 불러오기
  useEffect(() => {
    const loadComments = async () => {
      try {
        if (targetId) {
          const res = await fetchCommentList(targetType, Number(targetId));
          setComments(res);
        }
      } catch (err) {
        console.error('댓글 로딩 실패', err);
      }
    };

    loadComments();
  }, [targetId, targetType]);

  // 댓글 등록
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;

    try {
      await fetchCommentCreate({
        targetType: targetType,
        targetId: Number(targetId),
        parentId: null,
        writerName: commentWriterName, // 사용자 이름
        password : password,
        content: newComment,
      });

      setNewComment('');
      const updated = await fetchCommentList(targetType, Number(targetId));
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
          const updated = await fetchCommentList(targetType, Number(targetId));
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
    const updated = await fetchCommentList(targetType, Number(targetId));
    setComments(updated);
    setShowEditModal(false);
    setEditTargetComment(null);
  };

    // 대댓글 트리구조 반영
    const topLevelComments = comments.filter(c => !c.parentId);
    const repliesMap = new Map<number, CommentItem[]>();

    comments.forEach(c => {
        if (c.parentId) {
        if (!repliesMap.has(c.parentId)) {
            repliesMap.set(c.parentId, []);
        }
        repliesMap.get(c.parentId)!.push(c);
        }
    });

    topLevelComments.forEach(c => {
        c.replies = repliesMap.get(c.id) ?? [];
    });
  
    const toggleReplyForm = (commentId: number) => {
      setReplyFormVisibleId(prev => (prev === commentId ? null : commentId));
    };
    
    const handleReplySubmit = async (parentId: number) => {
      await fetchCommentCreate({
        targetType: targetType,
        targetId: Number(targetId),
        parentId,
        writerName: replyWriterName,
        password: replyPassword,
        content: replyContent,
      });
    
      const updated = await fetchCommentList(targetType, Number(targetId));
      setComments(updated);
      setReplyWriterName('');
      setReplyPassword('');
      setReplyContent('');
      setReplyFormVisibleId(null);
    };

  return (
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
          {comments
            .filter(comment => comment.parentId === null)
            .map((comment) => (
              <li key={comment.id} className="border border-gray-200 rounded px-4 py-2 text-sm bg-gray-50">
                {/* 댓글 본문 */}
                <div className="flex justify-between items-center">
                  <div className="font-medium text-gray-700">{comment.writerName}</div>
                  <div className="flex gap-2 text-xs">
                    <button onClick={() => handleClickAction(comment.id, 'edit')} className="text-blue-500 hover:underline">수정</button>
                    <button onClick={() => handleClickAction(comment.id, 'delete')} className="text-red-500 hover:underline">삭제</button>
                    <button onClick={() => toggleReplyForm(comment.id)} className="text-gray-500 hover:underline">답글</button>
                  </div>
                </div>
                <div className="text-gray-800">{comment.content}</div>
                <div className="text-xs text-gray-400 mt-1">{new Date(comment.regDate).toLocaleString()}</div>

                {/* 답글 입력창 (대댓글) */}
                {replyFormVisibleId === comment.id && (
                  <div className="mt-3 pl-4 border-l border-gray-300">
                    <div className="flex flex-col sm:flex-row gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="작성자"
                        className="border rounded px-3 py-1 text-sm sm:w-40 w-full"
                        value={replyWriterName}
                        onChange={(e) => setReplyWriterName(e.target.value)}
                      />
                      <input
                        type="password"
                        placeholder="비밀번호"
                        className="border rounded px-3 py-1 text-sm sm:w-40 w-full"
                        value={replyPassword}
                        onChange={(e) => setReplyPassword(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="답글을 입력하세요"
                        className="border rounded px-3 py-1 text-sm flex-1"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                      />
                      <button
                        onClick={() => handleReplySubmit(comment.id)}
                        className="bg-blue-500 text-white px-4 py-1 rounded sm:w-auto w-full"
                      >
                        답글등록
                      </button>
                    </div>
                  </div>
                )}

                {/* 대댓글 목록 */}
                {comments
                  .filter(reply => reply.parentId === comment.id)
                  .map((reply) => (
                    <div key={reply.id} className="mt-3 pl-6 border-l border-gray-200 bg-gray-100 rounded px-3 py-2">
                      <div className="flex justify-between items-center">
                        <div className="font-medium text-gray-600">{reply.writerName}</div>
                        <div className="flex gap-2 text-xs">
                          <button onClick={() => handleClickAction(reply.id, 'edit')} className="text-blue-500 hover:underline">수정</button>
                          <button onClick={() => handleClickAction(reply.id, 'delete')} className="text-red-500 hover:underline">삭제</button>
                        </div>
                      </div>
                      <div className="text-gray-700">{reply.content}</div>
                      <div className="text-xs text-gray-400 mt-1">{new Date(reply.regDate).toLocaleString()}</div>
                    </div>
                  ))}
              </li>
            ))}
        </ul>
      {/* 모달 처리 */}
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
    </div>
  );
};

export default CommentSection;
