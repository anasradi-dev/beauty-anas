export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="container mx-auto px-6 py-16">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-xl shadow-slate-900/5">
          <div className="mb-10 text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              Anas Beauty
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Beauty stories, portraits, and wellness moments.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600 sm:text-lg">
              Welcome to your gallery. These images showcase the style and
              luxury of your brand; replace them with your own photos anytime by
              adding files to{" "}
              <code className="rounded bg-slate-100 px-2 py-1 text-sm">
                public/images
              </code>
              .
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-4">
            <article className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50 shadow-sm shadow-slate-900/5">
              <img
                src="/images/beauty-1.jpg"
                alt="Beauty portrait"
                className="h-72 w-full object-cover"
              />
              <div className="p-5">
                <h2 className="text-lg font-semibold text-slate-900">
                  Timeless elegance
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  A refined portrait that reflects the luxury of your beauty
                  services.
                </p>
              </div>
            </article>

            <article className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50 shadow-sm shadow-slate-900/5">
              <img
                src="/images/beauty-2.jpg"
                alt="Spa wellness setup"
                className="h-72 w-full object-cover"
              />
              <div className="p-5">
                <h2 className="text-lg font-semibold text-slate-900">
                  Luxury wellness
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  A calming atmosphere for premium spa care and beauty rituals.
                </p>
              </div>
            </article>

            <article className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50 shadow-sm shadow-slate-900/5">
              <img
                src="/images/beauty-3.jpg"
                alt="Group beauty portrait"
                className="h-72 w-full object-cover"
              />
              <div className="p-5">
                <h2 className="text-lg font-semibold text-slate-900">
                  Modern beauty
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  A stylish group portrait for an elegant brand presentation.
                </p>
              </div>
            </article>

            <article className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50 shadow-sm shadow-slate-900/5">
              <img
                src="/images/beauty-4.jpg"
                alt="Spa stones and candles"
                className="h-72 w-full object-cover"
              />
              <div className="p-5">
                <h2 className="text-lg font-semibold text-slate-900">
                  Spa serenity
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  A serene set of textures and tones for premium beauty care.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
