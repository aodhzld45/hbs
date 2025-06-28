import React, { useState, useEffect } from 'react';

import { UserMenuNode } from '../../../types/Admin/UserMenuNode';
import {
  fetchUserMenuCreate,
  fetchUserMenuUpdate,
  fetchUserMenuDelete,
} from '../../../services/Admin/userMenuApi';

import { flattenMenuTree } from '../../../utils/menuTreeFlattener';
import { useAuth } from '../../../context/AuthContext';


type Props = {
  treeData: UserMenuNode[];
  initialForm?: Partial<FormState>;
  onSuccess: () => void;
};

type FormState = {
  id?: number;
  name: string;
  url: string;
  parentId: number | null;
  depth: number;
  orderSeq: number;
  description: string;
  useTf: 'Y' | 'N';
};

const defaultForm: FormState = {
  id: undefined,
  name: '',
  url: '',
  parentId: null,
  depth: 0,
  orderSeq: 0,
  description: '',
  useTf: 'Y',
};

const UserMenuForm: React.FC<Props> = ({ treeData, initialForm, onSuccess }) => {
  const [form, setForm] = useState<FormState>({ ...defaultForm, ...initialForm });
  const { admin } = useAuth();

  useEffect(() => {
    if (initialForm) {
      setForm({ ...defaultForm, ...initialForm });
    } else {
      setForm({ ...defaultForm }); // ← 등록 모드로 전환 시 초기화
    }
  }, [initialForm]);

  const adminId = admin?.id;
  if (!adminId) {
    alert('관리자 정보가 없습니다. 다시 로그인 해주세요.');
    return null;
  }

  const isEditMode = form.id !== undefined;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev: FormState) => ({ ...prev, [name]: value }));
  };

  const handleParentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value ? parseInt(e.target.value) : null;
    const selected = findNodeById(treeData, selectedId);
    const parentDepth = selected?.depth ?? 0;

    setForm((prev: FormState) => ({
      ...prev,
      parentId: selectedId,
      depth: parentDepth + 1,
    }));
  };

  const resetForm = () => {
    setForm({ ...defaultForm });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditMode && form.id !== undefined) {
        await fetchUserMenuUpdate(form.id, form, adminId);
      } else {
        await fetchUserMenuCreate(form, adminId);
      }
      onSuccess();
      resetForm();
    } catch (err) {
      alert('저장 실패');
      console.error(err);
    }
  };

  const handleDeleteMenu = async () => {
    if (!form.id) return;

    const confirmed = window.confirm('정말 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
      await fetchUserMenuDelete(form.id, adminId);
      onSuccess();
      resetForm();
    } catch (err) {
      alert('삭제 실패');
      console.error(err);
    }
  };

  const options = flattenMenuTree(treeData);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="메뉴명"
        className="input w-full"
        required
      />
      <input
        name="url"
        value={form.url}
        onChange={handleChange}
        placeholder="URL"
        className="input w-full"
        required
      />
      <input
        name="orderSeq"
        type="number"
        value={form.orderSeq}
        onChange={handleChange}
        placeholder="정렬 순서"
        className="input w-full"
      />

      <select
        name="parentId"
        value={form.parentId ?? ''}
        onChange={handleParentChange}
        className="input w-full"
      >
        <option value="">(상위 메뉴 없음)</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>

      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="설명"
        className="input w-full"
      />

      <select
        name="useTf"
        value={form.useTf}
        onChange={handleChange}
        className="input w-full"
      >
        <option value="Y">사용</option>
        <option value="N">미사용</option>
      </select>

      <div className="w-full flex justify-end gap-2 mt-4">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {isEditMode ? '수정하기' : '등록하기'}
        </button>

        {isEditMode && (
          <button
            type="button"
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={handleDeleteMenu}
          >
            삭제하기
          </button>
        )}
      </div>

    </form>
  );
};

export default UserMenuForm;

// 트리 구조에서 id로 노드 찾기 (재귀)
function findNodeById(nodes: UserMenuNode[], id: number | null): UserMenuNode | undefined {
  if (id === null) return undefined;
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNodeById(node.children, id);
    if (found) return found;
  }
  return undefined;
}
