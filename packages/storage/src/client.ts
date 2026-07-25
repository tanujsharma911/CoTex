import { S3Client as S3ClientSdk } from "@aws-sdk/client-s3";

export const s3Client = ({
  accessKey,
  secretAccessKey,
  region = "us-east-1",
  endpoint,
}: {
  accessKey: string;
  secretAccessKey: string;
  region?: string;
  endpoint: string;
  bucketName: string;
}) => {
  return new S3ClientSdk({
    endpoint,
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey,
    },
    forcePathStyle: true,
  });
};