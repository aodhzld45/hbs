// src/components/Common/PasswordModal.tsx
import React, { useState } from 'react';

interface PasswordModalProps {
  onClose: () => void;
  onConfirm: (password: string) => void;
  action: 'edit' | 'delete';
}

const PasswordModal = ({ onClose, onConfirm, action }: PasswordModalProps) => {
  const [inputPassword, setInputPassword] = useState('');

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded shadow w-80">
        <h2 className="text-lg font-bold mb-4">🔐 댓글 {action === 'edit' ? '수정' : '삭제'} 확인</h2>
        <input
          type="password"
          className="w-full border px-3 py-2 rounded mb-4"
          placeholder="비밀번호 입력"
          value={inputPassword}
          onChange={(e) => setInputPassword(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 bg-gray-300 rounded">취소</button>
          <button onClick={() => onConfirm(inputPassword)} className="px-3 py-1 bg-blue-600 text-white rounded">확인</button>
        </div>
      </div>
    </div>
  );
};

export default PasswordModal;
