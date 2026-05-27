import React from "react";
import { SiteKeyResponse } from "../types/siteKey";

type Props = {
  siteKey: SiteKeyResponse | null;
  onClear: () => void;
};

type ChecklistItem = {
  label: string;
  ok: boolean;
  detail: string;
};

const StatusPill = ({ ok }: { ok: boolean }) => (
  <span
    className={`inline-flex min-w-[52px] justify-center rounded px-2 py-0.5 text-xs font-semibold ${
      ok ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
    }`}
  >
    {ok ? "정상" : "확인"}
  </span>
);

export default function SiteKeyOperationalChecklist({ siteKey, onClear }: Props) {
  const items: ChecklistItem[] = siteKey
    ? [
        {
          label: "SiteKey 활성 상태",
          ok: siteKey.status === "ACTIVE" && siteKey.useTf !== "N",
          detail: `status=${siteKey.status}, useTf=${siteKey.useTf ?? "-"}`,
        },
        {
          label: "허용 도메인",
          ok: (siteKey.allowedDomains?.length ?? 0) > 0,
          detail:
            (siteKey.allowedDomains?.length ?? 0) > 0
              ? siteKey.allowedDomains.join(", ")
              : "허용 도메인이 없으면 /api/ai/ping 단계에서 차단됩니다.",
        },
        {
          label: "기본 WidgetConfig 연결",
          ok: siteKey.defaultWidgetConfigId != null,
          detail:
            siteKey.defaultWidgetConfigId != null
              ? `defaultWidgetConfigId=${siteKey.defaultWidgetConfigId}`
              : "연결이 비어 있으면 public widget-config 조회가 실패할 수 있습니다.",
        },
        {
          label: "기본 PromptProfile 연결",
          ok: siteKey.defaultPromptProfileId != null,
          detail:
            siteKey.defaultPromptProfileId != null
              ? `defaultPromptProfileId=${siteKey.defaultPromptProfileId}`
              : "연결이 비어 있으면 welcomeBlocks와 complete4 프롬프트 조립이 실패할 수 있습니다.",
        },
        {
          label: "설치 SDK 경로",
          ok: true,
          detail: "/sdk/v1/hsbs-loader.js",
        },
      ]
    : [];

  const hasWarning = items.some((item) => !item.ok);

  return (
    <section className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900">위젯 운영 체크리스트</h3>
          <p className="mt-1 text-xs text-gray-500">
            SiteKey, WidgetConfig, PromptProfile 연결 상태를 기준으로 public SDK 노출 가능 여부를 확인합니다.
          </p>
        </div>
        {siteKey && (
          <button type="button" onClick={onClear} className="self-start rounded border px-3 py-1 text-xs text-gray-600 hover:bg-gray-50">
            선택 해제
          </button>
        )}
      </div>

      {!siteKey ? (
        <div className="mt-3 rounded bg-gray-50 px-3 py-2 text-xs text-gray-600">
          목록에서 점검 버튼을 누르면 해당 SiteKey의 운영 연결 상태가 표시됩니다.
        </div>
      ) : (
        <>
          <div
            className={`mt-3 rounded px-3 py-2 text-xs ${
              hasWarning ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {hasWarning
              ? "연결 누락 항목이 있습니다. 누락 항목을 보완해야 외부 위젯이 안정적으로 표시됩니다."
              : "필수 연결 항목이 준비되어 있습니다."}
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full table-auto border text-sm">
              <thead className="bg-gray-50 text-left text-xs text-gray-500">
                <tr>
                  <th className="p-2">점검 항목</th>
                  <th className="p-2">상태</th>
                  <th className="p-2">상세</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.label} className="border-t">
                    <td className="p-2 font-medium text-gray-700">{item.label}</td>
                    <td className="p-2"><StatusPill ok={item.ok} /></td>
                    <td className="p-2 text-xs text-gray-600">{item.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
