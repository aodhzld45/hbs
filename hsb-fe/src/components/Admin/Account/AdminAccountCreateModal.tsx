// src/components/Admin/AdminAccountCreateModal.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Admin } from '../../../types/Admin/Admin';
import { RoleGroup } from '../../../types/Admin/RoleGroup';

interface AdminAccountCreateModalProps {
  onSave: (newAdmin: Admin) => void;
  onCancel: () => void;
  initialData: Admin | null;
  roleGroups: RoleGroup[];
}

const STATUSES = [
  { value: 'ACTIVE', label: '활성' },
  { value: 'LOCKED', label: '잠금' },
  { value: 'SUSPENDED', label: '정지' },
] as const;

const AdminAccountCreateModal: React.FC<AdminAccountCreateModalProps> = ({
  onSave,
  onCancel,
  roleGroups,
  initialData
}) => {
  const isEdit = !!initialData;

  const [formData, setFormData] = useState<Admin>({
    id: '',
    name: '',
    email: '',
    password: '',
    tel: '',
    memo: '',
    groupId: 0,
    status: 'ACTIVE', // 기본값
  });

  // 읽기전용 정보 (수정 모드에서만 보여줌)
  const lastInfo = useMemo(() => {
    if (!initialData) return null;
    return {
      lastLoginAt: initialData.loggedAt ?? '',
      lastLoginIp: initialData.lastLoginIp ?? '',
      lastLoginDevice: initialData.lastLoginDevice ?? '',
      lastLoginLocation: initialData.lastLoginLocation ?? '',
      createdBy: initialData.createdBy ?? '',
      updatedBy: initialData.updatedBy ?? '',
    };
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]:
        name === 'groupId'
          ? (value === '' ? undefined : Number(value))
          : value,
    }));
  };

  const handleSubmit =  async (e: React.FormEvent) => {
    e.preventDefault();

    // 간단 유효성
    if (!formData.id?.trim()) return alert('아이디를 입력해주세요.');
    if (!formData.name?.trim()) return alert('이름을 입력해주세요.');
    if (!formData.email?.trim()) return alert('이메일을 입력해주세요.');
    if (!isEdit && !formData.password?.trim()) return alert('비밀번호를 입력해주세요.');
    if (!formData.groupId) return alert('권한 그룹을 선택해주세요.');
    if (!formData.status) return alert('계정 상태를 선택해주세요.');

    // 생성/수정 공통: 불필요 시스템 필드 제거하여 전송(백엔드가 관리)
    const payload: Admin = {
      id: formData.id.trim(),
      name: formData.name?.trim(),
      email: formData.email?.trim(),
      password: formData.password?.trim() || undefined,
      tel: formData.tel?.trim(),
      memo: formData.memo?.trim(),
      groupId: formData.groupId,
      status: formData.status,
      // 아래 필드는 서버가 관리 → 보내지 않음
      // lastLoginIp, lastLoginDevice, lastLoginLocation, createdBy, updatedBy, deletedAt, loggedAt 등
    };

    try {
      await onSave(payload);       
      onCancel(); // 저장 후 모달 닫기
    } catch (err) {
      console.error(err);
      return; // 실패 시 모달 닫지 않음
    }
  };

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        password: '', // 수정 모드에서는 비밀번호 공란
        groupId: initialData.groupId ?? 0,
        status: initialData.status ?? 'ACTIVE',
      }));
    } else {
      // 생성 초기화
      setFormData({
        id: '',
        name: '',
        email: '',
        password: '',
        tel: '',
        memo: '',
        groupId: 0,
        status: 'ACTIVE',
      });
    }
  }, [initialData]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          관리자 계정 {isEdit ? '수정' : '등록'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="text"
            name="id"
            placeholder="아이디"
            value={formData.id}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
            disabled={isEdit} // 수정 모드에서는 아이디 변경 불가
          />

          <input
            type="text"
            name="name"
            placeholder="이름"
            value={formData.name ?? ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="이메일"
            value={formData.email ?? ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />

          <input
            type="password"
            name="password"
            placeholder={isEdit ? '새 비밀번호 (변경 시에만 입력)' : '비밀번호'}
            value={formData.password ?? ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required={!isEdit}
          />

          <input
            type="text"
            name="tel"
            placeholder="전화번호 (옵션)"
            value={formData.tel ?? ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />

          <select
            name="groupId"
            value={formData.groupId ?? ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          >
            <option value="">권한 그룹 선택</option>
            {roleGroups.map(group => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>

          {/* 계정 상태 선택 */}
          <select
            name="status"
            value={formData.status ?? 'ACTIVE'}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          >
            {STATUSES.map(s => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <textarea
            name="memo"
            placeholder="메모 (옵션)"
            value={formData.memo ?? ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            rows={3}
          />

          {/* 수정 모드: 읽기 전용 최근 접속/감사 정보 */}
          {isEdit && lastInfo && (
            <div className="mt-3 p-3 border rounded bg-gray-50 text-sm">
              <div className="font-semibold mb-1">최근 접속 정보</div>
              <div className="grid grid-cols-1 gap-1">
                <div>마지막 로그인 일시: {lastInfo.lastLoginAt || '-'}</div>
                <div>마지막 로그인 IP: {lastInfo.lastLoginIp || '-'}</div>
                <div>기기(User-Agent): {lastInfo.lastLoginDevice || '-'}</div>
                <div>위치: {lastInfo.lastLoginLocation || '-'}</div>
              </div>
              <div className="mt-2 text-gray-500">
                생성자: {lastInfo.createdBy || '-'} / 수정자: {lastInfo.updatedBy || '-'}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-2">
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
              {isEdit ? '수정하기' : '등록하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAccountCreateModal;
