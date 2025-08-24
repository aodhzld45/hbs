import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// 공통 메뉴 목록 불러오기
import {
  fetchAdminMenus
} from '../../../services/Admin/adminMenuApi';
import { AdminMenu } from '../../../types/Admin/AdminMenu';
import { useLocation } from "react-router-dom";

// 관리자 정보 불러오기
import AdminLayout from "../../../components/Layout/AdminLayout";
import { useAuth } from '../../../context/AuthContext';

import { 
  fetchProblemList,
  fetchProblemDetail,
  fetchProblemCreate,
  fetchProblemUpdate,
  fetchProblemToggleUseTf
 } from "./services/sqlProblemApi";

import SqlProblemList from "./components/SqlProblemList";
import SqlProblemFormModal from "./components/SqlProblemFormModal";

import { ProblemItem, ConstraintRule } from './types/ProblemItem';
import { ProblemPayload } from "./types/ProblemPayload";

const SqlProblemManager: React.FC = () => {
  // 공통 헤더/메뉴 관련
  const location = useLocation();
  const { admin } = useAuth();
  const [adminId, setAdminId] = useState<string | null>(admin?.id || null);
  const [menus, setMenus] = useState<(AdminMenu & { label?: string })[]>([]);
  const [currentMenuTitle, setCurrentMenuTitle] = useState<string | null>(null);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState<string>("");

  // 목록/검색/페이징 상태 (부모에서 관리)
  const [items, setItems] = useState<ProblemItem[]>([]);
  const [keyword, setKeyword] = useState<string>("");
  const [level, setLevel] = useState<number | undefined>(undefined);
  const [rule, setRule] = useState<ConstraintRule | undefined>(undefined);
  const [useTf, setUseTfFilter] = useState<"Y" | "N" | undefined>(undefined);

  const [page, setPage] = useState(0);   // 0-based
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // 모달/상세
  const [formOpen, setFormOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<ProblemItem | null>(null);

  // 수정 모드용
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editInitial, setEditInitial] = useState<Partial<ProblemPayload> | null>(null);
  const [editItem, setEditItem] = useState<ProblemItem | null>(null);
  

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

 // ===== 목록 조회 =====
 const loadList = async () => {
    setLoading(true);
    try {
        const res = await fetchProblemList(keyword, page, size, level, rule, useTf);
        setItems(res.items);
        setTotalPages(res.totalPages ?? 0);
        setTotalCount(res.totalCount ?? 0);
    } catch (e) {
      console.error(e);
      // 필요 시 에러 토스트 처리
    } finally {
      setLoading(false);
    }
  };

  const nav = useNavigate();

  // ===== CRUD 핸들러 =====
  const handleCreateOpen = () => {
    setEditingId(null);
    setEditInitial(null);
    setFormOpen(true);
  };

  const handleEdit = async (item: ProblemItem) => {
    setEditingId(item.id);          // 목록의 id 기억
    try {
      const detail = await fetchProblemDetail(item.id); // 전체 필드 조회
      setEditInitial(detail);                            // 초기값 주입
      setFormOpen(true);
    } catch (e) {
      console.error(e);
      alert("SQL문제 상세를 불러오지 못했습니다.");
      setFormOpen(false);
      setEditingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    //await deleteProblem(id, adminId || "");
    await loadList();
  };

  const handleToggleUse = async (id: number, next: "Y" | "N") => {
    if (!admin?.id) {
      alert("관리자 인증 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }
    try {
      await fetchProblemToggleUseTf(id, next, admin?.id ?? "system"); 
      alert("사용여부가 변경되었습니다.");
      await loadList();
    } catch (e) {
      console.error(e);
      alert("사용여부 변경 중 오류가 발생했습니다. 관리자에게 문의하세요.");
    }

  };

const handleDetail = async (item: ProblemItem) => {
  try {
    const detail = await fetchProblemDetail(item.id);   // ← 수정 모달과 동일하게 선조회
    // 상세 페이지로 이동하면서 preload 데이터를 state로 전달
    nav(`/admin/sql-manager/${item.id}`, {
      state: { preload: detail, from: "list" },
    });
  } catch (e) {
    console.error(e);
    alert("SQL문제 상세를 불러오지 못했습니다.");
  }

};

const handleSubmit = async (payload: ProblemPayload) => {
  if (!adminId) {
    alert("관리자 인증 정보가 없습니다. 다시 로그인해주세요.");
    throw new Error('No adminId'); // 모달 닫히지 않도록 throw
  }
  try {
    if (editingId) {
      await fetchProblemUpdate(editingId, payload, adminId);
      alert("SQL문제가 수정되었습니다.");
    } else {
      await fetchProblemCreate(payload, adminId);
      alert("SQL문제가 등록되었습니다.");
    }
    await loadList();
  } catch (e: any) {
    console.error(e);
    alert(e?.response?.data?.message ?? "저장 중 오류가 발생했습니다.");
    throw e; // 모달 닫히지 않도록 throw
  }
};

// 부모에서 상태 변경 + 조회를 동시에 처리
  const search = async (params?: { resetPage?: boolean }) => {
    if (params?.resetPage) {
        setPage(0);
    } else {
        await loadList();
    }
  };

  // 리스트에 내려줄 state/actions
  const listState = useMemo(
    () => ({
      items,
      keyword,
      level,
      rule,
      useTf,
      page,
      size,
      totalPages,
      totalCount,
      loading,
    }),
    [items, keyword, level, rule, useTf, page, size, totalPages, totalCount, loading]
  );

  const listActions = useMemo(
    () => ({
      setKeyword,
      setLevel,
      setRule,
      setUseTf: setUseTfFilter,
      setPage: (v: number) => setPage(v), // 변경만, 조회는 useEffect가 수행
      search,        // SearchInput/필터 submit에서 사용
    }),
    [search, setKeyword, setLevel, setRule, setUseTfFilter]
  );

  // 최초/검색/페이지 변경 시 로딩
  useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, level, rule, useTf, page, size]); // 검색조건 변경 시엔 search()를 통해 page=0 세팅과 함께 호출

    return (
    <AdminLayout>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">
            {currentMenuTitle}
          </h2>

          {/*  등록 버튼 추가 */}
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white hover:opacity-90"
            onClick={handleCreateOpen}
          >
            문제 등록
          </button>

            {/* 목록 */}
            <SqlProblemList
            state={listState}
            actions={listActions}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleUse={handleToggleUse}
            onDetail={handleDetail}
            />

            {/*  등록/수정 모달 연결 */}
            <SqlProblemFormModal
              open={formOpen}
              onClose={() => {
                setFormOpen(false);
                setEditingId(null);
                setEditInitial(null);
              }}
              onSubmit={async (payload) => {
                // 서버 Enum 때문에 constraintRule 은 SELECT_ONLY | DML_ALLOWED 로만 전달되게 폼에서 제한
                await handleSubmit(payload);
                setFormOpen(false);
                setEditingId(null);
                setEditInitial(null);
              }}
              initial={editInitial ?? undefined}       // ← 수정 시 상세 초기값 주입
            />
        </div>
    </AdminLayout>
    );

}

export default SqlProblemManager;
