// src/components/Admin/AdminMenuCreateModal.tsx
import React, { useState } from 'react';
import { AdminMenu } from '../../../types/Admin/AdminMenu';

interface AdminMenuCreateModalProps {
  onSave: (newMenu: AdminMenu) => void;
  onCancel: () => void;
}

const AdminMenuCreateModal: React.FC<AdminMenuCreateModalProps> = ({ onSave, onCancel }) => {
  const [menuData, setMenuData] = useState<AdminMenu>({
    id: 0,
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
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">신규 메뉴 등록</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 기본 정보 섹션 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">기본 정보</h3>

            <div className="mb-3">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                메뉴 이름 <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="예: 대시보드"
                value={menuData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded text-sm"
                required
              />
            </div>

            <div className="mb-1">
              <label
                htmlFor="url"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                메뉴 URL
              </label>
              <input
                id="url"
                type="text"
                name="url"
                placeholder="예: /admin/dashboard"
                value={menuData.url}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                라우팅용 경로입니다. 상위 메뉴(폴더형)라면 비워둘 수 있습니다.
              </p>
            </div>
          </div>

          {/* 계층/정렬 섹션 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">계층 &amp; 정렬 정보</h3>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label
                  htmlFor="orderSequence"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  노출 순서 <span className="text-red-500">*</span>
                </label>
                <input
                  id="orderSequence"
                  type="number"
                  name="orderSequence"
                  min={1}
                  placeholder="예: 1"
                  value={menuData.orderSequence}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded text-sm"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  숫자가 작을수록 메뉴 목록 상단에 노출됩니다.
                </p>
              </div>

              <div>
                <label
                  htmlFor="depth"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  뎁스(Depth) <span className="text-red-500">*</span>
                </label>
                <input
                  id="depth"
                  type="number"
                  name="depth"
                  min={1}
                  placeholder="예: 1"
                  value={menuData.depth}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded text-sm"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  1: 1차 메뉴, 2: 2차(하위) 메뉴, 3: 3차 메뉴 …
                </p>
              </div>
            </div>

            <div>
              <label
                htmlFor="parentId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                부모 메뉴 ID
              </label>
              <input
                id="parentId"
                type="text"
                name="parentId"
                placeholder="루트 메뉴면 비워두세요"
                value={menuData.parentId ? menuData.parentId.toString() : ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                2뎁스 이상인 경우, 상위 메뉴의 ID를 입력하세요. 루트 메뉴(1뎁스)는 비워둡니다.
              </p>
            </div>
          </div>

          {/* 메모 섹션 */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              메모 (옵션)
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="메뉴 용도나 비고 사항을 간단히 남길 수 있습니다."
              value={menuData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded text-sm min-h-[70px]"
            />
          </div>

          {/* 버튼 영역 */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
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
