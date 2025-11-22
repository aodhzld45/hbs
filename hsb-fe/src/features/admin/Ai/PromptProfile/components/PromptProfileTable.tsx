// PromptProfileTable.tsx
import React from "react";
import type { PromptProfile } from "../types/promptProfileConfig";
import PromptStatusBadge from "./PromptStatusBadge";
import Pagination from "../../../../../components/Common/Pagination"; // 프로젝트 경로에 맞게 조정

type Props = {
  rows: PromptProfile[];
  loading: boolean;
  page: number;
  size: number;
  totalCount: number;

  onChangePage: (page: number) => void;
  onClickEdit: (row: PromptProfile) => void;
  onClickDelete: (row: PromptProfile) => void;
  onToggleUse: (row: PromptProfile) => void;
};

export default function PromptProfileTable({
  rows,
  loading,
  page,
  size,
  totalCount,
  onChangePage,
  onClickEdit,
  onClickDelete,
  onToggleUse,
}: Props) {
  return (
    <div className="border rounded-lg bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
        <h2 className="text-sm font-semibold text-gray-800">
          프롬프트 프로필 목록
        </h2>
        {loading && (
          <span className="text-xs text-gray-500">Loading...</span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">
                ID
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">
                이름
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">
                목적
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">
                모델
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">
                상태
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500">
                사용여부
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">
                등록일
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500">
                액션
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loading && (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-6 text-center text-sm text-gray-400"
                >
                  데이터가 없습니다.
                </td>
              </tr>
            )}

            {rows.map((row) => (
              <tr key={row.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2 text-xs text-gray-500">{row.id}</td>
                <td className="px-3 py-2 text-sm text-gray-900">
                  <div className="flex flex-col">
                    <span className="font-medium">{row.name}</span>
                    {row.tenantId && (
                      <span className="text-xs text-gray-400">
                        tenant: {row.tenantId}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 text-xs text-gray-700">
                  {row.purpose || "-"}
                </td>
                <td className="px-3 py-2 text-xs text-blue-700">
                  {row.model}
                </td>
                <td className="px-3 py-2">
                  <PromptStatusBadge status={row.status} />
                </td>
                <td className="px-3 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => onToggleUse(row)}
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      row.useTf === "Y"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {row.useTf === "Y" ? "사용중" : "중지"}
                  </button>
                </td>
                <td className="px-3 py-2 text-xs text-gray-500">
                  {row.regDate?.replace("T"," ") ?? "-"}
                </td>
                <td className="px-3 py-2 text-center">
                  <div className="inline-flex gap-1">
                    <button
                      type="button"
                      onClick={() => onClickEdit(row)}
                      className="px-2 py-1 text-xs rounded border border-blue-500 text-blue-600 hover:bg-blue-50"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => onClickDelete(row)}
                      className="px-2 py-1 text-xs rounded border border-red-500 text-red-600 hover:bg-red-50"
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이징 */}
        <Pagination
          currentPage={page}
          totalPages={totalCount}
          onPageChange={onChangePage}
        />
    </div>
  );
}
