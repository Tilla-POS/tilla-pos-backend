import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { UsersService } from '../users/users.service';
import { SignInDto } from './dto/signin.dto';
import { Hashing } from '../common/encrypt/provider/hashing';
import { JwtProviders } from './providers/jwt.providers';
import { AuthCreateBusinessDto } from './dto/create-business.dto';
import { BusinessesService } from '../businesses/businesses.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashingService: Hashing,
    private readonly jwtProvider: JwtProviders,
    private readonly businessService: BusinessesService,
  ) {}

  async signup(signupDto: SignUpDto) {
    return await this.usersService.create(signupDto);
  }

  async createBusiness(
    authCreateBusinessDto: AuthCreateBusinessDto,
    file: Express.Multer.File,
  ): Promise<AuthResponseDto> {
    const business = await this.businessService.create(
      authCreateBusinessDto,
      file,
      authCreateBusinessDto.shopkeeperId,
    );
    return await this.jwtProvider.generateTokens(
      authCreateBusinessDto.shopkeeperId,
      {
        email: authCreateBusinessDto.email,
        businessId: business.id,
      },
    );
  }

  async signin(signinDto: SignInDto): Promise<AuthResponseDto> {
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
    return await this.jwtProvider.generateTokens(user.id, {
      email: user.email,
      businessId: !!user.business ? user.business.id : null,
    });
  }

  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponseDto> {
    try {
      const payload = await this.jwtProvider.verifyRefreshToken(
        refreshTokenDto.refreshToken,
      );

      // Verify user still exists
      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new tokens
      return await this.jwtProvider.generateTokens(user.id, {
        email: user.email,
        businessId: !!user.business ? user.business.id : null,
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
