import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useUserMenus } from "../../context/UserMenuContext";
import ComingSoonPage from "../Common/ComingSoonPage";

export default function UserRouteGuard() {
  const location = useLocation();
  const { loading, hasPathAccess } = useUserMenus();

  if (loading) {
    return <div className="p-8 text-gray-300">페이지 확인 중입니다...</div>;
  }

  // “메뉴 관리 대상이 아닌” 완전 공용 라우트들
  const publicPaths = ["/", "/test", "/test/2depth", "/test/kis", "/test/ai"];

  if (publicPaths.includes(location.pathname)) {
    return <Outlet />;
  }

  // 메뉴에서 비활성/미등록이면 준비중(접근 제한) 페이지
  if (!hasPathAccess(location.pathname)) {
    return (
      <ComingSoonPage
        type="COMING_SOON"
        title="접근이 제한된 페이지입니다."
        description="현재 메뉴 상태 또는 공개 정책에 따라 직접 접근이 제한될 수 있습니다."
      />
    );
  }

  return <Outlet />;
}
