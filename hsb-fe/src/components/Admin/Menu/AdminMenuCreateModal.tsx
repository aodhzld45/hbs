// src/components/Admin/AdminMenuCreateModal.tsx
import React, { useState } from 'react';
import { AdminMenu } from '../../../types/Admin/AdminMenu';

interface AdminMenuCreateModalProps {
  onSave: (newMenu: AdminMenu) => void;
  onCancel: () => void;
}

const AdminMenuCreateModal: React.FC<AdminMenuCreateModalProps> = ({ onSave, onCancel }) => {
  const [menuData, setMenuData] = useState<AdminMenu>({
    name: '',
    url: '',
    orderSequence: 1,
    depth: 1,
    parentId: undefined,
    description: '',
    useTf: 'Y',
    delTf: 'N',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMenuData((prev) => ({
      ...prev,
      [name]:
        name === 'orderSequence' || name === 'depth'
          ? Number(value)
          : name === 'parentId'
          ? value === '' ? undefined : Number(value)
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(menuData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-bold mb-4">신규 메뉴 등록</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="메뉴 이름"
            value={menuData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded mb-2"
            required
          />
          <input
            type="text"
            name="url"
            placeholder="메뉴 URL"
            value={menuData.url}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded mb-2"
          />
          <input
            type="number"
            name="orderSequence"
            placeholder="순서"
            value={menuData.orderSequence}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded mb-2"
            required
          />
          <input
            type="number"
            name="depth"
            placeholder="뎁스 (예: 1)"
            value={menuData.depth}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded mb-2"
            required
          />
          <input
            type="text"
            name="parentId"
            placeholder="부모 메뉴 ID (없으면 비워두세요)"
            value={menuData.parentId ? menuData.parentId.toString() : ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded mb-2"
          />
          <textarea
            name="description"
            placeholder="메모 (옵션)"
            value={menuData.description}
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

export default AdminMenuCreateModal;
