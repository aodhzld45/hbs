// src/components/Admin/AdminMenuEditModal.tsx
import React, { useState } from 'react';
import { AdminMenu } from '../../../types/Admin/AdminMenu';

interface AdminMenuEditModalProps {
  menu: AdminMenu;
  onSave: (updatedMenu: AdminMenu) => void;
  onCancel: () => void;
}

const AdminMenuEditModal: React.FC<AdminMenuEditModalProps> = ({ menu, onSave, onCancel }) => {
  // 초기 상태는 props.menu를 복사하여 생성
  const [editedMenu, setEditedMenu] = useState<AdminMenu>({ ...menu });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedMenu((prev) => ({
      ...prev,
      [name]:
        name === 'depth' || name === 'orderSequence'
          ? Number(value)
          : name === 'parentId'
          ? value === '' ? undefined : Number(value)
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedMenu);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-bold mb-4">메뉴 수정</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="메뉴 이름"
            value={editedMenu.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded mb-2"
            required
          />
          <input
            type="text"
            name="url"
            placeholder="메뉴 URL"
            value={editedMenu.url}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded mb-2"
          />
          <input
            type="number"
            name="orderSequence"
            placeholder="순서"
            value={editedMenu.orderSequence}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded mb-2"
            required
          />
          <input
            type="number"
            name="depth"
            placeholder="뎁스"
            value={editedMenu.depth}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded mb-2"
            required
          />
          <input
            type="text"
            name="parentId"
            placeholder="부모 메뉴 ID (없으면 비워두세요)"
            value={editedMenu.parentId ? editedMenu.parentId.toString() : ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded mb-2"
          />
          <textarea
            name="description"
            placeholder="메모 (옵션)"
            value={editedMenu.description}
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

export default AdminMenuEditModal;
