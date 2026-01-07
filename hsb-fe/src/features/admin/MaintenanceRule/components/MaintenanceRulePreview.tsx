import React from "react";
import { MaintenanceRule } from "../types/maintenanceRule";

function cx(...xs: Array<string | false | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export default function MaintenanceRulePreview({ rule }: { rule: MaintenanceRule | null }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="px-5 py-4 border-b border-slate-200">
        <h2 className="font-bold">프리뷰(요약)</h2>
      </div>

      <div className="p-5">
        {!rule ? (
          <div className="text-sm text-slate-500">
            왼쪽에서 룰을 선택하면 ComingSoonPage에 주입될 내용을 요약해서 보여줍니다.
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{rule.title || "(제목 없음)"}</div>
              <span
                className={cx(
                  "text-xs px-2 py-1 rounded-full",
                  rule.enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                )}
              >
                {rule.enabled ? "ON" : "OFF"}
              </span>
            </div>

            <div className="mt-2 text-xs text-slate-600 font-mono">
              {rule.matchType} · {rule.path} · priority {rule.priority ?? 100}
            </div>

            {rule.description && (
              <p className="mt-3 text-sm text-slate-600 whitespace-pre-line">{rule.description}</p>
            )}

            {rule.expectedEndAt && (
              <div className="mt-3 text-xs text-slate-500">
                예상 종료: {new Date(rule.expectedEndAt).toLocaleString("ko-KR")}
              </div>
            )}

            {(rule.helpText || rule.helpHref) && (
              <div className="mt-3 text-xs">
                <span className="text-slate-500">링크:</span>{" "}
                <span className="font-mono">{rule.helpText || "보기"}</span>{" "}
                <span className="text-slate-400">→</span>{" "}
                <span className="font-mono text-indigo-600">{rule.helpHref}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
