import React, { useEffect, useState } from "react";
import { CreateRequest, SiteKeyResponse, Status, UpdateRequest } from "../types/siteKey";

type Mode = "create" | "edit";
type Props = {
  open: boolean;
  mode: Mode;
  initial?: Partial<SiteKeyResponse>;
  onClose: () => void;
  onSubmit: (payload: CreateRequest | UpdateRequest) => Promise<void>;
};

type PlanCode = "FREE" | "PRO" | "ENT" | "";

// 플랜별 기본값 프리셋 (원하시는 값으로 조정해도 됨)
const PLAN_PRESETS: Record<Exclude<PlanCode, "">, {
  rateLimitRps?: number;
  dailyCallLimit?: number;
  dailyTokenLimit?: number;
  monthlyTokenLimit?: number;
}> = {
  FREE: {
    rateLimitRps: 1,
    dailyCallLimit: 50,
    dailyTokenLimit: 20_000,
    monthlyTokenLimit: 200_000,
  },
  PRO: {
    rateLimitRps: 3,
    dailyCallLimit: 500,
    dailyTokenLimit: 200_000,
    monthlyTokenLimit: 2_000_000,
  },
  ENT: {
    rateLimitRps: 10,
    // ENT는 일/월 토큰 무제한으로 두고 싶다면 undefined
    dailyCallLimit: undefined,
    dailyTokenLimit: undefined,
    monthlyTokenLimit: undefined,
  },
};

type FormErrors = {
  siteKey?: string;
};

