// src/components/Admin/AdminAccountEditModal.tsx
import React, { useState } from 'react';
import { Admin } from '../../../types/Admin/Admin';

interface AdminAccountEditModalProps {
  admin: Admin;
  onSave: (updatedAdmin: Admin) => void;
  onCancel: () => void;
}

const AdminAccountEditModal: React.FC<AdminAccountEditModalProps> = ({ admin, onSave, onCancel }) => {
  // 초기값은 전달받은 admin 객체를 복사하여 사용
  const [editedAdmin, setEditedAdmin] = useState<Admin>({ ...admin });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedAdmin((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedAdmin);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-bold mb-4">관리자 계정 수정</h2>
        <form onSubmit={handleSubmit}>
          {/* ID는 수정 불가 */}
          <input
            type="text"
            name="id"
            value={editedAdmin.id}
            readOnly
            className="w-full px-3 py-2 border rounded mb-2 bg-gray-100"
          />
          <input
            type="text"
            name="name"
            placeholder="이름"
            value={editedAdmin.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded mb-2"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="이메일"
            value={editedAdmin.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded mb-2"
            required
          />
          <input
            type="text"
            name="tel"
            placeholder="전화번호 (옵션)"
            value={editedAdmin.tel || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded mb-2"
          />
          <textarea
            name="memo"
            placeholder="메모 (옵션)"
            value={editedAdmin.memo || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded mb-4"
          ></textarea>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAccountEditModal;
