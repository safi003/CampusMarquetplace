import fs from "fs";
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
  // Évite 3 tentatives longues quand RustFS est éteint en dev local
  maxAttempts: 1,
});

// Racine des uploads locaux (back/uploads en dev, /app/uploads en prod Docker).
// Depuis src/lib : ../../uploads
const UPLOADS_ROOT = path.resolve(__dirname, "../../uploads");

// Les clés S3 ont la forme "uploads/<dir>/<fichier>" mais sur disque
// les fichiers sont à "<root>/<dir>/<fichier>" (sans le préfixe "uploads/").
function keyToLocalPath(key: string): string {
  const relative = key.startsWith("uploads/") ? key.slice("uploads/".length) : key;
  return path.join(UPLOADS_ROOT, relative);
}

async function saveLocal(buffer: Buffer, key: string): Promise<void> {
  const filePath = keyToLocalPath(key);
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  await fs.promises.writeFile(filePath, buffer);
}

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
  try {
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
  } catch (err) {
    // RustFS éteint (ECONNREFUSED :9000 en dev local) → fallback disque
    // pour que l'API reste utilisable sans Docker.
    console.warn(
      `[storage] RustFS indisponible (${process.env.RUSTFS_ENDPOINT || "http://localhost:9000"}), fallback disque pour ${key}`
    );
    await saveLocal(buffer, key);
    return key;
  }
}

export async function getFileStream(key: string): Promise<Readable> {
  try {
    const { Body } = await s3Client.send(
      new GetObjectCommand({ Bucket: bucket, Key: key })
    );
    return Body as Readable;
  } catch {
    const localPath = keyToLocalPath(key);
    if (fs.existsSync(localPath)) {
      return fs.createReadStream(localPath);
    }
    throw new Error(`Fichier introuvable: ${key}`);
  }
}

export async function removeFile(key: string): Promise<void> {
  try {
    await s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  } catch (error) {
    console.warn(`[storage] suppression RustFS impossible pour ${key}, essai disque local`);
  }
  // Supprime aussi le fallback local s'il existe (ignore si absent)
  try {
    await fs.promises.unlink(keyToLocalPath(key));
  } catch {
    // ignore ENOENT
  }
}
