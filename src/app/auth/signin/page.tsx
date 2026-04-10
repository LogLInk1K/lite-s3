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
    <div className="min-h-screen flex bg-bg-marketing relative overflow-hidden">
      <div className="fixed top-4 right-4 z-50">
        <ThemeMenu />
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-1/2 h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-indigo/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-violet/15 rounded-full blur-3xl" />
        </div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-brand-indigo/10 rounded-full blur-3xl" />
      </div>

      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-center px-16 xl:px-24">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-brand-indigo flex items-center justify-center">
              <span className="text-white font-medium text-lg">S3</span>
            </div>
            <span className="text-2xl font-medium text-text-primary" style={{ letterSpacing: "-0.704px" }}>S3 Manager</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-medium text-text-primary leading-tight" style={{ letterSpacing: "-1.056px" }}>
            简洁高效的<br />对象存储管理
          </h1>
          <p className="text-text-tertiary text-lg mt-6 leading-relaxed">
            现代化的界面设计，支持多存储桶管理、文件预览、批量操作等功能。
          </p>
          <div className="flex items-center gap-6 mt-10 text-sm text-text-quaternary">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success-green" />
              <span>多存储桶支持</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success-green" />
              <span>实时预览</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success-green" />
              <span>批量操作</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex flex-col items-center gap-5 mb-8">
            <div className="relative">
              <div className="absolute -inset-4 bg-brand-indigo/20 rounded-2xl blur-xl" />
              <div className="relative h-16 w-16 rounded-2xl bg-brand-indigo flex items-center justify-center shadow-lg">
                <span className="text-white font-medium text-2xl">S3</span>
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-medium text-text-primary" style={{ letterSpacing: "-0.704px" }}>
                S3 Manager
              </h1>
              <p className="text-text-tertiary text-sm mt-2">简洁高效的对象存储管理</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-text-quaternary">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-success-green" />
                <span>多存储桶</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-success-green" />
                <span>实时预览</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-success-green" />
                <span>批量操作</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-elevated rounded-xl border border-border-subtle p-6 shadow-elevated">
            <div className="hidden lg:block mb-6">
              <h2 className="text-xl font-medium text-text-primary">欢迎回来</h2>
              <p className="text-text-tertiary text-sm mt-1">请输入您的凭据以登录</p>
            </div>
            <SignInForm />
          </div>

          <p className="text-center text-xs text-text-quaternary mt-6">
            安全登录 · 数据加密传输
          </p>
        </div>
      </div>
    </div>
  );
}
