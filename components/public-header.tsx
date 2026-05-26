"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { AuthMenu } from "@/components/auth-menu";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-xl">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-4 lg:px-10">
        <BrandLogo />
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/"
            className="rounded-full px-4 py-2 text-slate-700 transition hover:bg-slate-100"
          >
            Home
          </Link>
          <Link
            href="/products/list"
            className="rounded-full px-4 py-2 text-slate-700 transition hover:bg-slate-100"
          >
            Products
          </Link>
        </nav>
        <AuthMenu />
      </div>
    </header>
  );
}
