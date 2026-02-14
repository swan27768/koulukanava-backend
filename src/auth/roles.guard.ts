import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    console.log('--- ROLES GUARD DEBUG ---');
    console.log('Required roles:', requiredRoles);

    if (!requiredRoles) {
      console.log('No roles required → allow');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('User object:', user);
    console.log('User role:', user?.role);

    const hasRole = user && requiredRoles.includes(user.role);

    console.log('Has required role:', hasRole);
    console.log('--------------------------');

    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
