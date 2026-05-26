"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth";

export function AuthMenu() {
  const { user, signout } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/auth/signin"
          className="text-sm text-slate-700 hover:underline"
        >
          Sign in
        </Link>
        <Link
          href="/auth/signup"
          className="rounded bg-pink-700 px-3 py-1 text-sm text-white"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-sm text-slate-700">{user.email}</div>
      <button onClick={() => signout()} className="text-sm text-red-600">
        Sign out
      </button>
    </div>
  );
}
