import type { ComponentType } from 'react';

import ContentManager from '../../pages/Admin/Content/ContentManager';
import SqlProblemManager from '../../features/admin/SqlProblem';
import AdminDashboard from '../../pages/Admin';
import AdminList from '../../pages/Admin/AdminAccountManagement';
import AdminMenu from '../../pages/Admin/Menu/AdminMenuManagement';
import AdminAuthManagement from '../../pages/Admin/Role/AdminRoleManagement';
import AdminLogManager from '../../pages/Admin/Log/AdminLogManager';
import UserMenuManager from '../../pages/Admin/Menu/UserMenuManager';
import CodeManager from '../../pages/Admin/Code/CodeManager';
import ContactManager from '../../features/admin/Contact';
import CorsOriginPage from '../../features/admin/CorsOrigin';
import MaintenanceRulePage from '../../features/admin/MaintenanceRule';
import PopupBannerManager from '../../pages/Admin/Main/PopupBannerManager';
import PageManager from '../../pages/Admin/Page/PageManager';
import BoardConfigManager from '../../pages/Admin/BoardConfig/BoardConfigManager';
import BlockIp from '../../features/admin/BlockIp';
import AdminSiteKeys from '../../features/admin/Ai/AdminSiteKeys';
import AdminWidgetConfig from '../../features/admin/Ai/AdminWidgetConfig';
import AdminPromptProfile from '../../features/admin/Ai/PromptProfile';
import AdminUsageStats from '../../features/admin/Ai/AdminUsageStats';
import AdminKbSourse from '../../features/admin/Ai/KbSource';
import AdminKbDocument from '../../features/admin/Ai/KbDocument';
import BoardManager from '../../pages/Admin/Board/BoardManager';

export interface AdminRouteComponentOption {
  key: string;
  label: string;
}

interface AdminRouteComponentDefinition extends AdminRouteComponentOption {
  component: ComponentType;
  aliases?: string[];
  legacyPaths?: string[];
}

const normalizeComponentKey = (value?: string | null) =>
  (value ?? '').trim().toLowerCase().replace(/[\s_-]+/g, '');

