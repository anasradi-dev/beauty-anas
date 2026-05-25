import mongoose, { Schema } from "mongoose";

export type RepresentativeDocument = {
  id: string;
  name: string;
  address: string;
  phone: string;
  settlementDate: string;
  depositedAmount: number;
};

export type ProductDocument = {
  id: string;
  name: string;
  unitPrice: number;
  batchCode: string;
};

export type ProductCollectionDocument = {
  id: string;
  repId: string;
  productId: string;
  quantity: number;
  saleDate: string;
};

export type ProductBatchDocument = {
  productId: string;
  batchCode: string;
  quantity: number;
  receivedDate: string;
};

const representativeSchema = new Schema<RepresentativeDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    settlementDate: { type: String, required: true },
    depositedAmount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true, versionKey: false },
);

const productSchema = new Schema<ProductDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    unitPrice: { type: Number, required: true, min: 0 },
    batchCode: { type: String, required: true, trim: true },
  },
  { timestamps: true, versionKey: false },
);

const productCollectionSchema = new Schema<ProductCollectionDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    repId: { type: String, required: true, index: true },
    productId: { type: String, required: true, index: true },
    quantity: { type: Number, required: true, min: 0 },
    saleDate: { type: String, required: true },
  },
  { timestamps: true, versionKey: false },
);

const productBatchSchema = new Schema<ProductBatchDocument>(
  {
    productId: { type: String, required: true, index: true },
    batchCode: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    receivedDate: { type: String, required: true },
  },
  { timestamps: true, versionKey: false },
);

export const RepresentativeModel =
  mongoose.models.Representative ||
  mongoose.model<RepresentativeDocument>("Representative", representativeSchema);

export const ProductModel =
  mongoose.models.Product ||
  mongoose.model<ProductDocument>("Product", productSchema);

export const ProductCollectionModel =
  mongoose.models.ProductCollection ||
  mongoose.model<ProductCollectionDocument>(
    "ProductCollection",
    productCollectionSchema,
  );

export const ProductBatchModel =
  mongoose.models.ProductBatch ||
  mongoose.model<ProductBatchDocument>("ProductBatch", productBatchSchema);
