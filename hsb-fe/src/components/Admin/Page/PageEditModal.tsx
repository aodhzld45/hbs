// src/components/Admin/Page/PageModal.tsx
import React, { useState, useEffect } from 'react';

import { PageItem } from "../../../types/Admin/PageItem";
import { fetchPageCreate, fetchPageUpdate } from '../../../services/Admin/pageApi';
import { useAuth } from '../../../context/AuthContext';

type Props = {
  onClose: () => void;
  onSuccess: () => Promise<void>;
  initialData: PageItem | null;
}

const PageEditModal: React.FC<Props> = ({
     onClose,
     onSuccess,
    initialData 
}) => {
  const { admin } = useAuth();

  const [form, setForm] = useState<PageItem>({
    id: 0, 
    name: '',
    url: '',
    useTf: 'Y'
  });

  useEffect(() => {
    if (initialData) {
        setForm({
            ...initialData,
          });    }
  }, [initialData]);

  // 공통 입력 핸들러
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.url) {
        alert('페이지명과 URL을 입력해주세요');
        return;
    }

    if (!admin?.id) {
        alert('관리자 정보가 없습니다. 다시 로그인 해주세요.');
        return;
    }

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('url', form.url);
    formData.append('useTf', form.useTf);

    try {
        if (initialData) {
            // 수정
            await fetchPageUpdate(form.id, formData, admin.id);
            alert('페이지가 성공적으로 수정되었습니다.');
        }else {
            //등록
            await fetchPageCreate(formData, admin.id);
            alert('페이지가 성공적으로 등록되었습니다.');
        }
        await onSuccess();
        onClose();

    } catch (error) {
        console.error(error);
        alert('저장 실패!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">{initialData ? '페이지 수정' : '페이지 등록'}</h2>

        <label className="block mb-2 text-sm">페이지명</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="border px-3 py-2 mb-4 w-full"
        />

        <label className="block mb-2 text-sm">URL</label>
        <input
          name="url"
          value={form.url}
          onChange={handleChange}
          className="border px-3 py-2 mb-4 w-full"
        />

        <label className="block mb-2 text-sm">사용 여부</label>
        <select
          name="useTf"
          value={form.useTf}
          onChange={handleChange}
          className="border px-3 py-2 mb-4 w-full"
        >
          <option value="Y">Y</option>
          <option value="N">N</option>
        </select>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">취소</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageEditModal;
