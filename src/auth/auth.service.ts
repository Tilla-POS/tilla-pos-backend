import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { UsersService } from '../users/users.service';
import { SignInDto } from './dto/signin.dto';
import { Hashing } from '../common/encrypt/provider/hashing';
import { JwtProviders } from './providers/jwt.providers';
import { AuthCreateBusinessDto } from './dto/create-business.dto';
import { BusinessesService } from '../businesses/businesses.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { SessionService } from 'src/session/session.service';
import { LogoutDto } from './dto/logout.dto';
import { OtpVerifyDto } from './dto/otp-verify.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly hashingService: Hashing,
    private readonly jwtProvider: JwtProviders,
    private readonly businessService: BusinessesService,
    private readonly sessionService: SessionService,
  ) {}

  async signup(signupDto: SignUpDto) {
    return await this.usersService.create(signupDto);
  }

  async createBusiness(
    authCreateBusinessDto: AuthCreateBusinessDto,
    file: Express.Multer.File,
  ) {
    const business = await this.businessService.create(
      authCreateBusinessDto,
      file,
      authCreateBusinessDto.shopkeeperId,
    );
    return business;
  }

  async signin(signinDto: SignInDto): Promise<AuthResponseDto> {
    this.logger.log('Signing in user with email:', signinDto.email);
    const user = await this.usersService.findByEmail(signinDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await this.hashingService.comparePassword(
      signinDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const { session, refreshJti, accessJti } =
      await this.sessionService.createSession(
        user.id,
        signinDto.device,
        signinDto.location,
      );

    return await this.jwtProvider.generateTokens(user.id, {
      email: user.email,
      businessId: !!user.business ? user.business.id : null,
      sessionId: session.id,
      jti: refreshJti,
      accessJti,
    });
  }

  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponseDto> {
    try {
      const payload = await this.jwtProvider.verifyRefreshToken(
        refreshTokenDto.refreshToken,
      );

      // payload expected to include sub, sessionId and jti
      const { sub: userId, sessionId, jti } = payload as any;

      // Verify user still exists
      const user = await this.usersService.findOne(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // validate and rotate via SessionService
      const { session, newRefreshJti, newAccessJti } =
        await this.sessionService.validateAndRotateRefresh(sessionId, jti);

      // Generate new tokens
      return await this.jwtProvider.generateTokens(user.id, {
        email: user.email,
        businessId: !!user.business ? user.business.id : null,
        sessionId: session.id,
        jti: newRefreshJti,
        accessJti: newAccessJti,
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async otpVerify(otpVerifyDto: OtpVerifyDto): Promise<AuthResponseDto> {
    if (otpVerifyDto.code === '123456') {
      // If OTP is correct, proceed with generating tokens
      const user = await this.usersService.findByEmail(otpVerifyDto.email);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const { session, refreshJti, accessJti } =
        await this.sessionService.createSession(
          user.id,
          otpVerifyDto.device,
          otpVerifyDto.location,
        );

      return await this.jwtProvider.generateTokens(user.id, {
        email: user.email,
        businessId: !!user.business ? user.business.id : null,
        sessionId: session.id,
        jti: refreshJti,
        accessJti,
      });
    }
  }

  async logout(logoutDto: LogoutDto) {
    try {
      const payload = await this.jwtProvider.verifyRefreshToken(
        logoutDto.refreshToken,
      );
      // payload expected to include sub, sessionId and jti
      const { sessionId } = payload as any;
      await this.sessionService.revokeSession(sessionId);
      return { message: 'Logged out successfully' };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
