import Image from "next/image";
import { products } from "@/lib/data";

const heroImages = [
  {
    src: "/images/240_F_429477008_90SuK7x4T3iRf5KS6pE58Uk4TWnyvtGv.jpg",
    alt: "Professional beauty and spa group portrait",
    title: "Beauty Team",
  },
  {
    src: "/images/beauty-portrait-professional.jpg",
    alt: "Professional skincare beauty portrait",
    title: "Skincare",
  },
  {
    src: "/images/beauty-products-professional.jpg",
    alt: "Professional spa cosmetic product display",
    title: "Products",
  },
  {
    src: "/images/beauty-spa-icons.svg",
    alt: "Beauty and spa icon collection banner",
    title: "Services",
  },
];

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{detail}</p>
    </article>
  );
}

export default function Home() {
  return (
    <main id="top" className="min-h-screen bg-slate-50 text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="container mx-auto grid gap-8 px-6 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pink-600">
              BEAUTY
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              BEAUTY cosmetic product collection
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              Explore professional beauty products and cosmetic essentials.
              Admin sales records, deposits, reports, and commissions stay
              private.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <StatCard
                label="Products"
                value={String(products.length)}
                detail="Cosmetic items available in the catalog"
              />
              <StatCard
                label="Skincare"
                value="Care"
                detail="Products selected for everyday beauty routines"
              />
              <StatCard
                label="Service"
                value="Support"
                detail="A focused workspace for the BEAUTY team"
              />
              <StatCard
                label="Access"
                value="Admin"
                detail="Private sales management is restricted"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {heroImages.map((image, index) => (
              <figure
                key={image.src}
                className={`relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm shadow-slate-900/10 ${
                  index === 0 ? "row-span-2 min-h-[420px]" : "min-h-[202px]"
                }`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  priority={index === 0}
                  sizes={
                    index === 0
                      ? "(min-width: 1024px) 28vw, 50vw"
                      : "(min-width: 1024px) 18vw, 50vw"
                  }
                  className="object-cover"
                />
                <figcaption className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm">
                  {image.title}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
