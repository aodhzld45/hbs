import React, { useState, useEffect, useMemo } from "react";
// 공통 메뉴 목록 불러오기
import {
  fetchAdminMenus
} from '../../../services/Admin/adminMenuApi';
import { AdminMenu } from '../../../types/Admin/AdminMenu';
import { useLocation } from "react-router-dom";

// 관리자 정보 불러오기
import AdminLayout from "../../../components/Layout/AdminLayout";
import { useAuth } from '../../../context/AuthContext';

import { fetchProblemList } from "./services/sqlProblemApi";
import SqlProblemList from "./components/SqlProblemList";
import { ProblemItem, ConstraintRule } from './types/ProblemItem';


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
  const [editItem, setEditItem] = useState<ProblemItem | null>(null);
  const [detailItem, setDetailItem] = useState<ProblemItem | null>(null);

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

  // ===== CRUD 핸들러 =====
  const handleCreateOpen = () => {
    setEditItem(null);
    setFormOpen(true);
  };

  const handleEdit = (item: ProblemItem) => {
    setEditItem(item);
    setFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    //await deleteProblem(id, adminId || "");
    await loadList();
  };

  const handleToggleUse = async (id: number, next: "Y" | "N") => {
    //await setUseTf(id, next);
    await loadList();
  };

  const handleDetail = (item: ProblemItem) => setDetailItem(item);

  const handleSubmit = async (payload: {
    title: string;
    level?: number;
    tags?: string[];
    descriptionMd?: string;
    constraintRule?: ConstraintRule;
    orderSensitive?: boolean;
    useTf?: "Y" | "N";
  }) => {
    if (!adminId) {
      alert("관리자 인증 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }
    if (editItem) {
      // await updateProblem(editItem.id, payload, adminId);
    } else {
      // await createProblem(payload, adminId);
    }
    await loadList();
  };

// 부모에서 상태 변경 + 조회를 동시에 처리
  const search = async (params?: { resetPage?: boolean }) => {
    if (params?.resetPage) {
        setPage(0);
        await loadList();
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
      setPage: (v: number) => {
      setPage(v);
      search(); // 페이지 바뀔 때 바로 조회
    },      
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

            {/* 목록 */}
            <SqlProblemList
            state={listState}
            actions={listActions}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleUse={handleToggleUse}
            onDetail={handleDetail}
            />


        </div>
    </AdminLayout>
    );

}

export default SqlProblemManager;
