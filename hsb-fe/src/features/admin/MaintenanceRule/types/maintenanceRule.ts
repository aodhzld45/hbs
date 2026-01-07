export type MatchType = "EXACT" | "PREFIX" | "REGEX";
export type RuleType = "MAINTENANCE" | "COMING_SOON" | "NOTICE";

export type MaintenanceRule = {
  id: string;
  enabled: boolean;
  matchType: MatchType;
  path: string;
  type: RuleType;

  title?: string;
  description?: string;

  expectedEndAt?: string; // ISO string
  helpText?: string;
  helpHref?: string;

  priority?: number;
};

export type MaintenanceConfig = {
  enabled: boolean;
  pollIntervalSec?: number;
  adminBypassPrefix?: string;
  rules: MaintenanceRule[];
};

export const DEFAULT_MAINTENANCE_CONFIG: MaintenanceConfig = {
  enabled: false,
  pollIntervalSec: 15,
  adminBypassPrefix: "/admin",
  rules: [],
};
