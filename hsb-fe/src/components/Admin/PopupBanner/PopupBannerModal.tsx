import React, { useEffect, useState } from 'react';
import { PopupBannerItem } from '../../../types/Admin/PopupBannerItem';
import {
  fetchPopupBannerCreate,
  fetchPopupBannerUpdate,
} from '../../../services/Admin/popupBannerApi';
import { useAuth } from '../../../context/AuthContext';

type Props = {
  onClose: () => void;
  onSuccess: () => Promise<void>;
  initialData: PopupBannerItem | null;
  type: string;
};

const PopupBannerModal: React.FC<Props> = ({
  onClose,
  onSuccess,
  initialData,
  type,
}) => {
  const { admin } = useAuth();

  const [form, setForm] = useState<PopupBannerItem>({
    id: 0,
    title: '',
    linkUrl: '',
    type: type,
    file: null,
    filePath: '',
    originalFileName: '',
    startDate: '',
    endDate: '',
    orderSeq: 0,
    useTf: 'Y',
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        file: null, // 초기 수정 시 기존 파일은 null (파일교체 안하면 기존 그대로 둠)
      });
    }
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

  // 파일 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({
        ...prev,
        file,
        originalFileName: file.name,
        filePath: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!admin?.id) {
      alert('관리자 정보가 없습니다. 다시 로그인 해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('linkUrl', form.linkUrl);
    formData.append('type', form.type);
    formData.append('startDate', form.startDate);
    formData.append('endDate', form.endDate);
    formData.append('useTf', form.useTf);
    formData.append('orderSeq', String(form.orderSeq));

    if (form.file) {
      formData.append('file', form.file);
    }

    try {
      if (initialData) {
        // 수정
        await fetchPopupBannerUpdate(form.id, formData, admin.id);
        alert('수정이 완료되었습니다.');
      } else {
        // 등록
        await fetchPopupBannerCreate(formData, admin.id);
        alert('등록이 완료되었습니다.');
      }
      await onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('저장 실패!');
    }
  };


  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded w-full max-w-lg">
      <h2 className="text-xl font-bold mb-4">
          {initialData
            ? type === "popup"
              ? "팝업 수정"
              : "배너 수정"
            : type === "popup"
              ? "팝업 등록"
              : "배너 등록"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
        {!initialData && (
            <div>
              <label className="block text-sm font-medium">팝업/배너 선택</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="border px-3 py-2 w-full"
              >
                <option value="">-- 선택 --</option>
                <option value="popup">팝업</option>
                <option value="banner">배너</option>
              </select>
            </div>
          )}

          {initialData && (
            <div>
              <label className="block text-sm font-medium">타입</label>
              <input
                type="text"
                name="type"
                value={form.type}
                disabled
                className="border px-3 py-2 w-full bg-gray-100"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium">제목</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="border px-3 py-2 w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">링크 URL</label>
            <input
              name="linkUrl"
              value={form.linkUrl}
              onChange={handleChange}
              className="border px-3 py-2 w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">노출 시작일</label>
            <input
              type="datetime-local"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className="border px-3 py-2 w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">노출 종료일</label>
            <input
              type="datetime-local"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              className="border px-3 py-2 w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">사용 여부</label>
            <select
              name="useTf"
              value={form.useTf}
              onChange={handleChange}
              className="border px-3 py-2 w-full"
            >
              <option value="Y">사용</option>
              <option value="N">미사용</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">파일 업로드</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="border px-3 py-2 w-full"
            />
            {form.originalFileName && (
              <p className="mt-2 text-sm text-gray-500">
                현재 파일: {form.originalFileName}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
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

export default PopupBannerModal;
