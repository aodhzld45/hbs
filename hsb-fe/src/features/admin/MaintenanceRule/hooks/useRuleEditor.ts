import { useCallback, useState } from "react";
import { MaintenanceRule } from "../types/maintenanceRule";

export function createNewRuleDraft(): MaintenanceRule {
  return {
    id: `rule-${Date.now()}`,
    enabled: true,
    matchType: "EXACT",
    path: "/",
    type: "MAINTENANCE",
    title: "",
    description: "",
    expectedEndAt: "",
    helpText: "",
    helpHref: "",
    priority: 100,
  };
}

export function useRuleEditor() {
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [draft, setDraft] = useState<MaintenanceRule>(createNewRuleDraft());

  const openCreate = useCallback(() => {
    setMode("create");
    setDraft(createNewRuleDraft());
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((rule: MaintenanceRule) => {
    setMode("edit");
    setDraft(rule);
    setModalOpen(true);
  }, []);

  const close = useCallback(() => setModalOpen(false), []);

  return {
    selectedRuleId,
    setSelectedRuleId,

    modalOpen,
    mode,
    draft,
    setDraft,

    openCreate,
    openEdit,
    close,
  };
}
