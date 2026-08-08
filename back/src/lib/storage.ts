import path from "path";
import { Readable } from "stream";
import {
  S3Client,
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  endpoint: process.env.RUSTFS_ENDPOINT || "http://localhost:9000",
  region: process.env.RUSTFS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.RUSTFS_ACCESS_KEY || "admin",
    secretAccessKey: process.env.RUSTFS_SECRET_KEY || "motdepasse123",
  },
  forcePathStyle: true,
});

const bucket = process.env.RUSTFS_BUCKET || "campus-marketplace";

let bucketPromise: Promise<void> | null = null;

function ensureBucket(): Promise<void> {
  if (!bucketPromise) {
    bucketPromise = (async () => {
      try {
        await s3Client.send(new HeadBucketCommand({ Bucket: bucket }));
      } catch {
        await s3Client.send(new CreateBucketCommand({ Bucket: bucket }));
      }
    })().catch((err) => {
      bucketPromise = null;
      throw err;
    });
  }
  return bucketPromise;
}

export function generateKey(dir: string, originalname: string): string {
  return `${dir}/${Date.now()}${path.extname(originalname)}`;
}

export async function uploadFile(
  buffer: Buffer,
  key: string,
  mimetype: string
): Promise<string> {
  await ensureBucket();
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    })
  );
  return key;
}

export async function getFileStream(key: string): Promise<Readable> {
  const { Body } = await s3Client.send(
    new GetObjectCommand({ Bucket: bucket, Key: key })
  );
  return Body as Readable;
}

export async function removeFile(key: string): Promise<void> {
  try {
    await s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  } catch (error) {
    console.error(`Impossible de supprimer ${key} dans RustFS`, error);
  }
}
