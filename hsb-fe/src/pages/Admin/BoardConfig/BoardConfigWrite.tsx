import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../../components/Layout/AdminLayout';
import { BoardConfigItem } from '../../../types/Admin/BoardConfigItem';
import { createBoardConfig, fetchBoardConfigDetail, updateBoardConfig } from '../../../services/Admin/boardConfigApi';
import { useAuth } from '../../../context/AuthContext';

const emptyForm: Partial<BoardConfigItem> = {
  boardCode: '',
  boardName: '',
  boardDesc: '',
  menuPath: '',
  skinType: 'LIST',
  listSize: 10,
  sortSeq: 0,
  commentTf: 'Y',
  fileTf: 'Y',
  noticeTf: 'N',
  thumbnailTf: 'N',
  periodTf: 'N',
  secretTf: 'N',
  replyTf: 'N',
  categoryTf: 'N',
  categoryMode: 'NONE',
  categoryJson: '',
  editorTf: 'Y',
  readRole: 'PUBLIC',
  writeRole: 'ADMIN',
  updateRole: 'ADMIN',
  deleteRole: 'ADMIN',
  useTf: 'Y',
};

const yesNoOptions: Array<'Y' | 'N'> = ['Y', 'N'];

const BoardConfigWrite: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { admin } = useAuth();
  const isEdit = Boolean(id);
  const [form, setForm] = useState<Partial<BoardConfigItem>>(emptyForm);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit || !id) {
      return;
    }

    fetchBoardConfigDetail(Number(id))
      .then((data) => setForm({ ...data, categoryJson: data.categoryJson ?? '' }))
      .catch((error) => {
        console.error('게시판 설정 상세 조회 실패:', error);
        alert('게시판 설정을 불러오지 못했습니다.');
      })
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = <K extends keyof BoardConfigItem>(key: K, value: BoardConfigItem[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const adminId = admin?.id;
    if (!adminId) {
      alert('관리자 정보가 없습니다.');
      return;
    }
    if (!form.boardCode?.trim() || !form.boardName?.trim()) {
      alert('게시판 코드와 게시판명은 필수입니다.');
      return;
    }

    const payload: Partial<BoardConfigItem> = {
      ...form,
      boardCode: form.boardCode.trim().toUpperCase(),
      categoryMode: form.categoryTf === 'Y' ? form.categoryMode || 'SINGLE' : 'NONE',
      categoryJson: form.categoryTf === 'Y' ? form.categoryJson || '[]' : null,
    };

    try {
      if (isEdit && id) {
        await updateBoardConfig(Number(id), payload, adminId);
      } else {
        await createBoardConfig(payload, adminId);
      }
      navigate('/admin/board-config');
    } catch (error) {
      console.error('게시판 설정 저장 실패:', error);
      alert('게시판 설정 저장에 실패했습니다.');
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-500">로딩 중...</div>;
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">게시판 설정 {isEdit ? '수정' : '등록'}</h2>
        <form onSubmit={handleSubmit} className="space-y-6 border p-6 bg-white rounded shadow">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">게시판 코드</label>
              <input
                type="text"
                value={form.boardCode ?? ''}
                onChange={(e) => handleChange('boardCode', e.target.value)}
                className="w-full border px-3 py-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">게시판명</label>
              <input
                type="text"
                value={form.boardName ?? ''}
                onChange={(e) => handleChange('boardName', e.target.value)}
                className="w-full border px-3 py-2 rounded"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block font-semibold mb-1">설명</label>
              <textarea
                value={form.boardDesc ?? ''}
                onChange={(e) => handleChange('boardDesc', e.target.value)}
                className="w-full border px-3 py-2 rounded"
                rows={3}
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">메뉴 경로</label>
              <input
                type="text"
                value={form.menuPath ?? ''}
                onChange={(e) => handleChange('menuPath', e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">스킨</label>
              <select
                value={form.skinType ?? 'LIST'}
                onChange={(e) => handleChange('skinType', e.target.value)}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="LIST">LIST</option>
                <option value="GALLERY">GALLERY</option>
                <option value="FAQ">FAQ</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">기본 목록 수</label>
              <input
                type="number"
                value={form.listSize ?? 10}
                onChange={(e) => handleChange('listSize', Number(e.target.value))}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">정렬 순서</label>
              <input
                type="number"
                value={form.sortSeq ?? 0}
                onChange={(e) => handleChange('sortSeq', Number(e.target.value))}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              ['commentTf', '댓글'],
              ['fileTf', '첨부파일'],
              ['noticeTf', '공지'],
              ['thumbnailTf', '썸네일'],
              ['periodTf', '기간'],
              ['secretTf', '비밀글'],
              ['replyTf', '답글'],
              ['categoryTf', '카테고리'],
              ['editorTf', '에디터'],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="block font-semibold mb-1">{label}</label>
                <select
                  value={(form[key as keyof BoardConfigItem] as 'Y' | 'N' | undefined) ?? 'N'}
                  onChange={(e) => handleChange(key as keyof BoardConfigItem, e.target.value as never)}
                  className="w-full border px-3 py-2 rounded"
                >
                  {yesNoOptions.map((value) => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {form.categoryTf === 'Y' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">카테고리 선택 방식</label>
                <select
                  value={form.categoryMode ?? 'SINGLE'}
                  onChange={(e) => handleChange('categoryMode', e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="SINGLE">SINGLE</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block font-semibold mb-1">카테고리 JSON</label>
                <textarea
                  value={form.categoryJson ?? ''}
                  onChange={(e) => handleChange('categoryJson', e.target.value)}
                  className="w-full border px-3 py-2 rounded font-mono text-sm"
                  rows={8}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">조회 권한</label>
              <input type="text" value={form.readRole ?? ''} onChange={(e) => handleChange('readRole', e.target.value)} className="w-full border px-3 py-2 rounded" />
            </div>
            <div>
              <label className="block font-semibold mb-1">등록 권한</label>
              <input type="text" value={form.writeRole ?? ''} onChange={(e) => handleChange('writeRole', e.target.value)} className="w-full border px-3 py-2 rounded" />
            </div>
            <div>
              <label className="block font-semibold mb-1">수정 권한</label>
              <input type="text" value={form.updateRole ?? ''} onChange={(e) => handleChange('updateRole', e.target.value)} className="w-full border px-3 py-2 rounded" />
            </div>
            <div>
              <label className="block font-semibold mb-1">삭제 권한</label>
              <input type="text" value={form.deleteRole ?? ''} onChange={(e) => handleChange('deleteRole', e.target.value)} className="w-full border px-3 py-2 rounded" />
            </div>
            <div>
              <label className="block font-semibold mb-1">사용 여부</label>
              <select value={form.useTf ?? 'Y'} onChange={(e) => handleChange('useTf', e.target.value as never)} className="w-full border px-3 py-2 rounded">
                {yesNoOptions.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => navigate('/admin/board-config')} className="px-4 py-2 bg-gray-400 text-white rounded">
              취소
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              {isEdit ? '수정' : '등록'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default BoardConfigWrite;
