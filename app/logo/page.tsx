import Image from "next/image";

export default function LogoPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-16">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-10 shadow-xl shadow-slate-900/5">
          <div className="mb-8 text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              Brand identity
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
              Anas Beauty Logo
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This page displays your logo. Place the logo file at{" "}
              <code className="rounded bg-slate-100 px-2 py-1 text-sm">
                public/logo.png
              </code>
              .
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-8 shadow-inner shadow-slate-900/5">
            <div className="mx-auto max-w-lg">
              <Image
                src="/logo.png"
                alt="Anas Beauty logo"
                width={900}
                height={900}
                className="h-auto w-full rounded-[1.5rem] object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
