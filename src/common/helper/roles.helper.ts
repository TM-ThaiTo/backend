import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/constants/role.enum';

export const ROLES_KEY = process.env.ROLES_KEY || 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);