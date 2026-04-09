import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadObject, getDefaultBucket } from "@/lib/s3";
import { ensureDatabase } from "@/lib/db";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureDatabase();
    
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const key = formData.get("key") as string | null;
    const bucketId = formData.get("bucketId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    const bucket = await getDefaultBucket();
    if (!bucket) {
      return NextResponse.json({ error: "No bucket configured" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await uploadObject(
      bucketId || bucket.id,
      key,
      buffer,
      file.type || "application/octet-stream"
    );

    return NextResponse.json({ success: true, key });
  } catch (error: any) {
    console.error("POST /api/files/upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
