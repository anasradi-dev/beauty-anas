import { INav } from "@/types/nav-t";

export const beautyNavigation: INav[] = [
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
      { title: "Product Batches", slug: "#product-batches" },
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
];
