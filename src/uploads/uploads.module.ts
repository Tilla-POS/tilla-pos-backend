import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import uploadConfig from './config/upload.config';
import { S3Client } from '@aws-sdk/client-s3';
import { UploadsController } from './uploads.controller';

@Module({
  imports: [ConfigModule.forFeature(uploadConfig)],
  providers: [
    UploadsService,
    {
      provide: S3Client,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new S3Client({
          region: configService.get<string>('appConfig.awsRegion'),
          credentials: {
            accessKeyId: configService.get<string>('appConfig.awsAccessKeyId'),
            secretAccessKey: configService.get<string>(
              'appConfig.awsSecretAccessKey',
            ),
          },
        });
      },
    },
  ],
  exports: [UploadsService],
  controllers: [UploadsController],
})
export class UploadsModule {}
