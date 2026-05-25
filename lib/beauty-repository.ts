import { z } from "zod";
import {
  ProductBatchModel,
  ProductCollectionDocument,
  ProductCollectionModel,
  ProductDocument,
  ProductModel,
  RepresentativeDocument,
  RepresentativeModel,
} from "@/lib/beauty-models";
import {
  collections,
  productBatches,
  ProductCollection,
  ProductItem,
  products,
  salesReps,
  SalesRep,
} from "@/lib/data";
import { connectMongo } from "@/lib/mongodb";
import {
  createLocalProduct,
  createLocalProductCollection,
  createLocalRepresentative,
  deleteLocalProduct,
  deleteLocalProductCollection,
  deleteLocalRepresentative,
  getLocalProductCollections,
  getLocalProducts,
  getLocalRepresentatives,
  seedLocalBeautyData,
  updateLocalProduct,
  updateLocalProductCollection,
  updateLocalRepresentative,
} from "@/lib/local-beauty-store";

export const representativeInputSchema = z.object({
  name: z.string().trim().min(1),
  address: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  settlementDate: z.string().trim().min(1),
  depositedAmount: z.coerce.number().min(0),
});

export const productInputSchema = z.object({
  name: z.string().trim().min(1),
  unitPrice: z.coerce.number().min(0),
  batchCode: z.string().trim().min(1),
});

export const productCollectionInputSchema = z.object({
  repId: z.string().trim().min(1),
  productId: z.string().trim().min(1),
  quantity: z.coerce.number().int().min(0),
  saleDate: z.string().trim().min(1),
});

export type RepresentativeInput = z.infer<typeof representativeInputSchema>;
export type ProductInput = z.infer<typeof productInputSchema>;
export type ProductCollectionInput = z.infer<
  typeof productCollectionInputSchema
>;

function shouldUseMongo() {
  return Boolean(process.env.MONGODB_URI);
}

function serializeRepresentative(rep: RepresentativeDocument): SalesRep {
  return {
    id: rep.id,
    name: rep.name,
    address: rep.address,
    phone: rep.phone,
    settlementDate: rep.settlementDate,
    depositedAmount: rep.depositedAmount,
  };
}

function serializeProduct(product: ProductDocument): ProductItem {
  return {
    id: product.id,
    name: product.name,
    unitPrice: product.unitPrice,
    batchCode: product.batchCode,
  };
}

function serializeProductCollection(
  collection: ProductCollectionDocument,
): ProductCollection {
  return {
    id: collection.id,
    repId: collection.repId,
    productId: collection.productId,
    quantity: collection.quantity,
    saleDate: collection.saleDate,
  };
}

export async function getRepresentatives() {
  if (!shouldUseMongo()) {
    return getLocalRepresentatives();
  }

  await connectMongo();
  const representatives = await RepresentativeModel.find()
    .sort({ createdAt: 1 })
    .lean<RepresentativeDocument[]>();

  return representatives.map(serializeRepresentative);
}

export async function getProducts() {
  if (!shouldUseMongo()) {
    return getLocalProducts();
  }

  await connectMongo();
  const productRows = await ProductModel.find()
    .sort({ createdAt: 1 })
    .lean<ProductDocument[]>();

  return productRows.map(serializeProduct);
}

export async function getProductCollections() {
  if (!shouldUseMongo()) {
    return getLocalProductCollections();
  }

  await connectMongo();
  let collectionRows = await ProductCollectionModel.find()
    .sort({ createdAt: 1 })
    .lean<ProductCollectionDocument[]>();

  const collectionsMissingIds = collectionRows.filter(
    (collection) => !collection.id,
  );

  if (collectionsMissingIds.length) {
    await Promise.all(
      collectionsMissingIds.map((collection, index) =>
        ProductCollectionModel.updateOne(
          { _id: (collection as ProductCollectionDocument & { _id: unknown })._id },
          { $set: { id: `collection-${Date.now()}-${index}` } },
        ),
      ),
    );

    collectionRows = await ProductCollectionModel.find()
      .sort({ createdAt: 1 })
      .lean<ProductCollectionDocument[]>();
  }

  return collectionRows.map(serializeProductCollection);
}

