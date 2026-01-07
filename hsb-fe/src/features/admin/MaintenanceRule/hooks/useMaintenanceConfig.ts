import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_MAINTENANCE_CONFIG,
  MaintenanceConfig,
  MaintenanceRule,
} from "../types/maintenanceRule";
import { getMaintenanceConfig, saveMaintenanceConfig } from "../services/maintenanceRuleApi";

export function useMaintenanceConfig() {
  const [config, setConfig] = useState<MaintenanceConfig>(DEFAULT_MAINTENANCE_CONFIG);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedRules = useMemo(() => {
    return [...(config.rules ?? [])].sort(
      (a, b) => (a.priority ?? 100) - (b.priority ?? 100)
    );
  }, [config.rules]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMaintenanceConfig();
      setConfig({ ...DEFAULT_MAINTENANCE_CONFIG, ...data, rules: data.rules ?? [] });
    } catch (e: any) {
      setError(e?.message ?? "로드 실패");
    } finally {
      setLoading(false);
    }
  }, []);

  const save = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);
      await saveMaintenanceConfig({
        ...config,
        pollIntervalSec: Number(config.pollIntervalSec ?? 15),
        adminBypassPrefix: config.adminBypassPrefix ?? "/admin",
        rules: config.rules ?? [],
      });
    } catch (e: any) {
      setError(e?.message ?? "저장 실패");
    } finally {
      setSaving(false);
    }
  }, [config]);

  useEffect(() => {
    load();
  }, [load]);

  // ---- rule ops ----
  const upsertRule = useCallback((rule: MaintenanceRule) => {
    setConfig((prev) => {
      const exists = prev.rules.some((r) => r.id === rule.id);
      const nextRules = exists
        ? prev.rules.map((r) => (r.id === rule.id ? rule : r))
        : [rule, ...prev.rules];
      return { ...prev, rules: nextRules };
    });
  }, []);

  const removeRule = useCallback((id: string) => {
    setConfig((prev) => ({ ...prev, rules: prev.rules.filter((r) => r.id !== id) }));
  }, []);

  const toggleRule = useCallback((id: string, enabled: boolean) => {
    setConfig((prev) => ({
      ...prev,
      rules: prev.rules.map((r) => (r.id === id ? { ...r, enabled } : r)),
    }));
  }, []);

  const duplicateRule = useCallback((rule: MaintenanceRule) => {
    const copy: MaintenanceRule = { ...rule, id: `rule-${Date.now()}` };
    setConfig((prev) => ({ ...prev, rules: [copy, ...prev.rules] }));
    return copy.id;
  }, []);

  return {
    config,
    setConfig,

    loading,
    saving,
    error,

    sortedRules,

    load,
    save,

    upsertRule,
    removeRule,
    toggleRule,
    duplicateRule,
  };
}
