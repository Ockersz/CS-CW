import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { AuthService } from './auth/auth.service';
import { UsersService } from './users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException({
        message: 'Token not found',
        tokenExp: true,
        error: 'Unauthorized',
        statusCode: 401,
      });
    }

    if (request.path === '/auth/refresh') {
      await this.handleRefreshToken(token);
    } else {
      const decoded = this.decodeToken(token);
      this.checkTokenExpiry(decoded);
      await this.validateUser(decoded, request);
    }

    return true;
  }

  private extractToken(request: any): string {
    const reqPath = request.path || '';
    let token = request.cookies['access_token'];

    if (reqPath === '/auth/mfa' || reqPath === '/auth/verify') {
      token = request.cookies['mfa_token'];
    } else if (reqPath === '/auth/refresh') {
      token = request.cookies['refresh_token'];
      if (!token) {
        throw new UnauthorizedException('Refresh token not found');
      }
    }

    return token;
  }

  private decodeToken(token: string): any {
    try {
      return jwt.decode(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private checkTokenExpiry(decoded: any): void {
    if (decoded['exp'] * 1000 < Date.now()) {
      throw new UnauthorizedException({
        message: 'Token expired',
        tokenExp: true,
      });
    }
  }

  private async handleRefreshToken(token: string): Promise<void> {
    const decoded = this.decodeToken(token);
    this.checkTokenExpiry(decoded);

    await this.authService.refreshToken(token);
  }

  private async validateUser(decoded: any, request: any): Promise<void> {
    const userId = decoded['sub'];
    const username = decoded['username'];

    if (!userId) {
      throw new UnauthorizedException('User ID not found in token');
    }

    const user = await this.userService.findOne(username);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    request['user'] = user;
  }
}
