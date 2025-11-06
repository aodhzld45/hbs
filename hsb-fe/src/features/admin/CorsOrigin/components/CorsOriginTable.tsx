import React from 'react';
import { CorsOrigin, CorsOriginListResponse } from '../types/CorsOrigin';

type Props = {
  data?: CorsOriginListResponse | null;
  loading?: boolean;
  onEdit: (row: CorsOrigin) => void;
  onToggleUse: (row: CorsOrigin) => void;
  onDelete: (row: CorsOrigin) => void;
};

export default function CorsOriginTable({ data, loading, onEdit, onToggleUse, onDelete }: Props) {
  if (loading) return <div className="p-4">불러오는 중…</div>;
  if (!data) return <div className="p-4">데이터가 없습니다.</div>;

  return (
    <div className="overflow-x-auto border rounded-xl">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Origin</th>
            <th className="p-2 text-left">Tenant</th>
            <th className="p-2 text-left">설명</th>
            <th className="p-2 text-left">사용</th>
            <th className="p-2 text-left">액션</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map(r => (
            <tr key={r.id} className="border-t">
              <td className="p-2">{r.id}</td>
              <td className="p-2">{r.originPat}</td>
              <td className="p-2">{r.tenantId ?? '-'}</td>
              <td className="p-2">{r.description ?? '-'}</td>
              <td className="p-2">
                <span className={`px-2 py-1 rounded text-xs ${r.useTf === 'Y' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {r.useTf}
                </span>
              </td>
              <td className="p-2 space-x-2">
                <button className="px-2 py-1 border rounded" onClick={() => onEdit(r)}>수정</button>
                <button className="px-2 py-1 border rounded" onClick={() => onToggleUse(r)}>
                  {r.useTf === 'Y' ? '비활성' : '활성'}
                </button>
                <button className="px-2 py-1 border rounded text-red-600" onClick={() => onDelete(r)}>삭제</button>
              </td>
            </tr>
          ))}
          {data.items.length === 0 && (
            <tr>
              <td className="p-4 text-center text-gray-500" colSpan={6}>데이터가 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
