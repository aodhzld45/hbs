export interface RoleGroup {
    id?: number;
    name: string;
    description?: string;
    useTf: 'Y' | 'N';
  }

export interface MenuMapping {
  menuId: number;
  read: boolean;
  write: boolean;
  delete: boolean;
}

export interface MenuPermission {
  menuId: number;
  name: string;
  url: string;
  depth: number;
  orderSequence: number;
  parentId: number | null;
  read: boolean;
  write: boolean;
  delete: boolean;
}

export interface RoleMenuResponse {
  menuPermissions: MenuPermission[];
  menuMappings: MenuMapping[];
}

export interface UserRoleAssign {
  adminId: string;
  adminName: string;
  email: string;
  roleId: number;
  roleName: string;
}
