import {
  PutObjectCommand,
  GetObjectCommand,
  S3Client as S3ClientSdk
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from './client.js';
import { streamToString } from './utils.js';
import { Readable } from 'stream';

export class S3Client {
  private readonly PDF_URL_EXPIRES_IN_SECONDS = 300;
  private s3: S3ClientSdk;
  private readonly BUCKET_NAME: string;

  constructor(args: {
    accessKey: string;
    secretAccessKey: string;
    region?: string;
    endpoint: string;
    bucketName: string;
  }) {
    this.s3 = s3Client(args);
    this.BUCKET_NAME = args.bucketName;
  }

  public saveLatexCode = async (docId: string, latexContent: string) => {
    const key = `projects/${docId}/main.tex`;
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.BUCKET_NAME,
        Key: key,
        Body: latexContent,
        ContentType: 'text/x-tex'
      })
    );
    return key;
  };

  public getLatexCode = async (docId: string): Promise<string> => {
    const key = `projects/${docId}/main.tex`;
    const obj = await this.s3.send(
      new GetObjectCommand({ Bucket: this.BUCKET_NAME, Key: key })
    );
    return streamToString(obj.Body as Readable);
  };

  public saveCompiledPdf = async (docId: string, pdfBuffer: Buffer) => {
    const key = `projects/${docId}/output/main.pdf`;
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.BUCKET_NAME,
        Key: key,
        Body: pdfBuffer,
        ContentType: 'application/pdf'
      })
    );
    return key;
  };

  public getPresignedDownloadUrl = async (key: string): Promise<string> => {
    const command = new GetObjectCommand({
      Bucket: this.BUCKET_NAME,
      Key: key
    });
    return getSignedUrl(this.s3, command, {
      expiresIn: this.PDF_URL_EXPIRES_IN_SECONDS
    });
  };
}
