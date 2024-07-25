import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { UsersService } from './users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly userService: UsersService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        throw new UnauthorizedException();
      }
      const decoded = jwt.decode(token);

      const userAuth = decoded;
      const userId = userAuth ? userAuth['sub'] : null;
      const username = userAuth ? userAuth['username'] : null;
      if (!userId) {
        throw new UnauthorizedException();
      }

      const user = await this.userService.findOne(username);

      if (!user) {
        throw new UnauthorizedException();
      }

      request['user'] = user;
    } catch (err) {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
