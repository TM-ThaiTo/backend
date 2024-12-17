import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PermissionServiceDB } from '@/access_control/permission/handle/permission.db';
import { Permission } from '@/access_control/permission/schema/permission.schema';
import { CreatePermissionDto } from '@/access_control/permission/dto/create-permission.dto';

@Injectable()
export class PermissionService {
  constructor(
    private readonly handlePermissionDB: PermissionServiceDB
  ) { }

  getMethodNameList(permissions: any) {
    const groupedPermissions = permissions.reduce((acc, permission) => {
      const methodName = permission.method; // Lấy tên method

      if (!acc[methodName]) {
        acc[methodName] = [];
      }
      acc[methodName].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);

    const methodNameList = Object.keys(groupedPermissions);

    return { groupedPermissions, methodNameList };
  }
  getModuleNameList(permissions: any) {
    const groupedPermissions = permissions.reduce((acc, permission) => {
      const moduleName = permission.module; // Lấy tên module

      if (!acc[moduleName]) {
        acc[moduleName] = [];
      }
      acc[moduleName].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);

    const moduleNameList = Object.keys(groupedPermissions);

    return { groupedPermissions, moduleNameList };
  }

  async getPermissions() {
    try {
      const permissions = await this.handlePermissionDB.getAllPermissions();

      if (!permissions || permissions.length === 0) {
        throw new NotFoundException('No permissions found');
      }
      let { groupedPermissions, moduleNameList } = this.getModuleNameList(permissions);
      moduleNameList = moduleNameList.filter(module => module !== 'DASHBOARD');
      groupedPermissions = Object.fromEntries(
        Object.entries(groupedPermissions).filter(([module]) => module !== 'DASHBOARD')
      );

      return {
        code: 0,
        message: 'Get permissions successfully',
        data: {
          moduleNameList,
          groupedPermissions
        },
      };
    } catch (error) {
      throw new BadRequestException('Permission not found');
    }
  }

  async getPermissionsWithDashboard() {
    try {
      const permissions = await this.handlePermissionDB.getAllPermissions();

      if (!permissions || permissions.length === 0) {
        throw new NotFoundException('No permissions found');
      }
      let { groupedPermissions, moduleNameList } = this.getModuleNameList(permissions);
      moduleNameList = moduleNameList.filter(module => module === 'DASHBOARD');
      groupedPermissions = Object.fromEntries(
        Object.entries(groupedPermissions).filter(([module]) => module === 'DASHBOARD')
      );

      return {
        code: 0,
        message: 'Get permissions successfully',
        data: {
          moduleNameList,
          groupedPermissions
        },
      };
    } catch (error) {
      throw new BadRequestException('Permission not found');
    }
  }

  async getAllPermissions(page: number, limit: number) {
    try {
      const skip = (page - 1) * limit;

      const totalPermissions = await this.handlePermissionDB.totalPermissions();
      const permissions = await this.handlePermissionDB.getAllPermissionsPage(skip, limit);
      if (!permissions || permissions.length === 0) throw new NotFoundException('No permissions found');

      return {
        code: 0,
        message: 'Get all permissions successfully',
        data: {
          _query: {
            page: Number(page),
            limit: Number(limit),
            total: totalPermissions,
            total_page: Math.ceil(totalPermissions / limit),
          },
          permissions,
        },
      };
    } catch (error) {
      throw new BadRequestException('Permission not found');
    }
  }

  async getModuleAndMethodNameList() {
    try {
      const permissions = await this.handlePermissionDB.getAllPermissions();
      if (!permissions || permissions.length === 0) throw new NotFoundException('No permissions found');

      const { moduleNameList } = this.getModuleNameList(permissions);
      const { methodNameList } = this.getMethodNameList(permissions);

      return {
        code: 0,
        message: 'Get module and method name list successfully',
        data: {
          modules: moduleNameList,
          methods: methodNameList,
        },
      }

    } catch (error) {
      throw new BadRequestException('Permission not found');
    }
  }

  async checkPermissionExist(method: string, endpoint: string) {
    const permission = await this.handlePermissionDB.findPermissionByEndpointAndMethod(endpoint, method);
    if (permission) throw new BadRequestException('Permission already exists');
  }

  async searchPermissions(search: string, method: string, module: string, page: number, limit: number) {
    try {
      const { permissions, total } = await this.handlePermissionDB.searchPermissions(search, method, module, page, limit);
      if (!permissions || permissions.length === 0) throw new NotFoundException('No permissions found');

      return {
        code: 0,
        message: 'Search permissions successfully',
        data: {
          permissions,
          _query: {
            page: Number(page),
            limit: Number(limit),
            total: total,
            total_page: Math.ceil(total / 2),
          },
        },
      };
    } catch (error) {
      throw new BadRequestException('Permission not found');
    }
  }


  async createPermission(createPermissionDto: CreatePermissionDto) {
    try {
      const { method, endpoint } = createPermissionDto;
      await this.checkPermissionExist(method, endpoint);

      const permission = await this.handlePermissionDB.createPermission(createPermissionDto);

      return {
        code: 0,
        message: 'Create permission successfully',
        data: permission,
      };
    } catch (error) {
      throw new BadRequestException('Permission not found');
    }
  }

  async deletePermission(id: string) {
    try {
      await this.handlePermissionDB.deletePermissionById(id);
      return {
        code: 0,
        message: 'Delete permission successfully',
      };
    } catch (error) {
      throw new BadRequestException('Delete Permission error');
    }
  }

  async getPermissionById(id: string) {
    try {
      const permission = await this.handlePermissionDB.findOnePermissionById(id);
      return permission;
    } catch (error) {
      throw new BadRequestException('Permission not found');
    }
  }

  async updatePermission(id: string, updatePermissionDto: CreatePermissionDto) {
    try {
      const { method, endpoint } = updatePermissionDto;
      const permission = await this.getPermissionById(id);
      if (!permission) throw new NotFoundException('Permission not found');

      // await this.checkPermissionExist(method, endpoint);

      const updatedPermission = await this.handlePermissionDB.updatePermissionById(id, updatePermissionDto);
      return updatedPermission;
    } catch (error) {
      throw new BadRequestException('Error Permission is existed');
    }
  }
}