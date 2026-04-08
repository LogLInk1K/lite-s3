import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPresignedGetUrl } from "@/lib/r2";

const thumbnailCache = new Map<string, { url: string; expiresAt: number }>();

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    const cached = thumbnailCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json({ url: cached.url });
    }

    const url = await getPresignedGetUrl(key, 3600);

    thumbnailCache.set(key, { url, expiresAt: Date.now() + 50 * 60 * 1000 });

    if (thumbnailCache.size > 500) {
      const oldest = thumbnailCache.keys().next().value;
      if (oldest) thumbnailCache.delete(oldest);
    }

    return NextResponse.json({ url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
