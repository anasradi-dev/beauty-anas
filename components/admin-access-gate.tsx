"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth";
import { BrandLogo } from "@/components/brand-logo";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PublicHeader } from "@/components/public-header";

const publicPaths = ["/", "/logo", "/products/list"];

function AdminRequiredScreen() {
  const { user, signout } = useAuth();

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center">
        <BrandLogo />
        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-8 shadow-sm shadow-slate-900/5">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-pink-600">
            Admin access
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            Sign in as admin to open the app.
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            This workspace is locked. Normal users cannot view or change the
            dashboard data.
          </p>

          {user ? (
            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              You are signed in as {user.email}, but this account is not admin.
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/auth/signin"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-pink-700 px-4 text-sm font-semibold text-white transition hover:bg-pink-800"
            >
              Admin sign in
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Create admin
            </Link>
            {user ? (
              <button
                type="button"
                onClick={() => void signout()}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-red-200 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50"
              >
                Sign out
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}

export function AdminAccessGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAdmin } = useAuth();
  const isAuthPage = pathname.startsWith("/auth");
  const isPublicPage = publicPaths.includes(pathname);

  if (isAuthPage) {
    return <div className="min-h-screen">{children}</div>;
  }

  if (!isAdmin && isPublicPage) {
    return (
      <>
        <PublicHeader />
        <div className="min-h-screen">{children}</div>
        <Footer />
      </>
    );
  }

  if (!isAdmin) {
    return <AdminRequiredScreen />;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen">{children}</div>
      <Footer />
    </>
  );
}
