import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { FileTable } from "@/components/file-table";
import { DropZone } from "@/components/drop-zone";
import { FilePreview } from "@/components/file-preview";
import { ContextMenu } from "@/components/context-menu";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <main className="flex-1 overflow-hidden">
        <FileTable />
      </main>
      <DropZone />
      <FilePreview />
      <ContextMenu />
    </div>
  );
}
