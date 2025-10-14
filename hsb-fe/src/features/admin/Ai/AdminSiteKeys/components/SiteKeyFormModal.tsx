// src/admin/Ai/AdminSiteKeys/components/SiteKeyFormModal.tsx
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

export default function SiteKeyFormModal({ open, mode, initial, onClose, onSubmit }: Props) {
  const isCreate = mode === "create";
  const [siteKey, setSiteKey] = useState(initial?.siteKey ?? "");
  const [status, setStatus] = useState<Status>((initial?.status as Status) ?? "ACTIVE");
  const [planCode, setPlanCode] = useState(initial?.planCode ?? "");
  const [rateLimitRps, setRateLimitRps] = useState<number | undefined>(initial?.rateLimitRps ?? undefined);
  const [dailyCallLimit, setDailyCallLimit] = useState<number | undefined>(initial?.dailyCallLimit ?? undefined);
  const [dailyTokenLimit, setDailyTokenLimit] = useState<number | undefined>(initial?.dailyTokenLimit ?? undefined);
  const [monthlyTokenLimit, setMonthlyTokenLimit] = useState<number | undefined>(initial?.monthlyTokenLimit ?? undefined);
  const [allowedDomains, setAllowedDomains] = useState((initial?.allowedDomains ?? []).join("\n"));
  const [notes, setNotes] = useState(initial?.notes ?? "");

  useEffect(() => {
    if (!open) return;
    setSiteKey(initial?.siteKey ?? "");
    setStatus((initial?.status as Status) ?? "ACTIVE");
    setPlanCode(initial?.planCode ?? "");
    setRateLimitRps(initial?.rateLimitRps ?? undefined);
    setDailyCallLimit(initial?.dailyCallLimit ?? undefined);
    setDailyTokenLimit(initial?.dailyTokenLimit ?? undefined);
    setMonthlyTokenLimit(initial?.monthlyTokenLimit ?? undefined);
    setAllowedDomains((initial?.allowedDomains ?? []).join("\n"));
    setNotes(initial?.notes ?? "");
  }, [open, initial]);

  if (!open) return null;

  const toList = (s: string) => s.split("\n").map(v => v.trim()).filter(Boolean);

  const handleSubmit = async () => {
    if (isCreate) {
      const payload: CreateRequest = {
        siteKey: siteKey.trim(),
        status,
        planCode: planCode?.trim() || undefined,
        dailyCallLimit, dailyTokenLimit, monthlyTokenLimit, rateLimitRps,
        allowedDomains: toList(allowedDomains),
        notes: notes?.trim() || undefined,
      };
      await onSubmit(payload);
    } else {
      const payload: UpdateRequest = {
        status,
        planCode: planCode?.trim() || undefined,
        dailyCallLimit, dailyTokenLimit, monthlyTokenLimit, rateLimitRps,
        allowedDomains: toList(allowedDomains),
        notes: notes?.trim() || undefined,
      };
      await onSubmit(payload);
    }
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
      <div style={{ width: 680, maxWidth: "92vw", background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
        <h3 style={{ marginTop: 0 }}>{isCreate ? "Create Site Key" : `Edit Site Key: ${initial?.siteKey}`}</h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {isCreate && (
            <div>
              <label>Site Key *</label>
              <input value={siteKey} onChange={e => setSiteKey(e.target.value)} placeholder="HSBS-DEMO" style={{ width: "100%" }}/>
            </div>
          )}
          <div>
            <label>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value as Status)} style={{ width: "100%" }}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="REVOKED">REVOKED</option>
            </select>
          </div>
          <div>
            <label>Plan Code</label>
            <input value={planCode ?? ""} onChange={e => setPlanCode(e.target.value)} placeholder="FREE/PRO/ENT" style={{ width: "100%" }}/>
          </div>
          <div>
            <label>Rate Limit RPS</label>
            <input type="number" value={rateLimitRps ?? ""} onChange={e => setRateLimitRps(e.target.value ? Number(e.target.value) : undefined)} style={{ width: "100%" }}/>
          </div>

          <div>
            <label>Daily Call Limit</label>
            <input type="number" value={dailyCallLimit ?? ""} onChange={e => setDailyCallLimit(e.target.value ? Number(e.target.value) : undefined)} style={{ width: "100%" }}/>
          </div>
          <div>
            <label>Daily Token Limit</label>
            <input type="number" value={dailyTokenLimit ?? ""} onChange={e => setDailyTokenLimit(e.target.value ? Number(e.target.value) : undefined)} style={{ width: "100%" }}/>
          </div>
          <div>
            <label>Monthly Token Limit</label>
            <input type="number" value={monthlyTokenLimit ?? ""} onChange={e => setMonthlyTokenLimit(e.target.value ? Number(e.target.value) : undefined)} style={{ width: "100%" }}/>
          </div>

          <div style={{ gridColumn: "1/3" }}>
            <label>Allowed Domains (한 줄에 하나)</label>
            <textarea rows={5} value={allowedDomains} onChange={e => setAllowedDomains(e.target.value)} style={{ width: "100%" }}/>
          </div>

          <div style={{ gridColumn: "1/3" }}>
            <label>Notes</label>
            <input value={notes ?? ""} onChange={e => setNotes(e.target.value)} style={{ width: "100%" }}/>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
          <button onClick={onClose}>취소</button>
          <button onClick={handleSubmit} style={{ background: "#111827", color: "#fff", padding: "8px 14px", borderRadius: 8 }}>
            {isCreate ? "생성" : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
