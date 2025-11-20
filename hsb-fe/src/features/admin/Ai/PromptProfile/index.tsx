// src/features/Admin/AiPromptProfile/index.tsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import AdminLayout from "../../../../components/Layout/AdminLayout";
import { useAuth } from "../../../../context/AuthContext";

import { fetchAdminMenus } from "../../../../services/Admin/adminMenuApi";
import type { AdminMenu } from "../../../../types/Admin/AdminMenu";

import type {
  PromptProfile,
  PromptProfileRequest,
} from "./types/promptProfileConfig";
import {
  fetchPromptProfileList,
  fetchPromptProfileDetail,
  createPromptProfile,
  updatePromptProfile,
  deletePromptProfile,
  updatePromptProfileUseTf,
} from "./services/promptProfileApi";

import PromptProfileTable from "./components/PromptProfileTable";
import PromptProfileEditorForm from "./components/PromptProfileEditorForm";

export default function AdminPromptProfile() {
  /** ── 공통 헤더/메뉴 처리 ───────────────────────────────────────────── */
  const location = useLocation();
  const { admin } = useAuth();
  const [adminId, setAdminId] = useState<string | null>(admin?.id || null);
  const actorId = String(admin?.id ?? admin?.email ?? "system");
  const [currentMenuTitle, setCurrentMenuTitle] = useState<string | null>(null);
  const [menus, setMenus] = useState<(AdminMenu & { label?: string })[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState<string>("");

  // ===== 메뉴 로딩 =====
  const loadMenus = async () => {
    try {
      const data = await fetchAdminMenus();
      setMenus(data);
      const matched = data.find((m) => m.url === location.pathname);
      setCurrentMenuTitle(matched ? matched.name : null);
    } catch (e) {
      console.error(e);
      setMenuError("메뉴 목록을 불러오는데 실패했습니다.");
    } finally {
      setMenuLoading(false);
    }
  };

  useEffect(() => {
    loadMenus();
  }, [location.pathname]);

  useEffect(() => {
    setAdminId(admin?.id || null);
  }, [admin?.id]);

  /** ── 리스트/검색 상태 ─────────────────────────────────────────────── */
  const [keyword, setKeyword] = useState("");
  const [modelFilter, setModelFilter] = useState("");

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [sort, setSort] = useState("regDate,desc");

  const [rows, setRows] = useState<PromptProfile[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const loadList = async (overridePage?: number) => {
    try {
      setLoading(true);
      setListError(null);
      const res = await fetchPromptProfileList(
        keyword,
        modelFilter,
        overridePage ?? page,
        size,
        sort,
      );
      setRows(res.items ?? []);
      setTotalCount(res.totalCount ?? 0);
      setTotalPages(res.totalPages ?? 0);
      if (overridePage !== undefined) {
        setPage(overridePage);
      }
    } catch (e: any) {
      console.error(e);
      setListError(e?.message ?? "프롬프트 프로필 목록 조회 실패");
    } finally {
      setLoading(false);
    }
  };

  // 최초 로딩 + 필터 변경 시 재조회
  useEffect(() => {
    loadList(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, modelFilter, size, sort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadList(0);
  };

  const handleChangePage = (nextPage: number) => {
    loadList(nextPage);
  };

  /** ── 모달/폼 상태 ─────────────────────────────────────────────────── */
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<PromptProfile | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setEditorOpen(true);
  };

  const openEdit = async (row: PromptProfile) => {
    try {
      setDetailLoading(true);
      // 필요하다면 상세 조회 API 호출
      const detail = await fetchPromptProfileDetail(row.id);
      setEditing(detail);
      setEditorOpen(true);
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "프롬프트 프로필 상세 조회 실패");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditing(null);
  };

  /** ── CRUD 핸들러 ──────────────────────────────────────────────────── */
  const handleSubmit = async (data: PromptProfileRequest) => {
    try {
      if (editing) {
        // 수정
        await updatePromptProfile(editing.id, data, actorId);
        alert("프롬프트 프로필이 수정되었습니다.");
      } else {
        // 신규
        await createPromptProfile(data, actorId);
        alert("프롬프트 프로필이 등록되었습니다.");
      }
      closeEditor();
      await loadList(0);
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "저장 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async (row: PromptProfile) => {
    if (!window.confirm(`"${row.name}" 프롬프트 프로필을 삭제하시겠습니까?`)) {
      return;
    }
    try {
      await deletePromptProfile(row.id, actorId);
      alert("삭제되었습니다.");
      await loadList(0);
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "삭제 중 오류가 발생했습니다.");
    }
  };

  const handleToggleUse = async (row: PromptProfile) => {
    const nextUse: "Y" | "N" = row.useTf === "Y" ? "N" : "Y";
    try {
      await updatePromptProfileUseTf(row.id, nextUse, actorId);
      await loadList(page);
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "사용여부 변경 중 오류가 발생했습니다.");
    }
  };

  /** ── 렌더링 ───────────────────────────────────────────────────────── */
  return (
    <AdminLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">
          {currentMenuTitle}
        </h2>
        {/* 검색 영역 */}
        <form
          className="flex items-end gap-3 px-4 py-3 border rounded-lg bg-white"
          onSubmit={handleSearchSubmit}
        >
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              키워드(이름/목적/프롬프트 내용)
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="검색어를 입력하세요."
            />
          </div>

          <div className="w-52">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              모델 필터
            </label>
            <input
              type="text"
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="예: gpt-4o-mini"
            />
          </div>

          <div className="w-24">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              페이지 크기
            </label>
            <select
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full border rounded px-2 py-1 text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex gap-2 mb-[2px]">
            <button
              type="submit"
              className="px-3 py-1.5 text-xs rounded bg-gray-800 text-white hover:bg-gray-900"
            >
              검색
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="px-3 py-1.5 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              신규 등록
            </button>
          </div>
        </form>

        {/* 에러 메세지 */}
        {listError && (
          <div className="px-4 py-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded">
            {listError}
          </div>
        )}

        {/* 목록 테이블 */}
        <PromptProfileTable
          rows={rows}
          loading={loading}
          page={page}
          size={size}
          totalCount={totalCount}
          onChangePage={handleChangePage}
          onClickEdit={openEdit}
          onClickDelete={handleDelete}
          onToggleUse={handleToggleUse}
        />

        {/* ── 모달 (간단 구현) ───────────────────────────────────────── */}
        {editorOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-xl w-[900px] max-h-[90vh] overflow-y-auto p-4">
              {detailLoading ? (
                <div className="py-10 text-center text-sm text-gray-500">
                  로딩 중...
                </div>
              ) : (
                <PromptProfileEditorForm
                  value={editing}
                  onSubmit={handleSubmit}
                  onCancel={closeEditor}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
