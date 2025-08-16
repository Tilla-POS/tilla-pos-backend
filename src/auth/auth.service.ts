import { Injectable } from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
    constructor(private readonly usersService: UsersService) {}
    
    async signup(signupDto: SignUpDto) {
        const user = await this.usersService.create(signupDto);
        return user;
    }
}
