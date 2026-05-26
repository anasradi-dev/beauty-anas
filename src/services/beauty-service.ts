import {
  ProductBatchModel,
  ProductCollectionDocument,
  ProductCollectionModel,
  ProductDocument,
  ProductModel,
  RepresentativeDocument,
  RepresentativeModel,
} from "@/src/models/beauty-models";
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
import type {
  IProductCollectionInput,
  IProductInput,
  IRepresentativeInput,
} from "@/src/validators/beauty-validators";

const COMMISSION_RATE = 0.1;

function shouldUseMongo() {
  return Boolean(process.env.MONGODB_URI?.trim());
}

function formatAddress(rep: {
  city: string;
  street: string;
  houseNumber: string;
  apartment?: number | null;
}) {
  const apartment = rep.apartment ? `, Apt ${rep.apartment}` : "";
  return `${rep.houseNumber} ${rep.street}${apartment}, ${rep.city}`;
}

function representativePayload(input: IRepresentativeInput) {
  const apartment = input.apartment ?? null;
  const [fallbackFirstName = "", ...rest] = (input.name || "").split(" ");
  const firstName = input.firstName || fallbackFirstName;
  const lastName = input.lastName || rest.join(" ");
  const city = input.city || "";
  const street = input.street || "";
  const houseNumber = input.houseNumber || "";
  const telephone = input.telephone || input.phone || "";
  const hasStructuredAddress = city && street && houseNumber;

  return {
    ...input,
    firstName,
    lastName,
    city,
    street,
    houseNumber,
    apartment,
    telephone,
    name: `${firstName} ${lastName}`.trim() || input.name || "",
    address: hasStructuredAddress
      ? formatAddress({ city, street, houseNumber, apartment })
      : input.address || "",
    phone: telephone,
    settlementDate: input.settlementDate || new Date().toISOString().slice(0, 10),
    depositedAmount: input.depositedAmount ?? 0,
  };
}

