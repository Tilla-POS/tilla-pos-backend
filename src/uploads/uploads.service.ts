import { Inject, Injectable, RequestTimeoutException } from '@nestjs/common';
import uploadConfig from './config/upload.config';
import { ConfigType } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  GetObjectCommandOutput,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { UploadParams } from './interfaces/upload-params.interface';
import { DeleteParams } from './interfaces/delete-params.interface';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

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
        error: undefined,
      };
    } catch (error) {
      return { success: false, error, url: '' };
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
    let response: GetObjectCommandOutput;
    try {
      response = await this.s3Client.send(command);
    } catch (e) {
      throw new Error(`Error retrieving image: ${e.message}`);
    }
    if (!response.Body) {
      throw new Error('File not found');
    }
    const str = await response.Body.transformToString('base64');
    return { base64: str, contentType: response.ContentType };
  }

  private generateFileName(file: Express.Multer.File) {
    // extract file name
    const name = file.originalname.split('.')[0];
    // Remove spaces in the file name
    name.replace(/\s/g, '').trim();
    // extract file extension
    const extension = path.extname(file.originalname);
    // Generate a timestamp
    const timeStamp = new Date().getTime().toString().trim();
    // Return new fileName
    return `${name}-${timeStamp}-${uuidv4()}${extension}`;
  }

  /**
   * Extract key from image url [https://domain/api/v1/img-key => img-key]
   * @param imgUrl {string}
   * @private
   */
  private extractKeyFromImageUrl(imgUrl: string) {
    const urlParts = imgUrl.split('/');
    return urlParts[urlParts.length - 1];
  }

  /**
   * Upload file and return image url
   * @param file {Express.Multer.File}
   * @private
   */
  async uploadFile(file: Express.Multer.File) {
    const uploadParams: UploadParams = {
      Bucket: this.uploadConfiguration.awsPublicBucketName,
      Key: this.generateFileName(file),
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    let image: { url: string; success: boolean; error: any | undefined };
    try {
      image = await this.upload(uploadParams);
    } catch (error) {
      throw new RequestTimeoutException(`Failed to upload the image`, error);
    }
    if (!image.success) {
      throw new RequestTimeoutException(
        'Fail to upload the image',
        image.error,
      );
    }
    return image.url;
  }

  /**
   * Delete file
   * @param imgUrl {string}
   * @private
   */
  async deleteFile(imgUrl: string) {
    const deleteParams: DeleteParams = {
      Key: this.extractKeyFromImageUrl(imgUrl),
      Bucket: this.uploadConfiguration.awsPublicBucketName,
    };
    try {
      await this.delete(deleteParams);
    } catch (error) {
      throw new RequestTimeoutException(`Fail to delete image`, error);
    }
  }
}
