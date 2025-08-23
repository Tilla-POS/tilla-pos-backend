import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignInDto } from './dto/signin.dto';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './enums/auth-type.enum';

@ApiTags('Auth')
@Controller('auth')
@Auth(AuthType.None)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({
    summary: 'Sign up a new user',
    description:
      'This endpoint allows you to sign up a new user with the provided details.',
  })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully signed up.',
  })
  signup(@Body() signupDto: SignUpDto) {
    return this.authService.signup(signupDto);
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sign in an existing user',
    description:
      'This endpoint allows you to sign in an existing user with their email and password.',
  })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully signed in.',
  })
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signin(signInDto);
  }
}
