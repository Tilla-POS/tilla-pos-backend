import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { UsersService } from '../users/users.service';
import { SignInDto } from './dto/signin.dto';
import { Hashing } from '../common/encrypt/provider/hashing';
import { JwtProviders } from './providers/jwt.providers';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashingService: Hashing,
    private readonly jwtProvider: JwtProviders,
  ) {}

  async signup(signupDto: SignUpDto) {
    return await this.usersService.create(signupDto);
  }

  async signin(signinDto: SignInDto) {
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
    const token = await this.jwtProvider.signToken(user.id, 3600, {
      email: user.email,
    });
    return { accessToken: token };
  }
}
