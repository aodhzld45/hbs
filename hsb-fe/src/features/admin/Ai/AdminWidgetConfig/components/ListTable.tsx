import React from 'react';
import type { WidgetConfigListResponse } from '../types/widgetConfig';

type Props = {
  data?: WidgetConfigListResponse | null;
  loading?: boolean;
  onEdit: (id: number) => void;
  onToggleUse: (id: number, next: 'Y'|'N') => void;
  onDelete: (id: number) => void;
};

export default function ListTable({ data, loading, onEdit, onToggleUse, onDelete }: Props) {
  if (loading) return <div className="p-4">불러오는 중…</div>;
  if (!data) return <div className="p-4">데이터가 없습니다.</div>;

  return (
    <div className="overflow-x-auto border rounded">
      <table className="min-w-[880px] w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-2 text-left w-16">ID</th>
            <th className="p-2 text-left">이름</th>
            <th className="p-2 text-center w-24">위치</th>
            <th className="p-2 text-center w-24">너비</th>
            <th className="p-2 text-left w-48">Primary</th>
            <th className="p-2 text-center w-24">사용</th>
            <th className="p-2 text-right w-56">액션</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((it) => (
            <tr key={it.id} className="border-t">
              <td className="p-2">{it.id}</td>
              <td className="p-2">{it.name}</td>
              <td className="p-2 text-center">{it.position}</td>
              <td className="p-2 text-center">{it.panelWidthPx}</td>
              <td className="p-2">
                <span
                  className="inline-block w-4 h-4 rounded-sm align-middle mr-2"
                  style={{ background: it.primaryColor || '#999' }}
                />
                {it.primaryColor || '-'}
              </td>
              <td className="p-2 text-center">{it.useTf === 'Y' ? 'Y' : 'N'}</td>
              <td className="p-2">
                <div className="flex gap-2 justify-end">
                  <button className="px-2 py-1 border rounded" onClick={() => onEdit(it.id)}>
                    편집
                  </button>
                  <button
                    className="px-2 py-1 border rounded"
                    onClick={() => onToggleUse(it.id, it.useTf === 'Y' ? 'N' : 'Y')}
                  >
                    사용토글
                  </button>
                  <button className="px-2 py-1 border rounded text-red-600" onClick={() => onDelete(it.id)}>
                    삭제
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {data.items.length === 0 && (
            <tr>
              <td className="p-6 text-center text-gray-500" colSpan={7}>목록이 비어있습니다.</td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="text-right text-xs text-gray-500 p-2">
        총 {data.totalCount}건 / {data.totalPages} 페이지
      </div>
    </div>
  );
}
