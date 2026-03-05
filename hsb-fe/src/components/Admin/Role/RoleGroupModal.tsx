import React, { useEffect, useState } from 'react';
import { RoleGroup } from '../../../types/Admin/RoleGroup';
import { ToastType } from './Toast';

interface RoleGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RoleGroup) => void;
  onDelete: (id: number) => void;
  initialData?: RoleGroup | null;
  existingRoles?: RoleGroup[];
  showToast?: (message: string, type?: ToastType) => void;
  saving?: boolean;
}

const NAME_MAX = 50;
const DESC_MAX = 200;

const RoleGroupModal: React.FC<RoleGroupModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  initialData,
  existingRoles = [],
  showToast,
  saving = false,
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
  }, [initialData, isOpen]);

  const handleSubmit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      if (showToast) showToast('권한 그룹명을 입력해주세요.', 'error');
      else alert('권한 그룹명을 입력해주세요.');
      return;
    }
    if (trimmedName.length > NAME_MAX) {
      if (showToast) showToast(`그룹명은 ${NAME_MAX}자 이내로 입력해주세요.`, 'error');
      return;
    }
    const dup = existingRoles.find(
      (r) => r.name?.trim().toLowerCase() === trimmedName.toLowerCase() && r.id !== initialData?.id
    );
    if (dup) {
      if (showToast) showToast('이미 동일한 이름의 권한 그룹이 있습니다.', 'error');
      return;
    }

    const roleData: RoleGroup = {
      id: initialData?.id,
      name: trimmedName,
      description: description.trim().slice(0, DESC_MAX),
      useTf,
    };

    onSubmit(roleData);
    onClose();
  };

  const handleDelete = () => {
    if (!initialData?.id) {
      if (showToast) showToast('삭제할 대상이 없습니다.', 'error');
      return;
    }
    onDelete(initialData.id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? '권한 그룹 수정' : '권한 그룹 등록'}
        </h2>

        <div className="mb-4">
          <label className="block font-medium mb-1">그룹명</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, NAME_MAX))}
            className="w-full border px-3 py-2 rounded"
            placeholder="예: 시스템 관리자"
            maxLength={NAME_MAX}
          />
          <span className="text-xs text-gray-500">{name.length}/{NAME_MAX}</span>
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, DESC_MAX))}
            className="w-full border px-3 py-2 rounded"
            rows={3}
            placeholder="간단한 설명 입력"
            maxLength={DESC_MAX}
          />
          <span className="text-xs text-gray-500">{description.length}/{DESC_MAX}</span>
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

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            취소
          </button>
          {initialData?.id && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              삭제
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleGroupModal;
