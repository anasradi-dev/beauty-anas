import { beautyService } from "@/src/services/beauty-service";
import { commissionRate, productBatches } from "@/lib/data";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

async function analyticsData() {
  const [representatives, products, collections, rows] = await Promise.all([
    beautyService.getRepresentatives(),
    beautyService.getProducts(),
    beautyService.getProductCollections(),
    beautyService.getSalesRows(),
  ]);

  return { representatives, products, collections, rows };
}

function PageShell({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900 lg:px-10">
      <section className="container mx-auto rounded-lg border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-pink-600">
          {eyebrow}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
          {title}
        </h1>
        <div className="mt-5">{children}</div>
      </section>
    </main>
  );
}

function DataTable({
  minWidth = "min-w-[820px]",
  headers,
  children,
}: {
  minWidth?: string;
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
      <div className="overflow-x-auto">
        <table className={`w-full ${minWidth} border-collapse text-left text-sm`}>
          <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export async function SalesVolumePageContent() {
  const { rows } = await analyticsData();

  return (
    <PageShell eyebrow="Sales" title="Sales Volume">
      <DataTable
        headers={[
          "Sales Representative",
          "Product Name",
          "Unit Price",
          "Quantity",
          "Sales Volume",
        ]}
      >
        {rows.map((row) => (
          <tr key={row.id} className="text-slate-700">
            <td className="px-4 py-3 align-top">{row.representativeName}</td>
            <td className="px-4 py-3 align-top">{row.productName}</td>
            <td className="px-4 py-3 align-top">
              {currency.format(row.unitPrice)}
            </td>
            <td className="px-4 py-3 align-top">{row.quantity}</td>
            <td className="px-4 py-3 align-top">
              {currency.format(row.salesVolume)}
            </td>
          </tr>
        ))}
      </DataTable>
    </PageShell>
  );
}

export async function CommissionSalaryPageContent() {
  const { representatives, rows } = await analyticsData();

  const salaryRows = representatives.map((rep) => {
    const repRows = rows.filter((row) => row.representativeId === rep.id);
    const salesVolume = repRows.reduce((sum, row) => sum + row.salesVolume, 0);

    return {
      rep,
      salesVolume,
      commission: repRows.reduce((sum, row) => sum + row.commission, 0),
    };
  });

  return (
    <PageShell eyebrow="Sales" title="Commission Salary">
      <DataTable
        headers={[
          "Sales Representative",
          "Sales Volume",
          "Commission Rate",
          "Salary",
        ]}
      >
        {salaryRows.map((row) => (
          <tr key={row.rep.id} className="text-slate-700">
            <td className="px-4 py-3 align-top">{row.rep.name}</td>
            <td className="px-4 py-3 align-top">
              {currency.format(row.salesVolume)}
            </td>
            <td className="px-4 py-3 align-top">{commissionRate * 100}%</td>
            <td className="px-4 py-3 align-top">
              {currency.format(row.commission)}
            </td>
          </tr>
        ))}
      </DataTable>
    </PageShell>
  );
}

export async function ProductBatchesPageContent() {
  const { products } = await analyticsData();

  const batchRows = productBatches.map((batch) => {
    const product = products.find((item) => item.id === batch.productId);
    return {
      ...batch,
      productName: product?.name || "Unknown product",
    };
  });

  return (
    <PageShell eyebrow="Sales" title="Product Batches">
      <DataTable
        headers={["Product Name", "Batch Code", "Quantity", "Received Date"]}
      >
        {batchRows.map((row) => (
          <tr key={`${row.productId}-${row.batchCode}`} className="text-slate-700">
            <td className="px-4 py-3 align-top">{row.productName}</td>
            <td className="px-4 py-3 align-top">{row.batchCode}</td>
            <td className="px-4 py-3 align-top">{row.quantity}</td>
            <td className="px-4 py-3 align-top">
              {dateFormat.format(new Date(row.receivedDate))}
            </td>
          </tr>
        ))}
      </DataTable>
    </PageShell>
  );
}

export async function RepresentativeReportPageContent() {
  const { representatives, rows } = await analyticsData();

  const reportRows = representatives.map((rep) => {
    const repRows = rows.filter((row) => row.representativeId === rep.id);
    const productNames = repRows.map((row) => row.productName);
    const totalQuantity = repRows.reduce((sum, row) => sum + row.quantity, 0);
    const salesVolume = repRows.reduce((sum, row) => sum + row.salesVolume, 0);

    return { rep, productNames, totalQuantity, salesVolume };
  });

  return (
    <PageShell eyebrow="Reports" title="Representative Report">
      <DataTable
        minWidth="min-w-[920px]"
        headers={[
          "Sales Representative",
          "Telephone",
          "Products Taken",
          "Total Quantity",
          "Sales Volume",
        ]}
      >
        {reportRows.map((row) => (
          <tr key={row.rep.id} className="text-slate-700">
            <td className="px-4 py-3 align-top">{row.rep.name}</td>
            <td className="px-4 py-3 align-top">{row.rep.phone}</td>
            <td className="px-4 py-3 align-top">
              {row.productNames.join(", ") || "No products yet"}
            </td>
            <td className="px-4 py-3 align-top">{row.totalQuantity}</td>
            <td className="px-4 py-3 align-top">
              {currency.format(row.salesVolume)}
            </td>
          </tr>
        ))}
      </DataTable>
    </PageShell>
  );
}

export async function ProductReportPageContent() {
  const { products, rows } = await analyticsData();

  const reportRows = products.map((product) => {
    const productRows = rows.filter((row) => row.productId === product.id);
    const representativeNames = productRows.map(
      (row) => row.representativeName,
    );
    const totalQuantity = productRows.reduce((sum, row) => sum + row.quantity, 0);
    const salesVolume = productRows.reduce((sum, row) => sum + row.salesVolume, 0);

    return { product, representativeNames, totalQuantity, salesVolume };
  });

  return (
    <PageShell eyebrow="Reports" title="Product Report">
      <DataTable
        minWidth="min-w-[920px]"
        headers={[
          "Product Name",
          "Unit Price",
          "Sales Representatives",
          "Total Quantity",
          "Sales Volume",
        ]}
      >
        {reportRows.map((row) => (
          <tr key={row.product.id} className="text-slate-700">
            <td className="px-4 py-3 align-top">{row.product.name}</td>
            <td className="px-4 py-3 align-top">
              {currency.format(row.product.unitPrice)}
            </td>
            <td className="px-4 py-3 align-top">
              {row.representativeNames.join(", ") || "No holders yet"}
            </td>
            <td className="px-4 py-3 align-top">{row.totalQuantity}</td>
            <td className="px-4 py-3 align-top">
              {currency.format(row.salesVolume)}
            </td>
          </tr>
        ))}
      </DataTable>
    </PageShell>
  );
}

export async function DepositSummaryPageContent() {
  const { representatives } = await analyticsData();
  const totalDeposited = await beautyService.getTotalDepositedAmount();

  return (
    <PageShell eyebrow="Reports" title="Deposit Summary">
      <div className="mb-5 rounded-lg border border-slate-200 bg-slate-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Total deposited amount
        </p>
        <p className="mt-2 text-3xl font-semibold text-slate-950">
          {currency.format(totalDeposited)}
        </p>
      </div>
      <DataTable
        headers={[
          "Sales Representative",
          "Telephone",
          "Settlement Date",
          "Deposited Amount",
        ]}
      >
        {representatives.map((rep) => (
          <tr key={rep.id} className="text-slate-700">
            <td className="px-4 py-3 align-top">{rep.name}</td>
            <td className="px-4 py-3 align-top">{rep.phone}</td>
            <td className="px-4 py-3 align-top">
              {dateFormat.format(new Date(rep.settlementDate))}
            </td>
            <td className="px-4 py-3 align-top">
              {currency.format(rep.depositedAmount)}
            </td>
          </tr>
        ))}
      </DataTable>
    </PageShell>
  );
}