const ADMIN_ROUTE_COMPONENTS: AdminRouteComponentDefinition[] = [
  // {
  //   key: 'AdminDashboard',
  //   label: '대시보드',
  //   component: AdminDashboard,
  //   aliases: ['dashboard'],
  //   legacyPaths: ['/admin/index'],
  // },
  {
    key: 'PageManager',
    label: '페이지 관리',
    component: PageManager,
    aliases: ['page-manager'],
    legacyPaths: ['/admin/page-manager'],
  },
  {
    key: 'ContentManager',
    label: '콘텐츠 관리',
    component: ContentManager,
    aliases: ['content-manager'],
    legacyPaths: ['/admin/content-manager'],
  },
  {
    key: 'AdminSiteKeys',
    label: 'AI 사이트키 관리',
    component: AdminSiteKeys,
    aliases: ['site-keys'],
    legacyPaths: ['/admin/ai/site-keys'],
  },
  {
    key: 'AdminWidgetConfig',
    label: 'AI 위젯 설정',
    component: AdminWidgetConfig,
    aliases: ['widget-configs'],
    legacyPaths: ['/admin/ai/widget-configs'],
  },
  {
    key: 'AdminPromptProfile',
    label: '프롬프트 프로필',
    component: AdminPromptProfile,
    aliases: ['prompt-profiles'],
    legacyPaths: ['/admin/ai/prompt-profiles'],
  },
  {
    key: 'AdminUsageStats',
    label: 'AI 사용 통계',
    component: AdminUsageStats,
    aliases: ['usage-stats'],
    legacyPaths: ['/admin/ai/usage-stats'],
  },
  {
    key: 'AdminKbSource',
    label: 'KB 소스',
    component: AdminKbSourse,
    aliases: ['kb-source'],
    legacyPaths: ['/admin/kb/kb-source', '/admin/ai/kb-source'],
  },
  {
    key: 'AdminKbDocument',
    label: 'KB 문서',
    component: AdminKbDocument,
    aliases: ['kb-document'],
    legacyPaths: ['/admin/kb/kb-document', '/admin/ai/kb-document'],
  },
  {
    key: 'SqlProblemManager',
    label: 'SQL 문제 관리',
    component: SqlProblemManager,
    aliases: ['sql-manager'],
    legacyPaths: ['/admin/sql-manager'],
  },
  {
    key: 'AdminList',
    label: '관리자 계정 관리',
    component: AdminList,
    aliases: ['admin-manager'],
    legacyPaths: ['/admin/admin-manager'],
  },
  {
    key: 'AdminAuthManagement',
    label: '권한 관리',
    component: AdminAuthManagement,
    aliases: ['auth-management'],
    legacyPaths: ['/admin/auth-management'],
  },
  {
    key: 'AdminMenuManagement',
    label: '관리자 메뉴 관리',
    component: AdminMenu,
    aliases: ['admin-menu'],
    legacyPaths: ['/admin/admin-menu'],
  },
  {
    key: 'AdminLogManager',
    label: '로그 관리',
    component: AdminLogManager,
    aliases: ['log-manager'],
    legacyPaths: ['/admin/log-manager'],
  },
  {
    key: 'UserMenuManager',
    label: '사용자 메뉴 관리',
    component: UserMenuManager,
    aliases: ['user-menu-manager'],
    legacyPaths: ['/admin/user-menu-manager'],
  },
  {
    key: 'CodeManager',
    label: '코드 관리',
    component: CodeManager,
    aliases: ['code-manager'],
    legacyPaths: ['/admin/code-manager'],
  },
  {
    key: 'BoardConfigManager',
    label: '게시판 설정',
    component: BoardConfigManager,
    aliases: ['board-config'],
    legacyPaths: ['/admin/board-config'],
  },
  {
    key: 'BoardManager',
    label: '게시판 관리',
    component: BoardManager,
    aliases: ['board-manager'],
  },
  {
    key: 'ContactManager',
    label: '문의 관리',
    component: ContactManager,
    aliases: ['contact-manager', 'contact'],
    legacyPaths: ['/admin/contact'],
  },
  {
    key: 'CorsOriginPage',
    label: 'CORS Origin 관리',
    component: CorsOriginPage,
    aliases: ['cors-origins'],
    legacyPaths: ['/admin/cors-origins'],
  },
  {
    key: 'MaintenanceRulePage',
    label: '점검 규칙 관리',
    component: MaintenanceRulePage,
    aliases: ['maintenance'],
    legacyPaths: ['/admin/maintenance'],
  },
  {
    key: 'BlockIp',
    label: '차단 IP 관리',
    component: BlockIp,
    aliases: ['block-ip', 'block-ips'],
    legacyPaths: ['/admin/block-ips'],
  },
  {
    key: 'PopupBannerManager',
    label: '팝업 배너 관리',
    component: PopupBannerManager,
    aliases: ['popup-banner-manager'],
    legacyPaths: ['/admin/main/popup-banner-manager'],
  },
];

const componentRegistry = new Map<string, ComponentType>();
const legacyPathRegistry = new Map<string, ComponentType>();

for (const definition of ADMIN_ROUTE_COMPONENTS) {
  const aliases = [definition.key, ...(definition.aliases ?? [])];

  for (const alias of aliases) {
    componentRegistry.set(normalizeComponentKey(alias), definition.component);
  }

  for (const path of definition.legacyPaths ?? []) {
    legacyPathRegistry.set(path, definition.component);
  }
}

export const adminRouteComponentOptions: AdminRouteComponentOption[] =
  ADMIN_ROUTE_COMPONENTS.map(({ key, label }) => ({ key, label }));

export function resolveAdminRouteComponent(
  componentKey?: string | null,
  url?: string | null
): ComponentType | null {
  const normalizedKey = normalizeComponentKey(componentKey);

  if (normalizedKey) {
    return componentRegistry.get(normalizedKey) ?? null;
  }

  if (url) {
    return legacyPathRegistry.get(url) ?? null;
  }

  return null;
}
