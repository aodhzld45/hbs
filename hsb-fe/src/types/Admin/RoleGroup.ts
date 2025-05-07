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
  parentId: number | null;
  read: boolean;
  write: boolean;
  delete: boolean;
}

export interface RoleMenuResponse {
  menuPermissions: MenuPermission[];
  menuMappings: MenuMapping[];
  //menuPermissions2: MenuPermission2[];
}

// export interface RoleMenuResponse2 {
//   menuPermissions2: MenuPermission2[];
// }

export interface UserRoleAssign {
  adminId: string;
  adminName: string;
  email: string;
  roleId: number;
  roleName: string;
}
