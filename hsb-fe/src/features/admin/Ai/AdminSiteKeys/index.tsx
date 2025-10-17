import React, { useState, useEffect } from "react";
import { useSiteKeys } from "./hooks/useSiteKey";
import { CreateRequest, SiteKeyResponse, SiteKeySummary, Status, UpdateRequest } from "./types/siteKey";
import SiteKeyFormModal from "./components/SiteKeyFormModal";
import Pagination from "../../../../components/Common/Pagination"; // ← 공통 컴포넌트 경로에 맞게 조정

import { updateSiteKeyUseTf, deleteSiteKey } from "./services/siteKeyApi";

import { useNavigate } from "react-router-dom";

// 공통 메뉴 목록 불러오기
import {
  fetchAdminMenus
} from '../../../../services/Admin/adminMenuApi';
import { AdminMenu } from '../../../../types/Admin/AdminMenu';
import { useLocation } from "react-router-dom";

// 관리자 정보 불러오기
import AdminLayout from "../../../../components/Layout/AdminLayout";
import { useAuth } from "../../../../context/AuthContext";


export default function AdminSiteKeys() {
  // 공통 헤더/메뉴 관련
  const location = useLocation();
  const { admin } = useAuth();
  const [adminId, setAdminId] = useState<string | null>(admin?.id || null);
  const [menus, setMenus] = useState<(AdminMenu & { label?: string })[]>([]);
  const [currentMenuTitle, setCurrentMenuTitle] = useState<string | null>(null);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState<string>("");

  const { query, setQuery, data, loading, error, load, create, update, changeStatus, getDetail } = useSiteKeys();

  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<SiteKeyResponse | null>(null);

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

  const onSearch = async () => { await load({ page: 0 }); };

  const handleToggleUseTf = async (siteKey:SiteKeySummary) => {
    try {
      if (!window.confirm("사용여부를 변경 하시겠습니까?")) return;

      if(!adminId) {
        alert('관리자 정보가 없습니다. 다시 로그인 해주세요.');
        return;
      }

      const newUseTf: "Y" | "N" = siteKey.useTf === "Y" ? "N" : "Y";
      const updatedId = await updateSiteKeyUseTf(siteKey.id, newUseTf, adminId);
      const statusLabel = newUseTf === "Y" ? "사용" : "미사용";

      alert(`${updatedId}번 사이트키의 사용여부가 '${statusLabel}'으로 변경되었습니다.`);
       
      await load(); // 변경 후 목록 새로고침
    } catch (e) {
      alert("사용여부 변경에 실패했습니다.");
      console.error(e);
      return;
    }
  } 

  const handleDelete = async (id: number) => {
    try {
      if (!window.confirm("정말 삭제하시겠습니까?")) return;

      if(!adminId) {
        alert('관리자 정보가 없습니다. 다시 로그인 해주세요.');
        return;
      }

      const deletedId = await deleteSiteKey(id, adminId);
      alert(`${deletedId}번 사이트키가 삭제되었습니다.`);

      await load(); // 삭제 후 목록 새로고침
      
    } catch (error) {
      alert("삭제에 실패했습니다.");
      console.error(error);
      return;
    }
  }

  const openCreate = () => { setMode("create"); setSelected(null); setOpenModal(true); };
  const openEdit = async (id: number) => {
    const detail = await getDetail(id);
    setMode("edit"); setSelected(detail); setOpenModal(true);
  };

  const submitForm = async (payload: CreateRequest | UpdateRequest) => {
    if (mode === "create") await create(payload as CreateRequest);
    else if (selected?.id) await update(selected.id, payload as UpdateRequest);
  };

  return (
    <AdminLayout>
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        {currentMenuTitle}
      </h2>

      {/* 검색바 */}
      <div className="bg-gray-50 p-3 rounded-lg mt-3 flex flex-col gap-3">
        {/* 1행: 총 건수 */}
        <div className="text-sm text-gray-500">
          총 {data?.totalElements ?? 0}건
        </div>

        {/* 2행: 인풋 3개 + 우측 버튼들 */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          {/* 가운데: 인풋들 (가운데 영역 차지) */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              placeholder="Keyword (siteKey/notes)"
              value={query.keyword || ""}
              onChange={e => setQuery(q => ({ ...q, keyword: e.target.value }))}
              className="border rounded px-2 py-1"
            />
            <input
              placeholder="Plan Code"
              value={query.planCode || ""}
              onChange={e => setQuery(q => ({ ...q, planCode: e.target.value }))}
              className="border rounded px-2 py-1"
            />
            <select
              value={query.status || ""}
              onChange={e => setQuery(q => ({ ...q, status: e.target.value as any }))}
              className="border rounded px-2 py-1 bg-white"
            >
              <option value="">Status(전체)</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="REVOKED">REVOKED</option>
            </select>
          </div>

          {/* 오른쪽: 버튼들 */}
          <div className="md:ml-auto self-end md:self-auto flex gap-2">
            <button onClick={onSearch} className="px-3 py-1 border rounded">검색</button>
            <button
              className="px-4 py-2 rounded bg-blue-600 text-white hover:opacity-90"
              onClick={openCreate}
            >
              사이트키 등록
            </button>
          </div>
        </div>
      </div>


      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border">
          <thead className="bg-gray-100 text-left">
            <tr className="text-center">
              <th className="p-2">번호</th>
              <th className="p-2">사이트키</th>
              <th className="p-2">상태</th>
              <th className="p-2">플랜</th>
              <th className="p-2">Calls/Day</th>
              <th className="p-2">Tokens/Day</th>
              <th className="p-2">Domains</th>
              <th className="p-2">등록일</th>
              <th className="p-2">사용 여부</th>
              <th className="p-2">상태 변경</th>
              <th className="p-2">관리</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td className="p-4 text-center" colSpan={9}>불러오는 중...</td></tr>}
            {!loading && (data?.content?.length ?? 0) === 0 && (
              <tr><td className="p-4 text-center" colSpan={9}>데이터가 없습니다.</td></tr>
            )}
            {!loading && data?.content?.map(row => (
              <tr key={row.id} className="border-t text-center">
                <td className="p-2">{row.id}</td>
                <td className="p-2"><code>{row.siteKey}</code></td>
                <td className="p-2">
                  <span className={`px-2 py-0.5 rounded text-white text-xs ${
                    row.status === "ACTIVE" ? "bg-emerald-500" :
                    row.status === "SUSPENDED" ? "bg-amber-500" : "bg-red-500"
                  }`}>{row.status}</span>
                </td>
                <td className="p-2">{row.planCode ?? "-"}</td>
                <td className="p-2">{row.dailyCallLimit ?? "-"}</td>
                <td className="p-2">{row.dailyTokenLimit ?? "-"}</td>
                <td className="p-2">{row.domainCount}</td>
                <td className="p-2">{row.regDate?.replace("T"," ") ?? "-"}</td>
                <td className="p-2 border text-center">
                  <button
                    onClick={() => handleToggleUseTf(row)}
                    className={`px-2 py-1 rounded text-xs ${
                      row.useTf === 'Y'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-600'
                    } hover:bg-green-200`}
                  >
                    {row.useTf === 'Y' ? '사용' : '미사용'}
                  </button>
                </td>
                <td className="p-2">
                    <select
                      defaultValue={row.status}
                      onChange={(e) => { const v = e.target.value as Status; if (v) changeStatus(row.id, v, "changed via admin UI"); }}
                      className="px-2 py-1 border rounded"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                      <option value="REVOKED">REVOKED</option>
                    </select>
                </td>
                <td className="px-4 py-2 text-sm">
                    <button className="text-blue-500 hover:underline mr-2" onClick={() => openEdit(row.id)}>수정</button>
                    <button className="text-red-500 hover:underline" onClick={() => handleDelete(row.id)}>
                      삭제
                    </button>
                </td>  
              </tr>
            ))}
          </tbody>
        </table>

        {/* 하단 페이저 (공통 컴포넌트 사용) */}
          <Pagination
            currentPage={data?.page ?? 0}
            totalPages={data?.totalPages ?? 0}
            onPageChange={(p) => load({ page: p })}
          />
      </div>

      {/* 모달 */}
      <SiteKeyFormModal
        open={openModal}
        mode={mode}
        initial={selected ?? undefined}
        onClose={() => setOpenModal(false)}
        onSubmit={submitForm}
      />

      {error && <div className="mt-2 text-red-500">{error}</div>}
    </div>
    </AdminLayout>
  );
}
