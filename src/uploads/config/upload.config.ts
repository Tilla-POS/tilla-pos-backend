import { registerAs } from '@nestjs/config';

export default registerAs('upload', () => {
  return {
    awsRegion: process.env.AWS_REGION,
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
    awsPublicBucketName: process.env.AWS_PUBLIC_BUCKET_NAME,
    apiDomain: process.env.API_DOMAIN,
  };
});
