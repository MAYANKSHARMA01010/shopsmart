import { Role } from '@prisma/client';

export interface JwtPayload {
  id: string;
  email: string;
  role: Role;
}

export type Permission =
  | 'products:create'
  | 'products:update'
  | 'products:delete'
  | 'categories:create'
  | 'categories:update'
  | 'categories:delete'
  | 'orders:read_all'
  | 'orders:update_status'
  | 'users:read_all'
  | 'users:delete'
  | 'admin:stats';

export const RolePermissions: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    'products:create', 'products:update', 'products:delete',
    'categories:create', 'categories:update', 'categories:delete',
    'orders:read_all', 'orders:update_status',
    'users:read_all', 'users:delete',
    'admin:stats'
  ],
  ADMIN: [
    'products:create', 'products:update', 'products:delete',
    'categories:create', 'categories:update', 'categories:delete',
    'orders:read_all', 'orders:update_status',
    'users:read_all',
    'admin:stats'
  ],
  VENDOR: [
    'products:create', 'products:update',
    'categories:create', 'categories:update'
  ],
  CUSTOMER: []
};
