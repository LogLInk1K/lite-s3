import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createS3Client, getDefaultBucket } from "@/lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { ensureDatabase } from "@/lib/db";
import sharp from "sharp";

const imageCache = new Map<string, { data: ArrayBuffer; contentType: string; expiresAt: number }>();

const THUMBNAIL_SIZE = 200;
const CACHE_TTL = 50 * 60 * 1000;
const MAX_CACHE_ENTRIES = 500;

const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/tiff",
  "image/svg+xml",
];

const VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
];

function getFileExtension(key: string): string {
  const parts = key.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

function isImageFile(key: string, contentType?: string): boolean {
  if (contentType && SUPPORTED_IMAGE_TYPES.includes(contentType)) {
    return true;
  }
  const ext = getFileExtension(key);
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "tiff", "svg"];
  return imageExtensions.includes(ext);
}

function isVideoFile(key: string, contentType?: string): boolean {
  if (contentType && VIDEO_TYPES.includes(contentType)) {
    return true;
  }
  const ext = getFileExtension(key);
  const videoExtensions = ["mp4", "webm", "ogg", "mov", "avi", "mkv"];
  return videoExtensions.includes(ext);
}

async function generatePlaceholder(type: "video" | "unsupported", size: number): Promise<Buffer> {
  const svg = type === "video" 
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <rect width="${size}" height="${size}" fill="#1a1a2e"/>
        <polygon points="${size*0.35},${size*0.25} ${size*0.35},${size*0.75} ${size*0.7},${size*0.5}" fill="#6366f1"/>
       </svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <rect width="${size}" height="${size}" fill="#1a1a2e"/>
        <text x="${size/2}" y="${size/2}" text-anchor="middle" dominant-baseline="middle" fill="#6366f1" font-size="${size*0.4}">?</text>
       </svg>`;
  
  return sharp(Buffer.from(svg))
    .resize(size, size)
    .webp({ quality: 70 })
    .toBuffer();
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureDatabase();
    
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    const bucketId = searchParams.get("bucketId") || undefined;
    const size = Math.min(parseInt(searchParams.get("size") || String(THUMBNAIL_SIZE)), 800);

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    if (isVideoFile(key)) {
      const placeholder = await generatePlaceholder("video", size);
      const data = placeholder.buffer.slice(placeholder.byteOffset, placeholder.byteOffset + placeholder.byteLength) as ArrayBuffer;
      return new Response(data, {
        headers: {
          "Content-Type": "image/webp",
          "Cache-Control": "public, max-age=86400, immutable",
        },
      });
    }

    if (!isImageFile(key)) {
      const placeholder = await generatePlaceholder("unsupported", size);
      const data = placeholder.buffer.slice(placeholder.byteOffset, placeholder.byteOffset + placeholder.byteLength) as ArrayBuffer;
      return new Response(data, {
        headers: {
          "Content-Type": "image/webp",
          "Cache-Control": "public, max-age=86400, immutable",
        },
      });
    }

    const bucket = await getDefaultBucket();
    if (!bucket) {
      return NextResponse.json({ error: "No bucket configured" }, { status: 400 });
    }

    const cacheKey = `${bucketId || bucket.id}:${key}:${size}`;
    const cached = imageCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return new Response(cached.data, {
        headers: {
          "Content-Type": cached.contentType,
          "Cache-Control": "public, max-age=3600, immutable",
        },
      });
    }

    const client = createS3Client(bucket);
    const command = new GetObjectCommand({
      Bucket: bucket.bucketName,
      Key: key,
    });

    const response = await client.send(command);

    if (!response.Body) {
      return NextResponse.json({ error: "Empty response" }, { status: 500 });
    }

    const bytes = await response.Body.transformToByteArray();
    const buffer = Buffer.from(bytes);

    try {
      const resized = await sharp(buffer)
        .resize(size, size, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 70 })
        .toBuffer();

      const contentType = "image/webp";
      const data = resized.buffer.slice(resized.byteOffset, resized.byteOffset + resized.byteLength) as ArrayBuffer;

      if (imageCache.size >= MAX_CACHE_ENTRIES) {
        const oldest = imageCache.keys().next().value;
        if (oldest) imageCache.delete(oldest);
      }
      imageCache.set(cacheKey, { data, contentType, expiresAt: Date.now() + CACHE_TTL });

      return new Response(data, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=3600, immutable",
        },
      });
    } catch (sharpError) {
      const placeholder = await generatePlaceholder("unsupported", size);
      const data = placeholder.buffer.slice(placeholder.byteOffset, placeholder.byteOffset + placeholder.byteLength) as ArrayBuffer;
      return new Response(data, {
        headers: {
          "Content-Type": "image/webp",
          "Cache-Control": "public, max-age=86400, immutable",
        },
      });
    }
  } catch (error: any) {
    console.error("GET /api/files/thumbnail error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
