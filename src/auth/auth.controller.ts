import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signup')
    @ApiOperation({
        summary: 'Sign up a new user',
        description: 'This endpoint allows you to sign up a new user with the provided details.',
    })
    @ApiResponse({
        status: 201,
        description: 'The user has been successfully signed up.',
    })
    signup(@Body() signupDto: SignUpDto) {
        return this.authService.signup(signupDto);
    }
}
