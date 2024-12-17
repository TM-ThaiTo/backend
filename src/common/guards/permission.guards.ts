import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { RoleService } from '@/access_control/role/role.service';

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(
        private readonly roleService: RoleService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest(); // Lấy thông tin request
        const path = request.route.path;
        const method = request.method;

        const { account, user } = request?.user; // Lấy thông tin account từ request
        const rolesAccount = account.roles;

        if (rolesAccount.includes('SUPER_ADMIN')) return true; // Nếu là SUPER_ADMIN thì cho phép truy cập

        const check = await this.roleService.checkRoleAndPermissionByAccount(account, path, method);
        if (!check) throw new UnauthorizedException('Không có quyền truy cập');

        return true;
    }
}