export default function SiteKeyFormModal({ open, mode, initial, onClose, onSubmit }: Props) {
  const isCreate = mode === "create";

  const [siteKey, setSiteKey] = useState(initial?.siteKey ?? "");
  const [status, setStatus] = useState<Status>((initial?.status as Status) ?? "ACTIVE");
  const [planCode, setPlanCode] = useState<PlanCode>((initial?.planCode as PlanCode) ?? "");
  const [rateLimitRps, setRateLimitRps] = useState<number | undefined>(initial?.rateLimitRps ?? undefined);
  const [dailyCallLimit, setDailyCallLimit] = useState<number | undefined>(initial?.dailyCallLimit ?? undefined);
  const [dailyTokenLimit, setDailyTokenLimit] = useState<number | undefined>(initial?.dailyTokenLimit ?? undefined);
  const [monthlyTokenLimit, setMonthlyTokenLimit] = useState<number | undefined>(initial?.monthlyTokenLimit ?? undefined);
  const [allowedDomains, setAllowedDomains] = useState((initial?.allowedDomains ?? []).join("\n"));
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!open) return;
    setSiteKey(initial?.siteKey ?? "");
    setStatus((initial?.status as Status) ?? "ACTIVE");
    setPlanCode((initial?.planCode as PlanCode) ?? "");
    setRateLimitRps(initial?.rateLimitRps ?? undefined);
    setDailyCallLimit(initial?.dailyCallLimit ?? undefined);
    setDailyTokenLimit(initial?.dailyTokenLimit ?? undefined);
    setMonthlyTokenLimit(initial?.monthlyTokenLimit ?? undefined);
    setAllowedDomains((initial?.allowedDomains ?? []).join("\n"));
    setNotes(initial?.notes ?? "");
    setErrors({});
  }, [open, initial]);

  if (!open) return null;

  const toList = (s: string) => s.split("\n").map(v => v.trim()).filter(Boolean);

  const handleChangePlan = (value: string) => {
    const pc = value as PlanCode;
    setPlanCode(pc);

    if (pc && PLAN_PRESETS[pc]) {
      const preset = PLAN_PRESETS[pc];
      setRateLimitRps(preset.rateLimitRps);
      setDailyCallLimit(preset.dailyCallLimit);
      setDailyTokenLimit(preset.dailyTokenLimit);
      setMonthlyTokenLimit(preset.monthlyTokenLimit);
    }
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (isCreate) {
      const key = siteKey.trim();
      if (!key) {
        nextErrors.siteKey = "사이트키는 필수입니다.";
      } else if (!/^[A-Z0-9-]+$/.test(key)) {
        nextErrors.siteKey = "대문자, 숫자, 하이픈(-)만 사용할 수 있습니다.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const base = {
      status,
      planCode: planCode || undefined,
      dailyCallLimit,
      dailyTokenLimit,
      monthlyTokenLimit,
      rateLimitRps,
      allowedDomains: toList(allowedDomains),
      notes: notes?.trim() || undefined,
    };

    try {
      if (isCreate) {
        const payload: CreateRequest = { siteKey: siteKey.trim(), ...base };
        await onSubmit(payload);
      } else {
        const payload: UpdateRequest = { ...base };
        await onSubmit(payload);
      }

      alert("사이트키가 성공적으로 저장되었습니다.");
      onClose();
    } catch (e: any) {
      alert(e?.message ?? "요청 처리 중 오류가 발생했습니다.");
    }
  };

  // 공통 스타일 약간 정리
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, display: "block", marginBottom: 2 };
  const helpStyle: React.CSSProperties = { fontSize: 11, color: "#6b7280", marginTop: 2 };
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "6px 8px",
    borderRadius: 6,
    border: "1px solid #d1d5db",
    fontSize: 13,
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      <div
        style={{
          width: 720,
          maxWidth: "92vw",
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 18, fontWeight: 700 }}>
          {isCreate ? "사이트키 생성" : `사이트키 수정: ${initial?.siteKey}`}
        </h3>

        {/* 섹션 1: 기본 정보 */}
        <div style={{ marginBottom: 16, padding: 12, borderRadius: 8, background: "#f9fafb" }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>기본 정보</div>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr 1fr", gap: 12 }}>
            {isCreate && (
              <div>
                <label style={labelStyle}>
                  Site Key <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  value={siteKey}
                  onChange={e => setSiteKey(e.target.value.toUpperCase())}
                  placeholder="예) HSBS-DEMO-FREE-01"
                  style={{
                    ...inputStyle,
                    borderColor: errors.siteKey ? "#ef4444" : "#d1d5db",
                  }}
                />
                {errors.siteKey && (
                  <div style={{ ...helpStyle, color: "#ef4444" }}>{errors.siteKey}</div>
                )}
                {!errors.siteKey && (
                  <div style={helpStyle}>
                    대문자 영문, 숫자, 하이픈(-) 조합으로 입력해주세요. 예: <code>HSBS-DEMO-01</code>
                  </div>
                )}
              </div>
            )}

            {!isCreate && (
              <div>
                <label style={labelStyle}>Site Key</label>
                <div style={{ fontSize: 13, padding: "6px 8px" }}>
                  <code>{initial?.siteKey}</code>
                </div>
              </div>
            )}

            <div>
              <label style={labelStyle}>Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as Status)}
                style={inputStyle}
              >
                <option value="ACTIVE">ACTIVE (사용 가능)</option>
                <option value="SUSPENDED">SUSPENDED (일시 중지)</option>
                <option value="REVOKED">REVOKED (영구 종료)</option>
              </select>
              <div style={helpStyle}>
                • SUSPENDED: 위젯/API 호출 차단, 복구 가능<br />
                • REVOKED: 완전 종료, 복구 없이 기록만 유지
              </div>
            </div>

            <div>
              <label style={labelStyle}>Plan Code</label>
              <select
                value={planCode}
                onChange={e => handleChangePlan(e.target.value)}
                style={inputStyle}
              >
                <option value="">직접 설정</option>
                <option value="FREE">FREE</option>
                <option value="PRO">PRO</option>
                <option value="ENT">ENT</option>
              </select>
              <div style={helpStyle}>
                플랜 선택 시 아래 제한값이 자동으로 채워집니다. 이후 개별 수정도 가능합니다.
              </div>
            </div>
          </div>
        </div>

        {/* 섹션 2: 호출/토큰 제한 */}
        <div style={{ marginBottom: 16, padding: 12, borderRadius: 8, background: "#f9fafb" }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>요청/토큰 제한</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            <div>
              <label style={labelStyle}>Rate Limit RPS</label>
              <input
                type="number"
                min={0}
                value={rateLimitRps ?? ""}
                onChange={e =>
                  setRateLimitRps(e.target.value ? Math.max(0, Number(e.target.value)) : undefined)
                }
                style={inputStyle}
                placeholder="예) 1"
              />
              <div style={helpStyle}>초당 최대 호출 수 (0 또는 비우면 제한 없음)</div>
            </div>
            <div>
              <label style={labelStyle}>Daily Call Limit</label>
              <input
                type="number"
                min={0}
                value={dailyCallLimit ?? ""}
                onChange={e =>
                  setDailyCallLimit(e.target.value ? Math.max(0, Number(e.target.value)) : undefined)
                }
                style={inputStyle}
                placeholder="예) 100"
              />
              <div style={helpStyle}>하루 총 호출 횟수 (0 또는 비우면 제한 없음)</div>
            </div>
            <div>
              <label style={labelStyle}>Daily Token Limit</label>
              <input
                type="number"
                min={0}
                value={dailyTokenLimit ?? ""}
                onChange={e =>
                  setDailyTokenLimit(e.target.value ? Math.max(0, Number(e.target.value)) : undefined)
                }
                style={inputStyle}
                placeholder="예) 20000"
              />
              <div style={helpStyle}>하루 사용 가능한 토큰 수</div>
            </div>
            <div>
              <label style={labelStyle}>Monthly Token Limit</label>
              <input
                type="number"
                min={0}
                value={monthlyTokenLimit ?? ""}
                onChange={e =>
                  setMonthlyTokenLimit(
                    e.target.value ? Math.max(0, Number(e.target.value)) : undefined
                  )
                }
                style={inputStyle}
                placeholder="예) 200000"
              />
              <div style={helpStyle}>월간 사용 가능한 토큰 수</div>
            </div>
          </div>
        </div>

        {/* 섹션 3: 도메인 / 메모 */}
        <div style={{ marginBottom: 16, padding: 12, borderRadius: 8, background: "#f9fafb" }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>도메인 / 비고</div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Allowed Domains (한 줄에 하나)</label>
            <textarea
              rows={4}
              value={allowedDomains}
              onChange={e => setAllowedDomains(e.target.value)}
              style={{ ...inputStyle, resize: "vertical" }}
              placeholder={`예)\nhttps://www.hsbs.kr\nhttps://demo.hsbs.kr\nhttps://localhost:5173`}
            />
            <div style={helpStyle}>
              완전한 Origin 또는 도메인을 한 줄에 하나씩 입력합니다. 비워두면 모든 도메인에서 사용 가능합니다.
            </div>
          </div>

          <div>
            <label style={labelStyle}>Notes</label>
            <input
              value={notes ?? ""}
              onChange={e => setNotes(e.target.value)}
              style={inputStyle}
              placeholder="내부 메모용 (예: 테스트용, 특정 고객사 이름 등)"
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose}>취소</button>
          <button
            onClick={handleSubmit}
            style={{
              background: "#111827",
              color: "#fff",
              padding: "8px 14px",
              borderRadius: 8,
            }}
          >
            {isCreate ? "생성" : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
