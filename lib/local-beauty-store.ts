import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  collections,
  productBatches,
  products,
  ProductCollection,
  ProductItem,
  salesReps,
  SalesRep,
} from "@/lib/data";
import type {
  IProductCollectionInput,
  IProductInput,
  IRepresentativeInput,
} from "@/src/validators/beauty-validators";

type LocalProductCollection = ProductCollection & {
  repId?: string;
};

type LocalBeautyStore = {
  representatives: SalesRep[];
  products: typeof products;
  collections: LocalProductCollection[];
  productBatches: typeof productBatches;
};

function formatAddress(rep: {
  city: string;
  street: string;
  houseNumber: string;
  apartment?: number | null;
}) {
  const apartment = rep.apartment ? `, Apt ${rep.apartment}` : "";
  return `${rep.houseNumber} ${rep.street}${apartment}, ${rep.city}`;
}

function normalizeRepresentative(rep: SalesRep): SalesRep {
  const [fallbackFirstName = "", ...rest] = (rep.name || "").split(" ");
  const firstName = rep.firstName || fallbackFirstName;
  const lastName = rep.lastName || rest.join(" ");
  const city = rep.city || "";
  const street = rep.street || "";
  const houseNumber = rep.houseNumber || "";
  const telephone = rep.telephone || rep.phone || "";
  const apartment = rep.apartment ?? null;
  const address =
    city && street && houseNumber
      ? formatAddress({ city, street, houseNumber, apartment })
      : rep.address;

  return {
    ...rep,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim(),
    city,
    street,
    houseNumber,
    apartment,
    telephone,
    address,
    phone: telephone,
    settlementDate: rep.settlementDate || new Date().toISOString().slice(0, 10),
    depositedAmount: rep.depositedAmount || 0,
  };
}

function normalizeRepresentatives(representatives: SalesRep[]) {
  return representatives.map(normalizeRepresentative);
}

function normalizeCollections(collectionRows: LocalProductCollection[]) {
  return collectionRows.map((collection) => ({
    id: collection.id,
    representativeId: collection.representativeId || collection.repId || "",
    repId: collection.repId || collection.representativeId || "",
    productId: collection.productId,
    quantity: collection.quantity,
    saleDate: collection.saleDate,
  }));
}

const storeDirectory = path.join(process.cwd(), "data");
const storePath = path.join(storeDirectory, "beauty-store.json");

function freshStore(): LocalBeautyStore {
  return {
    representatives: normalizeRepresentatives(salesReps),
    products,
    collections: normalizeCollections(collections),
    productBatches,
  };
}

async function saveStore(store: LocalBeautyStore) {
  await mkdir(storeDirectory, { recursive: true });
  await writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
}

async function loadStore() {
  try {
    const content = await readFile(storePath, "utf8");
    const store = JSON.parse(content) as LocalBeautyStore;
    store.representatives = normalizeRepresentatives(store.representatives);
    store.collections = normalizeCollections(store.collections);
    return store;
  } catch {
    const store = freshStore();
    await saveStore(store);
    return store;
  }
}

export async function getLocalRepresentatives() {
  const store = await loadStore();
  return store.representatives;
}

export async function getLocalProducts() {
  const store = await loadStore();
  return store.products;
}

export async function getLocalProductCollections() {
  const store = await loadStore();
  return normalizeCollections(store.collections);
}

export async function createLocalRepresentative(input: IRepresentativeInput) {
  const store = await loadStore();
  const [fallbackFirstName = "", ...rest] = (input.name || "").split(" ");
  const firstName = input.firstName || fallbackFirstName;
  const lastName = input.lastName || rest.join(" ");
  const city = input.city || "";
  const street = input.street || "";
  const houseNumber = input.houseNumber || "";
  const telephone = input.telephone || input.phone || "";
  const name = `${firstName} ${lastName}`.trim().toLowerCase();
  const duplicate = store.representatives.some(
    (rep) => rep.name.trim().toLowerCase() === name,
  );

  if (duplicate) {
    throw new Error("A representative with this name already exists.");
  }

  const representative = normalizeRepresentative({
    id: `rep-${Date.now()}`,
    ...input,
    firstName,
    lastName,
    city,
    street,
    houseNumber,
    apartment: input.apartment ?? null,
    telephone,
    name: `${firstName} ${lastName}`.trim() || input.name || "",
    address: input.address || "",
    phone: telephone,
    settlementDate: input.settlementDate || new Date().toISOString().slice(0, 10),
    depositedAmount: input.depositedAmount ?? 0,
  });

  store.representatives = [...store.representatives, representative];
  await saveStore(store);

  return representative;
}

