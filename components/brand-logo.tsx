"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

type BrandLogoProps = {
  href?: string;
  size?: "header" | "large";
};

export function BrandLogo({ href = "/#top", size = "header" }: BrandLogoProps) {
  const isLarge = size === "large";
  const [logoSrc, setLogoSrc] = useState("/images/anas-perfume-logo.png");
  const isPerfumeLogo = logoSrc.includes("anas-perfume-logo");

  const content = (
    <div
      className={`relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm shadow-slate-900/10 ${
        isPerfumeLogo
          ? isLarge
            ? "aspect-[2/1] w-[720px] max-w-full"
            : "h-12 w-28 sm:w-36"
          : isLarge
            ? "h-auto w-[300px] max-w-full border-0 bg-transparent shadow-none"
            : "h-auto w-[210px] border-0 bg-transparent shadow-none"
      }`}
    >
      <Image
        src={logoSrc}
        alt="ANAS logo"
        width={isPerfumeLogo ? 1024 : 300}
        height={isPerfumeLogo ? 512 : 70}
        priority
        onError={() => setLogoSrc("/logo.svg")}
        className={`h-auto w-full ${
          isPerfumeLogo ? "absolute inset-0 h-full object-cover" : "object-contain"
        }`}
      />
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} aria-label="BEAUTY Cosmetic Commission home">
      {content}
    </Link>
  );
}
