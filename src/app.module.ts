import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import environmentValidation from './config/environment.validation';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { EncryptModule } from './common/encrypt/encrypt.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { DataResponseInterceptor } from './common/interceptors/data-response.interceptor';
import { BusinessesModule } from './businesses/businesses.module';
import { BusinessTypesModule } from './business-types/business-types.module';
import { UploadsModule } from './uploads/uploads.module';
import { AuthenticationGuard } from './auth/guards/access-token/authentication.guard';
import { AccessTokenGuard } from './auth/guards/access-token/access-token.guard';
import { ModifierModule } from './modifier/modifier.module';
import { CategoryModule } from './category/category.module';
import { ItemsModule } from './items/items.module';

// Get the current NODE_ENV
const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
      load: [appConfig, databaseConfig],
      validationSchema: environmentValidation,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        synchronize: configService.get('database.synchronize'),
        port: configService.get('database.port'),
        username: configService.get('database.user'),
        password: configService.get('database.password'),
        host: configService.get('database.host'),
        autoLoadEntities: configService.get('database.autoLoadEntities'),
        database: configService.get('database.name'),
      }),
    }),
    UsersModule,
    AdminModule,
    AuthModule,
    EncryptModule,
    BusinessesModule,
    BusinessTypesModule,
    UploadsModule,
    ModifierModule,
    CategoryModule,
    ItemsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: DataResponseInterceptor },
    { provide: APP_GUARD, useClass: AuthenticationGuard },
    AccessTokenGuard,
    AuthModule,
  ],
})
export class AppModule {}
