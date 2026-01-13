import { useMemo, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import MaintenanceConfigPanel from "./components/MaintenanceConfigPanel";
import MaintenanceRuleTable from "./components/MaintenanceRuleTable";
import MaintenanceRuleModal from "./components/MaintenanceRuleModal";
import MaintenanceRulePreview from "./components/MaintenanceRulePreview";
import { useMaintenanceConfig } from "./hooks/useMaintenanceConfig";
import { useRuleEditor } from "./hooks/useRuleEditor";
import { MaintenanceRule } from "./types/maintenanceRule";

import AdminLayout from "../../../components/Layout/AdminLayout";
import { useAuth } from "../../../context/AuthContext";
import { fetchAdminMenus } from "../../../services/Admin/adminMenuApi";
import type { AdminMenu } from "../../../types/Admin/AdminMenu";


export default function MaintenanceRulePage() {
  /** ── 공통 헤더/메뉴 처리 ───────────────────────────────────────────── */
  const location = useLocation();
  const { admin } = useAuth();
  const [adminId, setAdminId] = useState<string | null>(admin?.id || null);
  const actorId = String(admin?.id ?? admin?.email ?? "system");
  const [currentMenuTitle, setCurrentMenuTitle] = useState<string | null>(null);
  const [menus, setMenus] = useState<(AdminMenu & { label?: string })[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState<string>("");

  // ===== 메뉴 로딩 =====
  const loadMenus = async () => {
    try {
      const data = await fetchAdminMenus();
      setMenus(data);
      const matched = data.find((m) => m.url === location.pathname);
      setCurrentMenuTitle(matched ? matched.name : null);
    } catch (e) {
      console.error(e);
      setMenuError("메뉴 목록을 불러오는데 실패했습니다.");
    } finally {
      setMenuLoading(false);
    }
  };

  useEffect(() => {
    loadMenus();
  }, [location.pathname]);

  useEffect(() => {
    setAdminId(admin?.id || null);
  }, [admin?.id]);

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
        <h2 className="text-2xl font-bold mb-4">
          {currentMenuTitle}
        </h2>
        
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">

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
