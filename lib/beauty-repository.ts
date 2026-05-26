export * from "@/src/services/beauty-service";
export {
  productCollectionSchema as productCollectionInputSchema,
  productSchema as productInputSchema,
  representativeSchema as representativeInputSchema,
} from "@/src/validators/beauty-validators";
export type {
  IProductCollectionInput as ProductCollectionInput,
  IProductInput as ProductInput,
  IRepresentativeInput as RepresentativeInput,
} from "@/src/validators/beauty-validators";
