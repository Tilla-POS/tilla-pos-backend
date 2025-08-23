import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { ConfigModule } from '@nestjs/config';
import uploadConfig from './config/upload.config';

@Module({
  imports: [ConfigModule.forFeature(uploadConfig)],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}
