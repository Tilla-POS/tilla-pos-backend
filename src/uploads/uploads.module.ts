import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import uploadConfig from './config/upload.config';
import { S3Client } from '@aws-sdk/client-s3';

@Module({
  imports: [ConfigModule.forFeature(uploadConfig)],
  providers: [UploadsService],
  exports: [
    UploadsService,
    {
      provide: S3Client,
      inject: [ConfigService],
      useFactory: (uploadConfiguration: ConfigType<typeof uploadConfig>) => {
        return new S3Client({
          region: uploadConfiguration.awsRegion,
          credentials: {
            accessKeyId: uploadConfiguration.awsAccessKeyId,
            secretAccessKey: uploadConfiguration.awsSecretAccessKey,
          },
        });
      },
    },
  ],
})
export class UploadsModule {}
