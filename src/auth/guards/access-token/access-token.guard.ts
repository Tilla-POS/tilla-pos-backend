import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtProviders } from '../../providers/jwt.providers';
import { Request } from 'express';
import { REQUEST_USER_KEY } from '../../constants/auth.constant';
import { SessionService } from 'src/session/session.service';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtProvider: JwtProviders,
    private readonly sessionService: SessionService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Extract the request from the execution context
    const request = context.switchToHttp().getRequest();
    // Extract the token from the header
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtProvider.verify(token);
      const session = await this.sessionService.getSessionById(
        payload.sessionId,
      );

      // payload must include sessionId and jti
      if (
        !session ||
        session.revokedAt ||
        session.refreshTokenJti !== payload.jti
      ) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      request[REQUEST_USER_KEY] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }
  private extractTokenFromHeader(request: Request): string | undefined {
    const [, token] = request.headers.authorization?.split(' ') ?? [];
    return token;
  }
}