function serializeRepresentative(rep: RepresentativeDocument): SalesRep {
  const [fallbackFirstName = "", ...rest] = (rep.name || "").split(" ");
  const firstName = rep.firstName || fallbackFirstName;
  const lastName = rep.lastName || rest.join(" ");
  const city = rep.city || "";
  const street = rep.street || "";
  const houseNumber = rep.houseNumber || "";
  const apartment = rep.apartment ?? null;
  const telephone = rep.telephone || rep.phone;
  const address =
    city && street && houseNumber
      ? formatAddress({ city, street, houseNumber, apartment })
      : rep.address;

  return {
    id: rep.id,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim() || rep.name,
    city,
    street,
    houseNumber,
    apartment,
    telephone,
    address,
    phone: telephone,
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
  collection: ProductCollectionDocument & { repId?: string },
): ProductCollection {
  const representativeId = collection.representativeId || collection.repId || "";

  return {
    id: collection.id,
    representativeId,
    repId: representativeId,
    productId: collection.productId,
    quantity: collection.quantity,
    saleDate: collection.saleDate,
  };
}

export const beautyService = {
  async getRepresentatives() {
    if (!shouldUseMongo()) {
      return getLocalRepresentatives();
    }

    await connectMongo();
    const representatives = await RepresentativeModel.find()
      .sort({ createdAt: 1 })
      .lean<RepresentativeDocument[]>();

    return representatives.map(serializeRepresentative);
  },

  async getProducts() {
    if (!shouldUseMongo()) {
      return getLocalProducts();
    }

    await connectMongo();
    const productRows = await ProductModel.find()
      .sort({ createdAt: 1 })
      .lean<ProductDocument[]>();

    return productRows.map(serializeProduct);
  },

  async getProductCollections() {
    if (!shouldUseMongo()) {
      return getLocalProductCollections();
    }

    await connectMongo();
    const collectionRows = await ProductCollectionModel.find()
      .sort({ createdAt: 1 })
      .lean<Array<ProductCollectionDocument & { repId?: string }>>();

    return collectionRows.map(serializeProductCollection);
  },

  async createRepresentative(input: IRepresentativeInput) {
    if (!shouldUseMongo()) {
      return createLocalRepresentative(input);
    }

    await connectMongo();
    const payload = representativePayload(input);
    const duplicate = await RepresentativeModel.findOne({
      name: payload.name,
    }).lean<RepresentativeDocument | null>();

    if (duplicate) {
      throw new Error("A representative with this name already exists.");
    }

    const representative = await RepresentativeModel.create({
      id: `rep-${Date.now()}`,
      ...payload,
    });

    return serializeRepresentative(representative.toObject());
  },

  async updateRepresentative(
    representativeId: string,
    input: IRepresentativeInput,
  ) {
    if (!shouldUseMongo()) {
      return updateLocalRepresentative(representativeId, input);
    }

    await connectMongo();
    const payload = representativePayload(input);
    const duplicate = await RepresentativeModel.findOne({
      id: { $ne: representativeId },
      name: payload.name,
    }).lean<RepresentativeDocument | null>();

    if (duplicate) {
      throw new Error("A representative with this name already exists.");
    }

    const representative = await RepresentativeModel.findOneAndUpdate(
      { id: representativeId },
      payload,
      { new: true, runValidators: true },
    ).lean<RepresentativeDocument | null>();

    return representative ? serializeRepresentative(representative) : null;
  },

  async deleteRepresentative(representativeId: string) {
    if (!shouldUseMongo()) {
      return deleteLocalRepresentative(representativeId);
    }

    await connectMongo();
    const representative = await RepresentativeModel.findOneAndDelete({
      id: representativeId,
    }).lean<RepresentativeDocument | null>();

    return representative ? serializeRepresentative(representative) : null;
  },

  async createProduct(input: IProductInput) {
    if (!shouldUseMongo()) {
      return createLocalProduct(input);
    }

    await connectMongo();
    const product = await ProductModel.create({
      id: `product-${Date.now()}`,
      ...input,
    });

    return serializeProduct(product.toObject());
  },

  async updateProduct(productId: string, input: IProductInput) {
    if (!shouldUseMongo()) {
      return updateLocalProduct(productId, input);
    }

    await connectMongo();
    const product = await ProductModel.findOneAndUpdate({ id: productId }, input, {
      new: true,
      runValidators: true,
    }).lean<ProductDocument | null>();

    return product ? serializeProduct(product) : null;
  },

  async deleteProduct(productId: string) {
    if (!shouldUseMongo()) {
      return deleteLocalProduct(productId);
    }

    await connectMongo();
    const product = await ProductModel.findOneAndDelete({
      id: productId,
    }).lean<ProductDocument | null>();

    if (product) {
      await Promise.all([
        ProductCollectionModel.deleteMany({ productId }),
        ProductBatchModel.deleteMany({ productId }),
      ]);
    }

    return product ? serializeProduct(product) : null;
  },

  async createProductCollection(input: IProductCollectionInput) {
    if (!shouldUseMongo()) {
      return createLocalProductCollection(input);
    }

    await connectMongo();
    const collection = await ProductCollectionModel.create({
      id: `collection-${Date.now()}`,
      ...input,
    });

    return serializeProductCollection(collection.toObject());
  },

  async updateProductCollection(
    collectionId: string,
    input: IProductCollectionInput,
  ) {
    if (!shouldUseMongo()) {
      return updateLocalProductCollection(collectionId, input);
    }

    await connectMongo();
    const collection = await ProductCollectionModel.findOneAndUpdate(
      { id: collectionId },
      input,
      { new: true, runValidators: true },
    ).lean<ProductCollectionDocument | null>();

    return collection ? serializeProductCollection(collection) : null;
  },

  async deleteProductCollection(collectionId: string) {
    if (!shouldUseMongo()) {
      return deleteLocalProductCollection(collectionId);
    }

    await connectMongo();
    const collection = await ProductCollectionModel.findOneAndDelete({
      id: collectionId,
    }).lean<ProductCollectionDocument | null>();

    return collection ? serializeProductCollection(collection) : null;
  },

  async getTotalDepositedAmount() {
    const representatives = await this.getRepresentatives();
    return representatives.reduce((sum, rep) => sum + rep.depositedAmount, 0);
  },

  async getCommissionSalary(representativeId: string) {
    const [productsRows, collectionRows] = await Promise.all([
      this.getProducts(),
      this.getProductCollections(),
    ]);
    const totalSales = collectionRows
      .filter((collection) => collection.representativeId === representativeId)
      .reduce((sum, collection) => {
        const product = productsRows.find((item) => item.id === collection.productId);
        return sum + (product?.unitPrice || 0) * collection.quantity;
      }, 0);

    return totalSales * COMMISSION_RATE;
  },

  async getSalesRows() {
    const [representatives, productsRows, collectionRows] = await Promise.all([
      this.getRepresentatives(),
      this.getProducts(),
      this.getProductCollections(),
    ]);

    return collectionRows.map((collection) => {
      const representative = representatives.find(
        (rep) => rep.id === collection.representativeId,
      );
      const product = productsRows.find((item) => item.id === collection.productId);
      const unitPrice = product?.unitPrice || 0;
      const salesVolume = unitPrice * collection.quantity;

      return {
        ...collection,
        representativeName: representative?.name || "Unknown representative",
        productName: product?.name || "Unknown product",
        unitPrice,
        salesVolume,
        commission: salesVolume * COMMISSION_RATE,
      };
    });
  },

  async seedBeautyData() {
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

    return this.getRepresentatives();
  },
};

export const getRepresentatives = beautyService.getRepresentatives.bind(beautyService);
export const getProducts = beautyService.getProducts.bind(beautyService);
export const getProductCollections =
  beautyService.getProductCollections.bind(beautyService);
export const createRepresentative =
  beautyService.createRepresentative.bind(beautyService);
export const updateRepresentative =
  beautyService.updateRepresentative.bind(beautyService);
export const deleteRepresentative =
  beautyService.deleteRepresentative.bind(beautyService);
export const createProduct = beautyService.createProduct.bind(beautyService);
export const updateProduct = beautyService.updateProduct.bind(beautyService);
export const deleteProduct = beautyService.deleteProduct.bind(beautyService);
export const createProductCollection =
  beautyService.createProductCollection.bind(beautyService);
export const updateProductCollection =
  beautyService.updateProductCollection.bind(beautyService);
export const deleteProductCollection =
  beautyService.deleteProductCollection.bind(beautyService);
export const seedBeautyData = beautyService.seedBeautyData.bind(beautyService);
export const getTotalDepositedAmount =
  beautyService.getTotalDepositedAmount.bind(beautyService);
export const getCommissionSalary =
  beautyService.getCommissionSalary.bind(beautyService);
export const getSalesRows = beautyService.getSalesRows.bind(beautyService);
