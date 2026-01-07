import React from "react";
import { MaintenanceRule } from "../types/maintenanceRule";

function cx(...xs: Array<string | false | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export default function MaintenanceRuleTable({
  rules,
  selectedRuleId,
  onSelect,
  onToggle,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  rules: MaintenanceRule[];
  selectedRuleId: string | null;
  onSelect: (id: string) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onEdit: (r: MaintenanceRule) => void;
  onDuplicate: (r: MaintenanceRule) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
        <h2 className="font-bold">룰 목록</h2>
        <div className="text-xs text-slate-500">{rules.length}개</div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-3">ON</th>
              <th className="text-left px-4 py-3">우선</th>
              <th className="text-left px-4 py-3">매칭</th>
              <th className="text-left px-4 py-3">Path</th>
              <th className="text-left px-4 py-3">타입</th>
              <th className="text-left px-4 py-3">제목</th>
              <th className="text-left px-4 py-3">액션</th>
            </tr>
          </thead>

          <tbody>
            {rules.map((r) => (
              <tr
                key={r.id}
                className={cx(
                  "border-t border-slate-100 hover:bg-slate-50 cursor-pointer",
                  selectedRuleId === r.id && "bg-indigo-50"
                )}
                onClick={() => onSelect(r.id)}
              >
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={r.enabled}
                    onChange={(e) => onToggle(r.id, e.target.checked)}
                  />
                </td>
                <td className="px-4 py-3 font-mono">{r.priority ?? 100}</td>
                <td className="px-4 py-3">{r.matchType}</td>
                <td className="px-4 py-3 font-mono">{r.path}</td>
                <td className="px-4 py-3">{r.type}</td>
                <td className="px-4 py-3 truncate max-w-[240px]">
                  {r.title || <span className="text-slate-400">-</span>}
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-2">
                    <button
                      className="text-xs rounded-lg border border-slate-300 px-2 py-1 hover:bg-white"
                      onClick={() => onEdit(r)}
                    >
                      수정
                    </button>
                    <button
                      className="text-xs rounded-lg border border-slate-300 px-2 py-1 hover:bg-white"
                      onClick={() => onDuplicate(r)}
                    >
                      복제
                    </button>
                    <button
                      className="text-xs rounded-lg border border-rose-300 text-rose-600 px-2 py-1 hover:bg-rose-50"
                      onClick={() => onDelete(r.id)}
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {rules.length === 0 && (
              <tr>
                <td className="px-4 py-10 text-center text-slate-500" colSpan={7}>
                  룰이 없습니다. “룰 추가”로 생성하세요.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
