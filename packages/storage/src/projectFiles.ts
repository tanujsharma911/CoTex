import { PutObjectCommand, GetObjectCommand, S3Client as S3ClientSdk } from "@aws-sdk/client-s3";
import { s3Client } from "./client";
import { streamToString } from "./utils";
import { Readable } from "stream";

export class S3Client {
  private s3: S3ClientSdk;
  private readonly BUCKET_NAME: string;

  constructor(args: {
    accessKey: string;
    secretAccessKey: string;
    region?: string;
    endpoint: string;
    bucketName: string;
  }) {
    this.s3 = s3Client(args)
    this.BUCKET_NAME = args.bucketName;
  }

  public saveLatexCode = async (projectId: string, latexContent: string) => {
    const key = `projects/${projectId}/source/main.tex`;
    await this.s3.send(new PutObjectCommand({
      Bucket: this.BUCKET_NAME,
      Key: key,
      Body: latexContent,
      ContentType: "text/x-tex",
    }));
    return key;
  }

  public getLatexCode = async (projectId: string): Promise<string> => {
    const key = `projects/${projectId}/source/main.tex`;
    const obj = await this.s3.send(new GetObjectCommand({ Bucket: this.BUCKET_NAME, Key: key }));
    return streamToString(obj.Body as Readable);
  }

  public saveCompiledPdf = async (projectId: string, pdfBuffer: Buffer) => {
    const key = `projects/${projectId}/output/latest.pdf`;
    await this.s3.send(new PutObjectCommand({
      Bucket: this.BUCKET_NAME,
      Key: key,
      Body: pdfBuffer,
      ContentType: "application/pdf",
    }));
    return key;
  }
}