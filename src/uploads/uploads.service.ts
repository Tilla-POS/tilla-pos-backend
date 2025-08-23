import { Inject, Injectable } from '@nestjs/common';
import uploadConfig from './config/upload.config';
import { ConfigType } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { UploadParams } from './interfaces/upload-params.interface';
import { DeleteParams } from './interfaces/delete-params.interface';

@Injectable()
export class UploadsService {
  constructor(
    @Inject(uploadConfig.KEY)
    private readonly uploadConfiguration: ConfigType<typeof uploadConfig>,
    private readonly s3Client: S3Client,
  ) {}

  async upload(params: UploadParams) {
    try {
      await this.s3Client.send(new PutObjectCommand(params));
      return {
        success: true,
        url: `${this.uploadConfiguration.apiDomain}/uploads/${params.Key}`,
      };
    } catch (error) {
      return { success: false, error };
    }
  }

  async delete(params: DeleteParams) {
    try {
      await this.s3Client.send(new DeleteObjectCommand(params));
      return { success: true, message: 'File deleted successfully' };
    } catch (error) {
      return { success: false, error };
    }
  }

  async getImage(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.uploadConfiguration.awsPublicBucketName,
      Key: key,
    });
    try {
      const response = await this.s3Client.send(command);
      if (!response.Body) {
        throw new Error('File not found');
      }
      const str = await response.Body.transformToString('base64');
      return { base64: str, contentType: response.ContentType };
    } catch (error) {
      throw new Error(`Error retrieving image: ${error.message}`);
    }
  }
}
