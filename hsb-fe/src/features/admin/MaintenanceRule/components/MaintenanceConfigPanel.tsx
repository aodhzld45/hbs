import React from "react";
import { MaintenanceConfig } from "../types/maintenanceRule";

export default function MaintenanceConfigPanel({
  config,
  onChange,
}: {
  config: MaintenanceConfig;
  onChange: (next: MaintenanceConfig) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-xs text-slate-600 font-medium">전체 사용</label>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => onChange({ ...config, enabled: e.target.checked })}
            />
            <span className="text-sm">{config.enabled ? "ON" : "OFF"}</span>
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-600 font-medium">폴링 주기(초)</label>
          <input
            type="number"
            min={5}
            className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            value={config.pollIntervalSec ?? 15}
            onChange={(e) => onChange({ ...config, pollIntervalSec: Number(e.target.value) })}
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-slate-600 font-medium">관리자 bypass prefix</label>
          <input
            className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono"
            value={config.adminBypassPrefix ?? "/admin"}
            onChange={(e) => onChange({ ...config, adminBypassPrefix: e.target.value })}
            placeholder="/admin"
          />
        </div>
      </div>

      <div className="mt-3 text-xs text-slate-500">
        메인만 막기: <span className="font-mono">path="/"</span> + <b>EXACT</b>
      </div>
    </div>
  );
}
