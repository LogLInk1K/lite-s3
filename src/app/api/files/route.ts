import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listObjects } from "@/lib/r2";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get("prefix") || "";

    const result = await listObjects(prefix);

    const folders = (result.CommonPrefixes || []).map((cp) => ({
      key: cp.Prefix!,
      name: cp.Prefix!.replace(prefix, "").replace(/\/$/, ""),
      type: "folder" as const,
    }));

    const files = (result.Contents || [])
      .filter((obj) => obj.Key !== prefix)
      .map((obj) => ({
        key: obj.Key!,
        name: obj.Key!.replace(prefix, "").split("/").pop() || obj.Key!,
        size: obj.Size || 0,
        lastModified: obj.LastModified?.toISOString() || "",
        type: "file" as const,
      }));

    return NextResponse.json({ folders, files, prefix });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
