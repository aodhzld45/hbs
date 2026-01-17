import React, { useState } from "react";
import { useSiteKeys } from "./hooks/useSiteKey";
import { CreateRequest, SiteKeyResponse, SiteKeySummary, Status, UpdateRequest } from "./types/siteKey";
import AdminLayout from "../../../../components/Layout/AdminLayout";
import SiteKeyFormModal from "./components/SiteKeyFormModal";
import Pagination from "../../../../components/Common/Pagination"; // ← 공통 컴포넌트 경로에 맞게 조정
import { useAdminPageHeader } from "../../Common/hooks/useAdminPageHeader";

import { updateSiteKeyUseTf, deleteSiteKey } from "./services/siteKeyApi";


export default function AdminSiteKeys() {

  const { query, setQuery, data, loading, error, load, create, update, changeStatus, getDetail } = useSiteKeys();

  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<SiteKeyResponse | null>(null);
  /* 공통 헤더/메뉴 처리 */
  const { currentMenuTitle, actorId, menuError } = useAdminPageHeader();

  const onSearch = async () => { await load({ page: 0 }); };

  const handleToggleUseTf = async (siteKey:SiteKeySummary) => {
    try {
      if (!window.confirm("사용여부를 변경 하시겠습니까?")) return;

      if(!actorId) {
        alert('관리자 정보가 없습니다. 다시 로그인 해주세요.');
        return;
      }

      const newUseTf: "Y" | "N" = siteKey.useTf === "Y" ? "N" : "Y";
      const updatedId = await updateSiteKeyUseTf(siteKey.id, newUseTf, actorId);
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

      if(!actorId) {
        alert('관리자 정보가 없습니다. 다시 로그인 해주세요.');
        return;
      }

      const deletedId = await deleteSiteKey(id, actorId);
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
    <h2 className="text-2xl font-bold mb-4">{currentMenuTitle}</h2>
      {menuError && (
        <div className="px-4 py-2 mb-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded">
          {menuError}
        </div>
      )}
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
            {loading && <tr><td className="p-4 text-center" colSpan={11}>불러오는 중...</td></tr>}
            {!loading && (data?.content?.length ?? 0) === 0 && (
              <tr><td className="p-4 text-center" colSpan={11}>데이터가 없습니다.</td></tr>
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
                    value={row.status} // 리스트 데이터 기준으로 표시
                    onChange={(e) => {
                      const next = e.target.value as Status;
                      const prev = row.status;

                      // 상태가 실제로 변경되지 않았으면 return
                      if (!next || next === prev) return;

                      // 변경 전 사용자 확인 + 사유 입력
                      const reason = window.prompt(
                        `상태를 ${prev} → ${next} 로 변경합니다.\n변경 사유를 입력해주세요. (선택 사항)`
                      );

                      // 취소(null)이면 변경 취소 → 다시 이전 값으로 되돌리기
                      if (reason === null) {
                        // onChange 시점에서 value는 이미 next로 바뀌었으니,
                        // 렌더링은 row.status(prev)를 그대로 보고 다시 그려짐
                        // (즉, 별도의 setState 없이도 load()/리스트 상태 기준으로 복원 가능)
                        return;
                      }

                      // 공백만 입력했다면 notes는 undefined 처리
                      const notes = reason.trim() || undefined;

                      changeStatus(row.id, next, notes);
                    }}
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
