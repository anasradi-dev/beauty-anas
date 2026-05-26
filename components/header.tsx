import { BrandLogo } from "./brand-logo";
import { Nav } from "./nav";
import { beautyNavigation } from "@/lib/navigation";
import { AuthMenu } from "./auth-menu";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-xl">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-4 lg:px-10">
        <BrandLogo />
        <Nav menu={beautyNavigation} />
        <AuthMenu />
      </div>
    </header>
  );
}
