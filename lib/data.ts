export interface ProductItem {
  id: string;
  name: string;
  unitPrice: number;
  batchCode: string;
}

export interface ProductCollection {
  id: string;
  repId: string;
  productId: string;
  quantity: number;
  saleDate: string;
}

export interface SalesRep {
  id: string;
  name: string;
  address: string;
  phone: string;
  settlementDate: string;
  depositedAmount: number;
}

export const commissionRate = 0.05;

export const products: ProductItem[] = [
  { id: "p1", name: "Velvet Lipstick", unitPrice: 18, batchCode: "B-1001" },
  { id: "p2", name: "Hydra Serum", unitPrice: 32, batchCode: "B-1002" },
  { id: "p3", name: "Glow Foundation", unitPrice: 26, batchCode: "B-1003" },
  { id: "p4", name: "Satin Mascara", unitPrice: 14, batchCode: "B-1004" },
  { id: "p5", name: "Precision Eyeliner", unitPrice: 11, batchCode: "B-1005" },
];

export const salesReps: SalesRep[] = [
  {
    id: "r1",
    name: "Lina Ahmed",
    address: "12 Nile Street, Cairo",
    phone: "+20 100 123 4567",
    settlementDate: "2026-06-05",
    depositedAmount: 354,
  },
  {
    id: "r2",
    name: "Nour Hassan",
    address: "48 Ramses Ave, Giza",
    phone: "+20 101 234 5678",
    settlementDate: "2026-06-10",
    depositedAmount: 289,
  },
  {
    id: "r3",
    name: "Sara Youssef",
    address: "73 Corniche, Alexandria",
    phone: "+20 102 345 6789",
    settlementDate: "2026-06-02",
    depositedAmount: 412,
  },
];

export const collections: ProductCollection[] = [
  { id: "c1", repId: "r1", productId: "p1", quantity: 6, saleDate: "2026-05-28" },
  { id: "c2", repId: "r1", productId: "p4", quantity: 8, saleDate: "2026-05-28" },
  { id: "c3", repId: "r2", productId: "p2", quantity: 5, saleDate: "2026-05-27" },
  { id: "c4", repId: "r2", productId: "p5", quantity: 9, saleDate: "2026-05-25" },
  { id: "c5", repId: "r3", productId: "p3", quantity: 7, saleDate: "2026-05-26" },
  { id: "c6", repId: "r3", productId: "p1", quantity: 4, saleDate: "2026-05-26" },
];

export const productBatches = [
  {
    productId: "p1",
    batchCode: "B-1001",
    quantity: 40,
    receivedDate: "2026-05-10",
  },
  {
    productId: "p2",
    batchCode: "B-1002",
    quantity: 30,
    receivedDate: "2026-05-12",
  },
  {
    productId: "p3",
    batchCode: "B-1003",
    quantity: 25,
    receivedDate: "2026-05-14",
  },
  {
    productId: "p4",
    batchCode: "B-1004",
    quantity: 50,
    receivedDate: "2026-05-09",
  },
  {
    productId: "p5",
    batchCode: "B-1005",
    quantity: 45,
    receivedDate: "2026-05-08",
  },
];

export const totalDepositedAmount = salesReps.reduce(
  (sum, rep) => sum + rep.depositedAmount,
  0,
);
