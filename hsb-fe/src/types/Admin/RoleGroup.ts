export interface RoleGroup {
    id?: number;
    name: string;
    description?: string;
    useTf: 'Y' | 'N';
  }

export interface MenuPermission {
  menuId: number;
  read: boolean;
  write: boolean;
  delete: boolean;
}

export interface RoleMenuResponse {
  menuPermissions: MenuPermission[];
}
