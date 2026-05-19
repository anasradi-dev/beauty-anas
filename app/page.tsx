import Image from "next/image";
import { RepresentativeManager } from "@/components/representative-manager";
import {
  collections,
  commissionRate,
  productBatches,
  products,
  salesReps,
  totalDepositedAmount,
} from "@/lib/data";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

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

const galleryImages = [
  {
    src: "/images/240_F_429477008_90SuK7x4T3iRf5KS6pE58Uk4TWnyvtGv.jpg",
    alt: "Professional beauty team portrait",
    title: "Beauty Team",
  },
  {
    src: "/images/beauty-portrait-professional.jpg",
    alt: "Professional skincare portrait",
    title: "Skincare Portrait",
  },
  {
    src: "/images/beauty-products-professional.jpg",
    alt: "Professional spa cosmetic products",
    title: "Product Display",
  },
  {
    src: "/images/beauty-spa-icons.svg",
    alt: "Beauty and spa icons",
    title: "Service Icons",
  },
  {
    src: "/images/anas-beauty-spa.jpg",
    alt: "Spa wellness setup",
    title: "Spa Setup",
  },
  {
    src: "/images/anas-beauty-wellness.jpg",
    alt: "Beauty wellness moment",
    title: "Wellness",
  },
];

function productById(productId: string) {
  const product = products.find((item) => item.id === productId);
  if (!product) {
    throw new Error(`Missing product ${productId}`);
  }
  return product;
}

function repById(repId: string) {
  const rep = salesReps.find((item) => item.id === repId);
  if (!rep) {
    throw new Error(`Missing representative ${repId}`);
  }
  return rep;
}

const collectionRows = collections.map((collection) => {
  const rep = repById(collection.repId);
  const product = productById(collection.productId);
  const value = product.unitPrice * collection.quantity;

  return {
    ...collection,
    rep,
    product,
    value,
    commission: value * commissionRate,
  };
});

const productHolderRows = products.map((product) => {
  const holders = collectionRows.filter((row) => row.product.id === product.id);

  return {
    product,
    holders,
    totalQuantity: holders.reduce((sum, row) => sum + row.quantity, 0),
  };
});

const repReportRows = salesReps.map((rep) => {
  const rows = collectionRows.filter((row) => row.rep.id === rep.id);
  const salesVolume = rows.reduce((sum, row) => sum + row.value, 0);

  return {
    rep,
    productCount: rows.reduce((sum, row) => sum + row.quantity, 0),
    salesVolume,
    commission: salesVolume * commissionRate,
  };
});

const totalCommission = repReportRows.reduce((sum, row) => sum + row.commission, 0);

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

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

function DataTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 font-semibold">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((row, index) => (
              <tr key={index} className="text-slate-700">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-3 align-top">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
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
              Cosmetic commission sales management
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              Track representatives, product batches, deposited money, and
              commission salary from one practical workspace.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <StatCard
                label="Representatives"
                value={String(salesReps.length)}
                detail="Active sellers with settlement records"
              />
              <StatCard
                label="Products"
                value={String(products.length)}
                detail="Cosmetic items available for batches"
              />
              <StatCard
                label="Deposited"
                value={currency.format(totalDepositedAmount)}
                detail="Money returned after product sales"
              />
              <StatCard
                label="Commission"
                value={currency.format(totalCommission)}
                detail={`${commissionRate * 100}% salary from sales volume`}
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

      <div className="container mx-auto space-y-14 px-6 py-12 lg:px-10">
        <Section id="beauty-gallery" title="Beauty Gallery">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {galleryImages.map((image) => (
              <figure
                key={image.src}
                className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-900/5"
              >
                <div className="relative aspect-[4/3] bg-slate-100">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="px-4 py-3 text-sm font-semibold text-slate-800">
                  {image.title}
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>

        <RepresentativeManager initialReps={salesReps} />

        <Section id="product-list" title="Product List">
          <DataTable
            columns={["Product Name", "Unit Price", "Batch Code"]}
            rows={products.map((product) => [
              product.name,
              currency.format(product.unitPrice),
              product.batchCode,
            ])}
          />
        </Section>

        <Section id="product-holders" title="Product Holders">
          <DataTable
            columns={["Product", "Sales Representatives", "Quantity Held"]}
            rows={productHolderRows.map(({ product, holders, totalQuantity }) => [
              product.name,
              holders.map((row) => row.rep.name).join(", ") || "No holder",
              totalQuantity,
            ])}
          />
        </Section>

        <Section id="product-collections" title="Product Collections">
          <DataTable
            columns={[
              "Sales Representative",
              "Product Name",
              "Unit Price",
              "Quantity",
              "Collection Value",
            ]}
            rows={collectionRows.map((row) => [
              row.rep.name,
              row.product.name,
              currency.format(row.product.unitPrice),
              row.quantity,
              currency.format(row.value),
            ])}
          />
        </Section>

        <Section id="product-batches" title="Product Batches">
          <DataTable
            columns={["Product", "Batch Code", "Quantity", "Received Date"]}
            rows={productBatches.map((batch) => [
              productById(batch.productId).name,
              batch.batchCode,
              batch.quantity,
              dateFormat.format(new Date(batch.receivedDate)),
            ])}
          />
        </Section>

        <Section id="product-report" title="Product Report">
          <DataTable
            columns={["Product", "Representatives", "Quantity", "Value"]}
            rows={productHolderRows.map(({ product, holders, totalQuantity }) => [
              product.name,
              holders.length,
              totalQuantity,
              currency.format(totalQuantity * product.unitPrice),
            ])}
          />
        </Section>
      </div>
    </main>
  );
}
