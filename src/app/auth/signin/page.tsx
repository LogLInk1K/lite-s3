import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/sign-in-form";
import { ThemeMenu } from "@/components/theme-menu";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/");
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg-marketing">
      <div className="fixed top-4 right-4 z-50">
        <ThemeMenu />
      </div>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-6 mb-8">
          <div className="h-14 w-14 rounded-xl bg-brand-indigo flex items-center justify-center">
            <span className="text-white font-medium text-xl">S3</span>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-medium text-text-primary" style={{ letterSpacing: "-0.704px" }}>S3 Manager</h1>
            <p className="text-text-tertiary text-sm mt-1.5">个人文件管理系统</p>
          </div>
        </div>
        <div className="bg-surface-elevated rounded-xl border border-border-subtle p-6">
          <SignInForm />
        </div>
      </div>
    </div>
  );
}
