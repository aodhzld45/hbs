import React from 'react';
import { BlockIp, BlockIpListResponse } from '../types/BlockIp';

type Props = {
  data?: BlockIpListResponse | null;
  loading?: boolean;
  onEdit: (row: BlockIp) => void;
  onToggleUse: (row: BlockIp) => void;
  onDelete: (row: BlockIp) => void;
};

export default function BlockIpTable({ data, loading, onEdit, onToggleUse, onDelete }: Props) {
  if (loading) return <div className="p-4">불러오는 중...</div>;
  if (!data) return <div className="p-4">데이터가 없습니다.</div>;

  return (
    <div className="overflow-x-auto border rounded-xl">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">IP</th>
            <th className="p-2 text-left">설명</th>
            <th className="p-2 text-left">사용</th>
            <th className="p-2 text-left">등록일</th>
            <th className="p-2 text-left">액션</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((row) => (
            <tr key={row.id} className="border-t">
              <td className="p-2">{row.id}</td>
              <td className="p-2 font-mono">{row.ipAddress}</td>
              <td className="p-2">{row.description ?? '-'}</td>
              <td className="p-2">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    row.useTf === 'Y' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {row.useTf}
                </span>
              </td>
              <td className="p-2">{row.regDate?.slice(0, 19).replace('T', ' ') ?? '-'}</td>
              <td className="p-2 space-x-2">
                <button className="px-2 py-1 border rounded" onClick={() => onEdit(row)}>
                  수정
                </button>
                <button className="px-2 py-1 border rounded" onClick={() => onToggleUse(row)}>
                  {row.useTf === 'Y' ? '비활성' : '활성'}
                </button>
                <button className="px-2 py-1 border rounded text-red-600" onClick={() => onDelete(row)}>
                  삭제
                </button>
              </td>
            </tr>
          ))}
          {data.items.length === 0 && (
            <tr>
              <td className="p-4 text-center text-gray-500" colSpan={6}>
                데이터가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
