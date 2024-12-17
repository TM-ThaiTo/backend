import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { RoleServiceDB } from '@/access_control/role/handle/role.db';
import { PermissionServiceDB } from '@/access_control/permission/handle/permission.db';
import { UpdateRoleDto } from '@/access_control/role/dto/update-role.dto';

@Injectable()
export class RoleService implements OnModuleInit {
  constructor(
    private readonly handleRoleDB: RoleServiceDB,
    private readonly handlePermissionDB: PermissionServiceDB
  ) { }

  async onModuleInit() { await this.handleRoleDB.initRoleSuperAdmin_NormalUser(); }

  async checkItemRoleAccess(roleName: string, path: string, method: string) {
    try {
      const role = await this.handleRoleDB.findRoleByRoleName(roleName);
      if (!role) return false;
      const permissionList = role.permission;

      for (const item of permissionList) {
        const permission = await this.handlePermissionDB.findPermissionByIdAndEndpointAndMethod(item, path, method);
        if (!permission) continue;  // Nếu không tìm thấy permission, tiếp tục kiểm tra
        if (permission.endpoint === path && permission.method === method) return true;  // Nếu phù hợp, trả về true
      }
      return false;
    } catch (e) { console.log('-> checkItemRoleAccess error', e); }
  }

  async checkRoleAndPermissionByAccount(account: any, path: string, method: string): Promise<boolean> {
    const rolesAccount = account.roles;
    for (const itemRole of rolesAccount) {
      const check = await this.checkItemRoleAccess(itemRole, path, method);  // Gọi hàm checkItemRoleAccess
      if (check) return true;  // Nếu có quyền truy cập, trả về true
    }
    return false;
  }

  async getAllPermissionsByRoleName(role_name: string) {
    const roles = await this.handleRoleDB.findRoleByRoleName(role_name);
    if (!roles) throw new NotFoundException('No role found');

    const permissionList = roles.permission;
    const permissionItems = await Promise.all(permissionList.map(async (item) => {
      const permission = await this.handlePermissionDB.findOnePermissionById(item);
      return permission;
    }));

    return {
      code: 0,
      message: 'Get roles and permission successfully',
      data: {
        role: roles,
        permission: permissionItems
      }
    }
  }

  async getAllRole(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const roles = await this.handleRoleDB.findAllRole(skip, limit);
    const total = await this.handleRoleDB.totalRole();
    if (!roles) throw new NotFoundException('No role found');
    const _query = {
      page: Number(page),
      limit: Number(limit),
      total: roles.length,
      total_page: Math.ceil(total / limit)
    }
    return {
      code: 0,
      message: 'Get all roles successfully',
      data: {
        _query: _query,
        roles: roles
      }
    }
  }

  async getRoleById(id: string) {
    const role = await this.handleRoleDB.findRoleById(id);
    if (!role) throw new NotFoundException('No role found');
    return {
      code: 0,
      message: 'Get role by id successfully',
      data: role
    }
  }

  async getRoleName() {
    const roles = await this.handleRoleDB.getAllRole();
    if (!roles) throw new NotFoundException('No role found');
    const roleName = roles.map((item) => item.roleName);
    return {
      code: 0,
      message: 'Get role name successfully',
      data: roleName,
    }
  }

  async searchRole(search: string, roleName: string, activeGet: string, page: number, limit: number) {
    const active = activeGet === 'TRUE' ? true : activeGet === 'FALSE' ? false : '';

    const { roles, total } = await this.handleRoleDB.searchRole(search, roleName, active, page, limit);
    if (!roles) throw new NotFoundException('No role found');
    return {
      code: 0,
      message: 'Search role successfully',
      data: {
        _query: {
          page: Number(page),
          limit: Number(limit),
          total: roles.length,
          total_page: Math.ceil(total / limit)
        },
        roles: roles
      }
    }
  }

  async createRole(createRoleDto: any) {
    try {
      await this.handleRoleDB.createRole(createRoleDto);
      return {
        code: 0,
        message: 'Create role successfully',
      }
    } catch (e) {
      console.log('-> createRole error', e);
    }
  }

  async updateRole(updateRoleDto: UpdateRoleDto) {
    try {
      await this.handleRoleDB.updateRole(updateRoleDto);

      return {
        code: 0,
        message: 'Update role successfully',
      }
    } catch (e) { console.log('-> updateRole error', e); }
  }

  async removeRole(id: string) {
    try {
      await this.handleRoleDB.removeRole(id);
      return {
        code: 0,
        message: 'Delete role successfully',
      }
    } catch (e) { console.log('-> removeRole error', e); }
  }

  async getRoleDashboard(dataUser: any) {
    const { account } = dataUser;

    const roles = account.roles;
    var dashboards = [];
    for (const roleName of roles) {
      if (roleName === 'SUPER_ADMIN') return {
        code: 0,
        message: 'Get role dashboard successfully',
        data: []
      }
      const dashboardRole = await this.handleRoleDB.getDashboardByRoleName(roleName);
      const dashboardIds = dashboardRole.dashboard;
      for (const item of dashboardIds) {
        dashboards.push(item);
      }
    }

    var actionsDashboards = [];
    for (const item of dashboards) {
      const dashboardRole = await this.handlePermissionDB.findPermissionById(item);
      actionsDashboards.push(dashboardRole?.endpoint);
    }

    return {
      code: 0,
      message: 'Get role dashboard successfully',
      data: actionsDashboards
    }
  }
}
