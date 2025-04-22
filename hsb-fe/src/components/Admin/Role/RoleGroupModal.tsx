import React, { useEffect, useState } from 'react';
import { RoleGroup } from '../../../types/Admin/RoleGroup';

interface RoleGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RoleGroup) => void;
  onDelete: (id: number) => void; // 삭제 콜백 추가
  initialData?: RoleGroup | null;
}

const RoleGroupModal: React.FC<RoleGroupModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [useTf, setUseTf] = useState<'Y' | 'N'>('Y');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || '');
      setUseTf(initialData.useTf);
    } else {
      setName('');
      setDescription('');
      setUseTf('Y');
    }
  }, [initialData]);

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('권한 그룹명을 입력해주세요.');
      return;
    }

    const roleData: RoleGroup = {
      id: initialData?.id, // 수정일 경우 포함됨
      name,
      description,
      useTf,
    };

    onSubmit(roleData);
    onClose();
  };

  const handleDelete = () => {
    if (!initialData?.id) {
      alert("삭제할 대상이 없습니다.");
      return;
    }

    const confirmDelete = window.confirm("정말 삭제하시겠습니까?");
    if (!confirmDelete) return;

    onDelete(initialData.id); // ✅ props로 전달된 onDelete 실행
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">{initialData ? '권한 그룹 수정' : '권한 그룹 등록'}</h2>

        <div className="mb-4">
          <label className="block font-medium mb-1">그룹명</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            placeholder="예: 시스템 관리자"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            rows={3}
            placeholder="간단한 설명 입력"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">사용 여부</label>
          <select
            value={useTf}
            onChange={(e) => setUseTf(e.target.value as 'Y' | 'N')}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="Y">사용</option>
            <option value="N">미사용</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-700 rounded">
              취소
            </button>
            {initialData?.id && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                삭제
              </button>
            )}
            <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">
              저장
            </button>
        </div>
      </div>
    </div>
  );
};

export default RoleGroupModal;
