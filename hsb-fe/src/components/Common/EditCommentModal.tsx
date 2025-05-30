// src/components/Common/EditCommentModal.tsx
import React, { useState, useEffect } from 'react';

interface EditCommentModalProps {
  initialContent: string;
  onClose: () => void;
  onSave: (updatedContent: string) => void;
}

const EditCommentModal = ({ initialContent, onClose, onSave }: EditCommentModalProps) => {
  const [editedContent, setEditedContent] = useState(initialContent);

  useEffect(() => {
    setEditedContent(initialContent);
  }, [initialContent]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded shadow w-96">
        <h2 className="text-lg font-bold mb-4">✏️ 댓글 수정</h2>
        <textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm h-24"
        />
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-3 py-1 bg-gray-300 rounded">취소</button>
          <button
            onClick={() => onSave(editedContent)}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCommentModal;
