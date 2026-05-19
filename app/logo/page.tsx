import { BrandLogo } from "@/components/brand-logo";

export default function LogoPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-16">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-lg border border-slate-200 bg-white p-10 shadow-xl shadow-slate-900/5">
          <div className="mb-8 text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              Brand identity
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
              ANAS Perfume Logo
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              The luxury perfume image is used as the website brand logo.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 shadow-inner shadow-slate-900/5">
            <div className="mx-auto flex max-w-3xl justify-center rounded-lg bg-white p-4 shadow-sm shadow-slate-900/5">
              <BrandLogo href="" size="large" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
