import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Rol } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Rol[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If the endpoint doesn't have a @Roles() decorator, we let the JWT Guard handle it
    if (!requiredRoles) {
      return true;
    }

    // req.user is dynamically populated by our JWT Strategy
    const { user } = context.switchToHttp().getRequest();

    // Validate if the User object exists and its role matches any of the required roles
    return requiredRoles.some((role) => user?.rol === role);
  }
}
