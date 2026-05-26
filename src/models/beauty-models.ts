import mongoose, { Schema } from "mongoose";

export type RepresentativeDocument = {
  id: string;
  firstName?: string;
  lastName?: string;
  name: string;
  city?: string;
  street?: string;
  houseNumber?: string;
  apartment?: number | null;
  telephone?: string;
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
  representativeId: string;
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

export type UserDocument = {
  email: string;
  passwordHash: string;
  role: "admin" | "user";
};

const representativeSchema = new Schema<RepresentativeDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    name: { type: String, required: true, trim: true },
    city: { type: String, trim: true },
    street: { type: String, trim: true },
    houseNumber: { type: String, trim: true },
    apartment: { type: Number, min: 0, default: null },
    telephone: { type: String, trim: true },
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
    representativeId: { type: String, required: true, index: true },
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

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], required: true },
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

export const UserModel =
  mongoose.models.User || mongoose.model<UserDocument>("User", userSchema);
