import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtProviders } from '../../providers/jwt.providers';
import { Request } from 'express';
import { REQUEST_USER_KEY } from '../../constants/auth.constant';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private readonly jwtProvider: JwtProviders) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Refresh token not provided');
    }

    try {
      const payload = await this.jwtProvider.verifyRefreshToken(token);
      request[REQUEST_USER_KEY] = payload;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [, token] = request.headers.authorization?.split(' ') ?? [];
    return token;
  }
}