export async function createRepresentative(input: RepresentativeInput) {
  if (!shouldUseMongo()) {
    return createLocalRepresentative(input);
  }

  await connectMongo();
  const representative = await RepresentativeModel.create({
    id: `rep-${Date.now()}`,
    ...input,
  });

  return serializeRepresentative(representative.toObject());
}

export async function updateRepresentative(
  id: string,
  input: RepresentativeInput,
) {
  if (!shouldUseMongo()) {
    return updateLocalRepresentative(id, input);
  }

  await connectMongo();
  const representative = await RepresentativeModel.findOneAndUpdate(
    { id },
    input,
    { new: true, runValidators: true },
  ).lean<RepresentativeDocument | null>();

  if (!representative) {
    return null;
  }

  return serializeRepresentative(representative);
}

export async function deleteRepresentative(id: string) {
  if (!shouldUseMongo()) {
    return deleteLocalRepresentative(id);
  }

  await connectMongo();
  const representative = await RepresentativeModel.findOneAndDelete({
    id,
  }).lean<RepresentativeDocument | null>();

  return representative ? serializeRepresentative(representative) : null;
}

export async function createProduct(input: ProductInput) {
  if (!shouldUseMongo()) {
    return createLocalProduct(input);
  }

  await connectMongo();
  const product = await ProductModel.create({
    id: `product-${Date.now()}`,
    ...input,
  });

  return serializeProduct(product.toObject());
}

export async function updateProduct(id: string, input: ProductInput) {
  if (!shouldUseMongo()) {
    return updateLocalProduct(id, input);
  }

  await connectMongo();
  const product = await ProductModel.findOneAndUpdate({ id }, input, {
    new: true,
    runValidators: true,
  }).lean<ProductDocument | null>();

  return product ? serializeProduct(product) : null;
}

export async function deleteProduct(id: string) {
  if (!shouldUseMongo()) {
    return deleteLocalProduct(id);
  }

  await connectMongo();
  const product = await ProductModel.findOneAndDelete({
    id,
  }).lean<ProductDocument | null>();

  if (product) {
    await Promise.all([
      ProductCollectionModel.deleteMany({ productId: id }),
      ProductBatchModel.deleteMany({ productId: id }),
    ]);
  }

  return product ? serializeProduct(product) : null;
}

export async function createProductCollection(input: ProductCollectionInput) {
  if (!shouldUseMongo()) {
    return createLocalProductCollection(input);
  }

  await connectMongo();
  const collection = await ProductCollectionModel.create({
    id: `collection-${Date.now()}`,
    ...input,
  });

  return serializeProductCollection(collection.toObject());
}

export async function updateProductCollection(
  id: string,
  input: ProductCollectionInput,
) {
  if (!shouldUseMongo()) {
    return updateLocalProductCollection(id, input);
  }

  await connectMongo();
  const collection = await ProductCollectionModel.findOneAndUpdate(
    { id },
    input,
    { new: true, runValidators: true },
  ).lean<ProductCollectionDocument | null>();

  return collection ? serializeProductCollection(collection) : null;
}

export async function deleteProductCollection(id: string) {
  if (!shouldUseMongo()) {
    return deleteLocalProductCollection(id);
  }

  await connectMongo();
  const collection = await ProductCollectionModel.findOneAndDelete({
    id,
  }).lean<ProductCollectionDocument | null>();

  return collection ? serializeProductCollection(collection) : null;
}

export async function seedBeautyData() {
  if (!shouldUseMongo()) {
    return seedLocalBeautyData();
  }

  await connectMongo();

  await Promise.all([
    RepresentativeModel.deleteMany({}),
    ProductModel.deleteMany({}),
    ProductCollectionModel.deleteMany({}),
    ProductBatchModel.deleteMany({}),
  ]);

  await Promise.all([
    RepresentativeModel.insertMany(salesReps),
    ProductModel.insertMany(products),
    ProductCollectionModel.insertMany(collections),
    ProductBatchModel.insertMany(productBatches),
  ]);

  return getRepresentatives();
}
