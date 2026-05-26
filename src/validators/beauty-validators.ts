import { z } from "zod";

export const representativeSchema = z.object({
  firstName: z.string().trim().optional(),
  lastName: z.string().trim().optional(),
  city: z.string().trim().optional(),
  street: z.string().trim().optional(),
  houseNumber: z.string().trim().optional(),
  apartment: z.coerce.number().int().min(0).optional().nullable(),
  telephone: z.string().trim().optional(),
  name: z.string().trim().optional(),
  address: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  settlementDate: z.string().trim().optional(),
  depositedAmount: z.coerce.number().min(0).optional(),
});

export const productSchema = z.object({
  name: z.string().trim().min(1),
  unitPrice: z.coerce.number().min(0),
  batchCode: z.string().trim().min(1),
});

export const productCollectionSchema = z.object({
  representativeId: z.string().trim().min(1),
  productId: z.string().trim().min(1),
  quantity: z.coerce.number().int().min(0),
  saleDate: z.string().trim().min(1),
});

export type IRepresentativeInput = z.infer<typeof representativeSchema>;
export type IProductInput = z.infer<typeof productSchema>;
export type IProductCollectionInput = z.infer<typeof productCollectionSchema>;
