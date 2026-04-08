import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectCommand,
  HeadObjectCommand,
  CopyObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const endpoint = process.env.R2_ENDPOINT!;
const accessKeyId = process.env.R2_ACCESS_KEY_ID!;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY!;
const bucketName = process.env.R2_BUCKET_NAME!;
const publicUrl = process.env.R2_PUBLIC_URL || "";

export const r2 = new S3Client({
  region: "auto",
  endpoint,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export function getBucketName() {
  return bucketName;
}

export function getPublicUrl() {
  return publicUrl;
}

export async function listObjects(prefix: string = "") {
  const normalizedPrefix = prefix && !prefix.endsWith("/") ? prefix + "/" : prefix;
  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: normalizedPrefix,
    Delimiter: "/",
    MaxKeys: 1000,
  });
  return r2.send(command);
}

export async function deleteObject(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  return r2.send(command);
}

export async function headObject(key: string) {
  const command = new HeadObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  return r2.send(command);
}

export async function copyObject(sourceKey: string, destKey: string) {
  const command = new CopyObjectCommand({
    Bucket: bucketName,
    CopySource: `${bucketName}/${sourceKey}`,
    Key: destKey,
  });
  return r2.send(command);
}

export async function getPresignedUploadUrl(key: string, contentType: string, expiresIn: number = 3600) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(r2, command, { expiresIn });
}

export async function getPresignedDownloadUrl(key: string, expiresIn: number = 3600) {
  const command = new HeadObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  return getSignedUrl(r2, command, { expiresIn });
}

export async function getPresignedGetUrl(key: string, expiresIn: number = 3600) {
  const { GetObjectCommand } = await import("@aws-sdk/client-s3");
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  return getSignedUrl(r2, command, { expiresIn });
}
