import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/constants/role.enum';
import { ROLES_KEY } from 'src/common';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) { throw new UnauthorizedException('Unauthorized access'); }

        const request = context.switchToHttp().getRequest();
        const account = request.user?.account;
        // Allow access if user is ADMIN
        if (account.roles.includes(Role.SUPER_ADMIN)) { return true; }

        if (!account || !account.roles || !requiredRoles.some(role => account.roles.includes(role))) { throw new UnauthorizedException('Unauthorized access'); }
        return true;
    }
}
