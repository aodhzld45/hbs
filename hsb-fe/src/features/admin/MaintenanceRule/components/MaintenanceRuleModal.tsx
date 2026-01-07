import React, { useEffect, useState } from "react";
import { MatchType, MaintenanceRule, RuleType } from "../types/maintenanceRule";

function toDatetimeLocalValue(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}
function fromDatetimeLocalValue(v: string) {
  if (!v) return "";
  return new Date(v).toISOString();
}

export default function MaintenanceRuleModal({
  open,
  mode,
  draft,
  onClose,
  onSave,
}: {
  open: boolean;
  mode: "create" | "edit";
  draft: MaintenanceRule;
  onClose: () => void;
  onSave: (rule: MaintenanceRule) => void;
}) {
  const [r, setR] = useState<MaintenanceRule>(draft);

  useEffect(() => setR(draft), [draft]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-bold">{mode === "create" ? "점검 룰 추가" : "점검 룰 수정"}</h3>
          <button className="text-slate-500 hover:text-slate-700" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-600 font-medium">활성</label>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={r.enabled}
                onChange={(e) => setR({ ...r, enabled: e.target.checked })}
              />
              <span className="text-sm">{r.enabled ? "ON" : "OFF"}</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-600 font-medium">우선순위</label>
            <input
              type="number"
              className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              value={r.priority ?? 100}
              onChange={(e) => setR({ ...r, priority: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="text-xs text-slate-600 font-medium">매칭 방식</label>
            <select
              className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              value={r.matchType}
              onChange={(e) => setR({ ...r, matchType: e.target.value as MatchType })}
            >
              <option value="EXACT">EXACT</option>
              <option value="PREFIX">PREFIX</option>
              <option value="REGEX">REGEX</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-600 font-medium">대상 경로</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono"
              value={r.path}
              onChange={(e) => setR({ ...r, path: e.target.value })}
              placeholder="/ 또는 /notice 또는 ^/event/\\d+$"
            />
          </div>

          <div>
            <label className="text-xs text-slate-600 font-medium">타입</label>
            <select
              className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              value={r.type}
              onChange={(e) => setR({ ...r, type: e.target.value as RuleType })}
            >
              <option value="MAINTENANCE">MAINTENANCE</option>
              <option value="NOTICE">NOTICE</option>
              <option value="COMING_SOON">COMING_SOON</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-600 font-medium">예상 종료(옵션)</label>
            <input
              type="datetime-local"
              className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              value={toDatetimeLocalValue(r.expectedEndAt)}
              onChange={(e) => setR({ ...r, expectedEndAt: fromDatetimeLocalValue(e.target.value) })}
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs text-slate-600 font-medium">제목</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              value={r.title ?? ""}
              onChange={(e) => setR({ ...r, title: e.target.value })}
              placeholder="예: 메인 페이지 점검 중"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs text-slate-600 font-medium">설명</label>
            <textarea
              className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm min-h-[90px]"
              value={r.description ?? ""}
              onChange={(e) => setR({ ...r, description: e.target.value })}
              placeholder="예: 메인 화면 개편 작업 중입니다. 다른 메뉴는 정상 이용 가능합니다."
            />
          </div>

          <div>
            <label className="text-xs text-slate-600 font-medium">도움말 텍스트</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              value={r.helpText ?? ""}
              onChange={(e) => setR({ ...r, helpText: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs text-slate-600 font-medium">도움말 링크</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono"
              value={r.helpHref ?? ""}
              onChange={(e) => setR({ ...r, helpHref: e.target.value })}
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
          >
            취소
          </button>
          <button
            onClick={() => onSave(r)}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
