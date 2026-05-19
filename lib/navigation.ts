import { INav } from "@/types/nav-t";

export const beautyNavigation: INav[] = [
  { title: "Home", slug: "/" },
  {
    title: "Sales Representatives",
    children: [
      { title: "Representative List", slug: "/sales-representatives/list" },
      { title: "Representative Details", slug: "/sales-representatives/details" },
      { title: "Representative Products", slug: "/sales-representatives/products" },
    ],
  },
  {
    title: "Products",
    children: [
      { title: "Product List", slug: "/products/list" },
      { title: "Product Holders", slug: "/products/holders" },
      { title: "Product Collections", slug: "/products/collections" },
    ],
  },
  {
    title: "Settlements",
    children: [
      { title: "Money Deposits", slug: "/settlements/money-deposits" },
      { title: "Settlement Dates", slug: "/settlements/dates" },
      { title: "Total Deposited Amount", slug: "/settlements/total-deposited" },
    ],
  },
  {
    title: "Sales",
    children: [
      { title: "Sales Volume", slug: "/sales/volume" },
      { title: "Commission Salary", slug: "/sales/commission-salary" },
      { title: "Product Batches", slug: "/sales/product-batches" },
    ],
  },
  {
    title: "Reports",
    children: [
      { title: "Representative Report", slug: "/reports/representatives" },
      { title: "Product Report", slug: "/reports/products" },
      { title: "Deposit Summary", slug: "/reports/deposits" },
    ],
  },
];
