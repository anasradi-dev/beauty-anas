import { AuthNav } from "./auth-nav";
import { BrandLogo } from "./brand-logo";
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
        <BrandLogo />
        <Nav menu={menu} />
        <AuthNav />
      </div>
    </header>
  );
}