export async function updateLocalRepresentative(
  id: string,
  input: IRepresentativeInput,
) {
  const store = await loadStore();
  const index = store.representatives.findIndex((rep) => rep.id === id);

  if (index === -1) {
    return null;
  }

  const currentRep = store.representatives[index];
  const firstName = input.firstName || currentRep.firstName;
  const lastName = input.lastName || currentRep.lastName;
  const name = `${firstName} ${lastName}`.trim().toLowerCase();
  const duplicate = store.representatives.some(
    (rep) => rep.id !== id && rep.name.trim().toLowerCase() === name,
  );

  if (duplicate) {
    throw new Error("A representative with this name already exists.");
  }

  const representative = normalizeRepresentative({
    ...currentRep,
    ...input,
    firstName,
    lastName,
    apartment: input.apartment ?? null,
  });

  store.representatives[index] = representative;
  await saveStore(store);

  return representative;
}

export async function deleteLocalRepresentative(id: string) {
  const store = await loadStore();
  const representative = store.representatives.find((rep) => rep.id === id);

  if (!representative) {
    return null;
  }

  store.representatives = store.representatives.filter((rep) => rep.id !== id);
  await saveStore(store);

  return representative;
}

export async function createLocalProduct(input: IProductInput) {
  const store = await loadStore();
  const product: ProductItem = {
    id: `product-${Date.now()}`,
    ...input,
  };

  store.products = [...store.products, product];
  await saveStore(store);

  return product;
}

export async function updateLocalProduct(id: string, input: IProductInput) {
  const store = await loadStore();
  const index = store.products.findIndex((product) => product.id === id);

  if (index === -1) {
    return null;
  }

  const product = {
    ...store.products[index],
    ...input,
  };

  store.products[index] = product;
  await saveStore(store);

  return product;
}

export async function deleteLocalProduct(id: string) {
  const store = await loadStore();
  const product = store.products.find((item) => item.id === id);

  if (!product) {
    return null;
  }

  store.products = store.products.filter((item) => item.id !== id);
  store.collections = store.collections.filter((item) => item.productId !== id);
  store.productBatches = store.productBatches.filter(
    (item) => item.productId !== id,
  );
  await saveStore(store);

  return product;
}

export async function createLocalProductCollection(
  input: IProductCollectionInput,
) {
  const store = await loadStore();
  const collection: ProductCollection = {
    id: `collection-${Date.now()}`,
    repId: input.representativeId,
    ...input,
  };

  store.collections = [...store.collections, collection];
  await saveStore(store);

  return collection;
}

export async function updateLocalProductCollection(
  id: string,
  input: IProductCollectionInput,
) {
  const store = await loadStore();
  const index = store.collections.findIndex((collection) => collection.id === id);

  if (index === -1) {
    return null;
  }

  const collection = {
    ...store.collections[index],
    ...input,
    repId: input.representativeId,
  };

  store.collections[index] = collection;
  await saveStore(store);

  return collection;
}

export async function deleteLocalProductCollection(id: string) {
  const store = await loadStore();
  const collection = store.collections.find((item) => item.id === id);

  if (!collection) {
    return null;
  }

  store.collections = store.collections.filter((item) => item.id !== id);
  await saveStore(store);

  return collection;
}

export async function seedLocalBeautyData() {
  const store = freshStore();
  await saveStore(store);
  return store.representatives;
}
