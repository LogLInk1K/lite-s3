import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { copyObject, deleteObject } from "@/lib/r2";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sourceKey, destKey } = await request.json();

    if (!sourceKey || !destKey) {
      return NextResponse.json({ error: "sourceKey and destKey are required" }, { status: 400 });
    }

    await copyObject(sourceKey, destKey);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sourceKey, destKey } = await request.json();

    if (!sourceKey || !destKey) {
      return NextResponse.json({ error: "sourceKey and destKey are required" }, { status: 400 });
    }

    await copyObject(sourceKey, destKey);
    await deleteObject(sourceKey);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
