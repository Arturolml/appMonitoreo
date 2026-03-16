import { SetMetadata } from '@nestjs/common';
import { Rol } from '@prisma/client';

export const ROLES_KEY = 'roles';
// Accepts a list of Enum Roles generated natively by Prisma Client
export const Roles = (...roles: Rol[]) => SetMetadata(ROLES_KEY, roles);
