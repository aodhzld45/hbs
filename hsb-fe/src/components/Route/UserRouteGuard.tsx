// src/components/Route/UserRouteGuard.tsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useUserMenus } from '../../context/UserMenuContext';
import ComingSoonPage from '../../components/Common/ComingSoonPage';

export default function UserRouteGuard() {
  const location = useLocation();
  const { loading, hasPathAccess } = useUserMenus();

  // 아직 메뉴 로딩 중이면 로딩 상태 표시
  if (loading) {
    return <div className="p-8 text-gray-300">페이지 확인 중입니다...</div>;
  }

  // “메뉴 관리 대상이 아닌” 완전 공용 라우트들
  const publicPaths = [
    '/',                // 메인
    '/test',
    '/test/2depth',
    '/test/kis',
    '/test/ai',
  ];

  if (publicPaths.includes(location.pathname)) {
    return <Outlet />;
  }

  // 메뉴에서 비활성 or 등록 안 된 경로면 "준비중입니다" 페이지로
  if (!hasPathAccess(location.pathname)) {
    return <ComingSoonPage />;
  }

  return <Outlet />;
}
