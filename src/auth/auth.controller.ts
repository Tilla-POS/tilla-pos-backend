import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignInDto } from './dto/signin.dto';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './enums/auth-type.enum';
import { AuthCreateBusinessDto } from './dto/create-business.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

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

  @ApiOperation({
    summary: 'Sign up a new business',
    description:
      'This endpoint allows you to sign up a new business with the provided details.',
  })
  @ApiResponse({
    status: 201,
    description: 'The business has been successfully signed up.',
    type: AuthResponseDto,
  })
  @Post('/create-business')
  @UseInterceptors(FileInterceptor('image'))
  createBusiness(
    @Body() authCreateBusinessDto: AuthCreateBusinessDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<AuthResponseDto> {
    return this.authService.createBusiness(authCreateBusinessDto, file);
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
    type: AuthResponseDto,
  })
  signIn(@Body() signInDto: SignInDto): Promise<AuthResponseDto> {
    return this.authService.signin(signInDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'This endpoint allows you to refresh an access token using a valid refresh token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens have been successfully refreshed.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid refresh token.',
  })
  refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponseDto> {
    return this.authService.refreshToken(refreshTokenDto);
  }
}
