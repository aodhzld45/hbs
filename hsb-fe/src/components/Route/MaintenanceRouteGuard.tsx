import React, { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import ComingSoonPage from "../Common/ComingSoonPage";
import {
  DEFAULT_MAINTENANCE_CONFIG,
  MaintenanceConfig,
  MaintenanceRule,
} from "../../features/admin/MaintenanceRule/types/maintenanceRule";

import { getPublicMaintenanceConfig } from "../../features/admin/MaintenanceRule/services/maintenancePublicApi";

function normalizePath(p: string) {
  const x = (p || "/").replace(/\/+$/, "");
  return x === "" ? "/" : x;
}

function matchesRule(pathname: string, rule: MaintenanceRule): boolean {
  if (!rule.enabled) return false;

  const p = normalizePath(pathname);
  const rulePath = normalizePath(rule.path);

  switch (rule.matchType) {
    case "EXACT":
      return p === rulePath;

    case "PREFIX":
      // "/"를 prefix로 두면 전체 매칭
      if (rulePath === "/") return true;
      return p === rulePath || p.startsWith(rulePath + "/");

    case "REGEX":
      try {
        return new RegExp(rule.path).test(p);
      } catch {
        return false;
      }

    default:
      return false;
  }
}

function pickMatchedRule(pathname: string, cfg: MaintenanceConfig): MaintenanceRule | null {
  const rules = [...(cfg.rules ?? [])]
    .filter((r) => r.enabled)
    .sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100));

  return rules.find((r) => matchesRule(pathname, r)) ?? null;
}

export default function MaintenanceRouteGuard() {
  const location = useLocation();
  const [checked, setChecked] = useState(false);
  const [cfg, setCfg] = useState<MaintenanceConfig>(DEFAULT_MAINTENANCE_CONFIG);

  // 설정 로드 + 폴링
  useEffect(() => {
    let alive = true;
    let timer: number | null = null;

    const tick = async () => {
      try {
        const next = await getPublicMaintenanceConfig();
        if (!alive) return;

        setCfg({
          ...DEFAULT_MAINTENANCE_CONFIG,
          ...next,
          rules: next.rules ?? [],
          enabled: Boolean(next.enabled),
        });
      } catch {
        // fail-open: 조회 실패 시 점검 OFF로(사이트 접근 유지)
        if (!alive) return;
        setCfg(DEFAULT_MAINTENANCE_CONFIG);
      } finally {
        if (!alive) return;
        setChecked(true);

        // 다음 폴링 예약 (설정값 반영)
        const sec = Math.max(5, Number((cfg.pollIntervalSec ?? 15)));
        timer = window.setTimeout(tick, sec * 1000);
      }
    };

    tick();
    return () => {
      alive = false;
      if (timer) window.clearTimeout(timer);
    };
    // cfg.pollIntervalSec를 deps에 넣으면 매번 재시작되므로 의도적으로 비움
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pathname = location.pathname;
  // 부분 점검(룰 매칭) - useMemo를 최상위 레벨로 이동
  const matched = useMemo(() => pickMatchedRule(pathname, cfg), [pathname, cfg]);

  // 깜빡임 방지
  if (!checked) return null;

  // 관리자 bypass
  const bypass = cfg.adminBypassPrefix ?? "/admin";
  if (pathname === bypass || pathname.startsWith(bypass + "/")) {
    return <Outlet />;
  }

  // 전체 점검 enabled=true면 사용자 영역 전체 ComingSoon
  if (cfg.enabled) {
    return (
      <ComingSoonPage
        type="MAINTENANCE"
        title="시스템 점검중"
        description="현재 시스템은 점검중입니다. 잠시 후 다시 시도해주세요."
      />
    );
  }

  if (matched) {
    return (
      <ComingSoonPage
        type={matched.type}
        title={matched.title}
        description={matched.description}
        expectedEndAt={matched.expectedEndAt}
        helpText={matched.helpText}
        helpHref={matched.helpHref}
      />
    );
  }

  return <Outlet />;
}
