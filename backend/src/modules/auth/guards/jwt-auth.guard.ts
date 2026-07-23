import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser = any>(err: unknown, user: unknown): TUser {
    if (err || !user) {
      if (err instanceof Error) {
        throw err;
      }
      throw new UnauthorizedException('No autorizado');
    }
    return user as TUser;
  }
}
