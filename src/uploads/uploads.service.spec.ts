import { Test, TestingModule } from '@nestjs/testing';
import { UploadsService } from './uploads.service';
import uploadConfig from './config/upload.config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { UploadParams } from './interfaces/upload-params.interface';
import { DeleteParams } from './interfaces/delete-params.interface';

// Mock the S3Client
const mockS3Client = {
  send: jest.fn(),
};

// Mock the upload configuration
const mockUploadConfig = {
  awsRegion: 'test-region',
  awsAccessKeyId: 'test-access-key',
  awsSecretAccessKey: 'test-secret-key',
  awsPublicBucketName: 'test-bucket',
  apiDomain: 'http://localhost:3000/api/v1',
};

describe('UploadsService', () => {
  let service: UploadsService;
  let s3Client: S3Client;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadsService,
        { provide: uploadConfig.KEY, useValue: mockUploadConfig },
        { provide: S3Client, useValue: mockS3Client },
      ],
    }).compile();

    service = module.get<UploadsService>(UploadsService);
    s3Client = module.get<S3Client>(S3Client);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('upload', () => {
    it('should upload a file successfully', async () => {
      // mock the S3Client send method to resolve successfully
      mockS3Client.send.mockResolvedValue({});
      const params: UploadParams = {
        Bucket: 'test-bucket',
        Key: 'test-key',
        Body: Buffer.from('test-body'),
        ContentType: 'text/plain',
      };
      const result = await service.upload(params);
      expect(s3Client.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
      expect(result.success).toBe(true);
      expect(result.url).toBe(
        `${mockUploadConfig.apiDomain}/uploads/${params.Key}`,
      );
    });
    it('should return an error if upload fails', async () => {
      const params: UploadParams = {
        Bucket: 'test-bucket',
        Key: 'test-key',
        Body: Buffer.from('test-body'),
        ContentType: 'text/plain',
      };
      mockS3Client.send.mockRejectedValue(new Error('upload failed'));

      const result = await service.upload(params);

      expect(s3Client.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
      expect(result).toEqual({
        success: false,
        error: new Error('upload failed'),
        url: '',
      });
    });
  });
  describe('delete', () => {
    it('should delete a file successfully', async () => {
      const deleteParams: DeleteParams = {
        Bucket: 'test-bucket',
        Key: 'test-key',
      };
      mockS3Client.send.mockResolvedValue({});
      const result = await service.delete(deleteParams);
      expect(mockS3Client.send).toHaveBeenCalledWith(
        expect.any(DeleteObjectCommand),
      );
      expect(result).toEqual({
        success: true,
        message: 'File deleted successfully',
      });
    });
    it('should return an error if delete fails', async () => {
      const deleteParams: DeleteParams = {
        Bucket: 'test-bucket',
        Key: 'test-key',
      };
      mockS3Client.send.mockRejectedValue(new Error('delete failed'));
      const result = await service.delete(deleteParams);
      expect(mockS3Client.send).toHaveBeenCalledWith(
        expect.any(DeleteObjectCommand),
      );
      expect(result).toEqual({
        success: false,
        error: new Error('delete failed'),
      });
    });
  });
  describe('getImage', () => {
    it('should retrieve an image successfully', async () => {
      const mockKey = 'image-to-retrieve.png';
      const mockContent = 'This is a test image content';
      const mockBase64 = Buffer.from(mockContent).toString('base64');
      const mockContentType = 'image/png';

      mockS3Client.send.mockResolvedValueOnce({
        Body: {
          transformToString: jest.fn().mockResolvedValueOnce(mockBase64),
        },
        ContentType: mockContentType,
      });
      const result = await service.getImage(mockKey);
      expect(mockS3Client.send).toHaveBeenCalledWith(
        expect.any(GetObjectCommand),
      );

      const sendArgs = mockS3Client.send.mock.calls[0][0];
      expect(sendArgs.input.Bucket).toBe(mockUploadConfig.awsPublicBucketName);
      expect(sendArgs.input.Key).toBe(mockKey);

      expect(result.base64).toBe(mockBase64);
      expect(result.contentType).toBe(mockContentType);
    });
    it('should throw an error if response.Body is null or undefined', async () => {
      const mockKey = 'missing-body.png';

      mockS3Client.send.mockResolvedValueOnce({
        Body: null,
        ContentType: 'image/png',
      });

      await expect(service.getImage(mockKey)).rejects.toThrow('File not found');

      expect(s3Client.send).toHaveBeenCalledWith(expect.any(GetObjectCommand));
      const sendArgs = mockS3Client.send.mock.calls[0][0];
      expect(sendArgs.input.Key).toBe(mockKey);
    });
    it('should throw an error if S3 retrieval fails', async () => {
      const mockKey = 'retrieval-fail.png';
      const mockError = new Error('AWS S3 retrieval failed');

      mockS3Client.send.mockRejectedValueOnce(mockError);

      await expect(service.getImage(mockKey)).rejects.toThrow(
        `Error retrieving image: ${mockError.message}`,
      );

      expect(s3Client.send).toHaveBeenCalledWith(expect.any(GetObjectCommand));
      const sendArgs = mockS3Client.send.mock.calls[0][0];
      expect(sendArgs.input.Key).toBe(mockKey);
    });
  });
});
