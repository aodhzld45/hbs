import React, { useMemo } from "react";
import MaintenanceConfigPanel from "./components/MaintenanceConfigPanel";
import MaintenanceRuleTable from "./components/MaintenanceRuleTable";
import MaintenanceRuleModal from "./components/MaintenanceRuleModal";
import MaintenanceRulePreview from "./components/MaintenanceRulePreview";
import { useMaintenanceConfig } from "./hooks/useMaintenanceConfig";
import { useRuleEditor } from "./hooks/useRuleEditor";
import { MaintenanceRule } from "./types/maintenanceRule";
import AdminLayout from "../../../components/Layout/AdminLayout";


export default function MaintenanceRulePage() {
  const {
    config,
    setConfig,
    loading,
    saving,
    error,
    sortedRules,
    save,
    upsertRule,
    removeRule,
    toggleRule,
    duplicateRule,
  } = useMaintenanceConfig();

  const editor = useRuleEditor();

  const selectedRule = useMemo(() => {
    return sortedRules.find((r) => r.id === editor.selectedRuleId) ?? null;
  }, [sortedRules, editor.selectedRuleId]);

  const onDuplicate = (r: MaintenanceRule) => {
    const newId = duplicateRule(r);
    editor.setSelectedRuleId(newId);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-xl font-bold">점검 페이지 관리</h1>
            <p className="text-sm text-slate-500 mt-1">
              관리자(/admin)는 제외하고, 지정한 URL만 ComingSoonPage로 전환합니다.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={editor.openCreate}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
            >
              + 룰 추가
            </button>
            <button
              onClick={save}
              disabled={saving}
              className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${
                saving ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-500"
              }`}
            >
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="mb-6">
          <MaintenanceConfigPanel config={config} onChange={setConfig} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
                로딩 중...
              </div>
            ) : (
              <MaintenanceRuleTable
                rules={sortedRules}
                selectedRuleId={editor.selectedRuleId}
                onSelect={editor.setSelectedRuleId}
                onToggle={toggleRule}
                onEdit={editor.openEdit}
                onDuplicate={onDuplicate}
                onDelete={(id) => {
                  removeRule(id);
                  if (editor.selectedRuleId === id) editor.setSelectedRuleId(null);
                }}
              />
            )}
          </div>

          <MaintenanceRulePreview rule={selectedRule} />
        </div>

        <MaintenanceRuleModal
          open={editor.modalOpen}
          mode={editor.mode}
          draft={editor.draft}
          onClose={editor.close}
          onSave={(r) => {
            upsertRule(r);
            editor.setSelectedRuleId(r.id);
            editor.close();
          }}
        />
      </div>
    </AdminLayout>
  );
}
