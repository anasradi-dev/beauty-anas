import { AuthNav } from "./auth-nav";
import { Nav } from "./nav";
import { INav } from "@/types/nav-t";

const menu: INav[] = [
  { title: "Home", slug: "#top" },
  {
    title: "Sales Representatives",
    children: [
      { title: "Representative List", slug: "#representative-list" },
      { title: "Representative Details", slug: "#representative-details" },
      { title: "Representative Products", slug: "#representative-products" },
    ],
  },
  {
    title: "Products",
    children: [
      { title: "Product List", slug: "#product-list" },
      { title: "Product Holders", slug: "#product-holders" },
      { title: "Product Collections", slug: "#product-collections" },
      { title: "Product Batches", slug: "#product-batches" },
    ],
  },
  {
    title: "Settlements",
    children: [
      { title: "Money Deposits", slug: "#money-deposits" },
      { title: "Settlement Dates", slug: "#settlement-dates" },
      { title: "Total Deposited Amount", slug: "#total-deposited-amount" },
    ],
  },
  {
    title: "Sales",
    children: [
      { title: "Sales Volume", slug: "#sales-volume" },
      { title: "Commission Salary", slug: "#commission-salary" },
    ],
  },
  {
    title: "Reports",
    children: [
      { title: "Representative Report", slug: "#representative-report" },
      { title: "Product Report", slug: "#product-report" },
      { title: "Deposit Summary", slug: "#deposit-summary" },
    ],
  },
  { title: "Logo", slug: "/logo" },
];

export async function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-xl">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-4 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/10">
            B
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              BEAUTY
            </p>
            <p className="text-base font-semibold text-slate-900">
              Cosmetic Commission
            </p>
          </div>
        </div>
        <Nav menu={menu} />
        <AuthNav />
      </div>
    </header>
  );
}
