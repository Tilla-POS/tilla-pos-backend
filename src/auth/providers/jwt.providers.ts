import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';

@Injectable()
export class JwtProviders {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  public async verify(token: string): Promise<any> {
    try {
      return await this.jwtService.verifyAsync(token, this.jwtConfiguration);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  public async signToken<T>(userId: string, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }

  public async signRefreshToken<T>(userId: string, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        tokenType: 'refresh',
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn: this.jwtConfiguration.refreshTokenTtl,
      },
    );
  }

  public async verifyRefreshToken(token: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
      });

      if (payload.tokenType !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return payload;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  public async generateTokens<T>(userId: string, payload?: T) {
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken(userId, this.jwtConfiguration.accessTokenTtl, payload),
      this.signRefreshToken(userId, payload),
    ]);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: this.jwtConfiguration.accessTokenTtl,
    };
  }
}
