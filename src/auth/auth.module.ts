import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { EncryptModule } from 'src/common/encrypt/encrypt.module';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { JwtProviders } from './providers/jwt.providers';
import { BusinessesModule } from '../businesses/businesses.module';

@Module({
  imports: [
    UsersModule,
    EncryptModule,
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    BusinessesModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtProviders],
  exports: [JwtProviders],
})
export class AuthModule {}
