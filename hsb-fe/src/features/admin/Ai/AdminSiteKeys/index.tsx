import React, { useState } from "react";
import { useSiteKeys } from "./hooks/useSiteKey";
import { CreateRequest, SiteKeyResponse, Status, UpdateRequest } from "./types/siteKey";
import SiteKeyFormModal from "./components/SiteKeyFormModal";
import Pagination from "../../../../components/Common/Pagination"; // ← 공통 컴포넌트 경로에 맞게 조정
import { useAuth } from "../../../../context/AuthContext";
import AdminLayout from "../../../../components/Layout/AdminLayout";



export default function AdminSiteKeys() {
  const { admin } = useAuth(); // 필요 시 표시용
  const { query, setQuery, data, loading, error, load, create, update, changeStatus, getDetail } = useSiteKeys();

  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<SiteKeyResponse | null>(null);

  const onSearch = async () => { await load({ page: 0 }); };

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
    <div className="p-5">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-xl font-semibold">AI Site Keys</h2>
          <p className="text-gray-500">siteKey 발급/관리, 도메인 화이트리스트/한도 설정</p>
        </div>
        <div className="text-sm text-gray-400">
          {admin?.id ? <>Signed in as <b>{admin.id}</b></> : null}
        </div>
      </div>

      {/* 검색바 */}
      <div className="grid grid-cols-4 gap-2 bg-gray-50 p-3 rounded-lg mt-3">
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
          className="border rounded px-2 py-1"
        >
          <option value="">Status(전체)</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="SUSPENDED">SUSPENDED</option>
          <option value="REVOKED">REVOKED</option>
        </select>
        <div className="flex gap-2 justify-end">
          <button onClick={onSearch} className="px-3 py-1 border rounded">검색</button>
          <button onClick={openCreate} className="px-3 py-1 rounded text-white bg-gray-900">+ 새 키</button>
        </div>
      </div>

      {/* 테이블 */}
      <div className="mt-3 overflow-hidden rounded-lg shadow bg-white">
        <table className="w-full table-fixed">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">SiteKey</th>
              <th className="p-2">Status</th>
              <th className="p-2">Plan</th>
              <th className="p-2">Calls/Day</th>
              <th className="p-2">Tokens/Day</th>
              <th className="p-2">Domains</th>
              <th className="p-2">RegDate</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td className="p-4 text-center" colSpan={9}>불러오는 중...</td></tr>}
            {!loading && (data?.content?.length ?? 0) === 0 && (
              <tr><td className="p-4 text-center" colSpan={9}>데이터가 없습니다.</td></tr>
            )}
            {!loading && data?.content?.map(row => (
              <tr key={row.id} className="border-t">
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
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <button className="px-2 py-0.5 border rounded" onClick={() => openEdit(row.id)}>수정</button>
                    <select
                      defaultValue=""
                      onChange={(e) => { const v = e.target.value as Status; if (v) changeStatus(row.id, v, "changed via admin UI"); }}
                      className="px-2 py-1 border rounded"
                    >
                      <option value="">상태 변경</option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                      <option value="REVOKED">REVOKED</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 하단 페이저 (공통 컴포넌트 사용) */}
        <div className="p-3 flex items-center justify-between">
          <span className="text-sm text-gray-500">총 {data?.totalElements ?? 0}건</span>
          <Pagination
            currentPage={data?.page ?? 0}
            totalPages={data?.totalPages ?? 0}
            onPageChange={(p) => load({ page: p })}
          />
        </div>
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
