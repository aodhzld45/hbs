// src/components/Admin/AdminAccountCreateModal.tsx
import React, { useState, useEffect } from 'react';
import { Admin } from '../../../types/Admin/Admin';
import { RoleGroup } from '../../../types/Admin/RoleGroup';

interface AdminAccountCreateModalProps {
  onSave: (newAdmin: Admin) => void;
  onCancel: () => void;
  initialData: Admin | null,
  roleGroups: RoleGroup[]; 
}

const AdminAccountCreateModal: React.FC<AdminAccountCreateModalProps> = ({ onSave, onCancel, roleGroups, initialData }) => {
  
  const [formData, setFormData] = useState<Admin>({
    id: '',
    name: '',
    email: '',
    password: '',
    tel: '',
    memo: '',
    groupId : 0,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'groupId' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (initialData) {
        // 수정
        onSave(formData);
      } else {
        // 등록
        onSave(formData);
      }
      onCancel(); // 저장 후 모달 닫기
    } catch (error) {
      console.error(error);
      alert('저장 실패!');
    }
  };



  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        password: '', // 수정 모드일 때 password 비워두기
      });
    }
  }, [initialData]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-bold mb-4">관리자 계정 {initialData ? '수정' : '등록'}
</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="id"
            placeholder="아이디"
            value={formData.id}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded mb-2"
            required
          />
          <input
            type="text"
            name="name"
            placeholder="이름"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded mb-2"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="이메일"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded mb-2"
            required
          />
          <input
            type="password"
            name="password"
            placeholder={initialData ? "새 비밀번호를 입력해주세요" : "비밀번호"}
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded mb-2"
            required={!initialData} // 수정 모드에서는 필수 아님
          />
          <input
            type="text"
            name="tel"
            placeholder="전화번호 (옵션)"
            value={formData.tel}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded mb-2"
          />
          <select
            name="groupId"
            value={formData.groupId ?? ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded mb-2"
            required
          >
            <option value="">권한 그룹 선택</option>
            {roleGroups.map(group => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          <textarea
            name="memo"
            placeholder="메모 (옵션)"
            value={formData.memo}
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
              {initialData ? '수정하기' : '등록하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAccountCreateModal;
