import {
  GetObjectCommand,
  S3Client as S3ClientSdk,
  ListObjectsV2Command,
  DeleteObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from './client.js';
import { Upload } from '@aws-sdk/lib-storage';
import { ContentType } from '@cotex/constants';

export class S3 {
  private readonly PDF_URL_EXPIRES_IN_SECONDS = 300;
  private s3: S3ClientSdk;
  private s3Public: S3ClientSdk;
  private readonly BUCKET_NAME: string;

  constructor(args: {
    accessKey: string;
    secretAccessKey: string;
    region?: string;
    endpoint: string;
    publicEndpoint: string;
    bucketName: string;
  }) {
    this.s3 = s3Client(args);
    this.s3Public = s3Client({ ...args, endpoint: args.publicEndpoint });
    this.BUCKET_NAME = args.bucketName;
  }

  public saveProjectFile = async (
    docId: string,
    relativePath: string,
    content: Buffer | string,
    contentType: ContentType
  ) => {
    const key = `projects/${docId}/${relativePath}`;

    const upload = new Upload({
      client: this.s3,
      params: {
        Bucket: this.BUCKET_NAME,
        Key: key,
        Body: content,
        ContentType: contentType
      }
    });

    await upload.done();

    return key;
  };

  public getProjectFile = async (
    docId: string,
    relativePath: string
  ): Promise<Buffer> => {
    const key = `projects/${docId}/${relativePath}`;

    const obj = await this.s3.send(
      new GetObjectCommand({ Bucket: this.BUCKET_NAME, Key: key })
    );

    return Buffer.from(await obj.Body!.transformToByteArray());
  };

  public listProjectFiles = async (docId: string): Promise<string[]> => {
    const prefix = `projects/${docId}`;

    const result = await this.s3.send(
      new ListObjectsV2Command({
        Bucket: this.BUCKET_NAME,
        Prefix: prefix
      })
    );

    return (result.Contents ?? []).map((obj) => obj.Key!.replace(prefix, ''));
  };

  public getPresignedDownloadUrl = async (key: string): Promise<string> => {
    const command = new GetObjectCommand({
      Bucket: this.BUCKET_NAME,
      Key: key
    });

    return getSignedUrl(this.s3Public, command, {
      expiresIn: this.PDF_URL_EXPIRES_IN_SECONDS
    });
  };

  public deleteProjectFile = async (
    docId: string,
    relativePath: string
  ): Promise<void> => {
    const key = `projects/${docId}/${relativePath}`;

    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.BUCKET_NAME, Key: key })
    );
  };
}
