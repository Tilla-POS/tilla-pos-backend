import { Test, TestingModule } from '@nestjs/testing';
import { UploadsService } from './uploads.service';
import uploadConfig from './config/upload.config';
import { S3Client } from '@aws-sdk/client-s3';
import { UploadParams } from './interfaces/upload-params.interface';

describe('UploadsService', () => {
  let service: UploadsService;
  const mockS3Client = {
    send: jest.fn(),
    config: { region: 'test-region' },
  };
  const mockUploadConfig = {
    awsRegion: 'test-region',
    awsAccessKeyId: 'test-access-key',
    awsSecretAccessKey: 'test-secret-key',
    awsPublicBucketName: 'test-bucket',
    apiDomain: 'http://localhost:3000',
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadsService,
        { provide: uploadConfig.KEY, useValue: mockUploadConfig },
        { provide: S3Client, useValue: mockS3Client },
      ],
    }).compile();

    service = module.get<UploadsService>(UploadsService);
    service['s3Client'] = mockS3Client as any;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('upload', () => {
    it('should upload a file successfully', async () => {
      const params: UploadParams = {
        Bucket: 'test-bucket',
        Key: 'test-key',
        Body: Buffer.from('test-body'),
        ContentType: 'image/png',
      };
      mockS3Client.send.mockResolvedValue({});

      const result = await service.upload(params);
      expect(mockS3Client.send).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        url: `https://test-bucket.s3.test-region.amazonaws.com/test-key`,
        source: `${mockUploadConfig.apiDomain}/uploads/test-key`,
        key: 'test-key',
      });
    });

    it('should return an error if upload fails', async () => {
      const params: UploadParams = {
        Bucket: 'test-bucket',
        Key: 'test-key',
        Body: Buffer.from('test-body'),
        ContentType: 'image/png',
      };
      mockS3Client.send.mockRejectedValue(new Error('upload failed'));

      const result = await service.upload(params);

      expect(mockS3Client.send).toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: new Error('upload failed'),
      });
    });
  });
});
