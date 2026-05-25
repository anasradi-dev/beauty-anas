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
  ProductCollectionInput,
  ProductInput,
  RepresentativeInput,
} from "@/lib/beauty-repository";

type LocalBeautyStore = {
  representatives: SalesRep[];
  products: typeof products;
  collections: typeof collections;
  productBatches: typeof productBatches;
};

const storeDirectory = path.join(process.cwd(), "data");
const storePath = path.join(storeDirectory, "beauty-store.json");

function freshStore(): LocalBeautyStore {
  return {
    representatives: salesReps,
    products,
    collections,
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
    return JSON.parse(content) as LocalBeautyStore;
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
  return store.collections;
}

export async function createLocalRepresentative(input: RepresentativeInput) {
  const store = await loadStore();
  const representative: SalesRep = {
    id: `rep-${Date.now()}`,
    ...input,
  };

  store.representatives = [...store.representatives, representative];
  await saveStore(store);

  return representative;
}

export async function updateLocalRepresentative(
  id: string,
  input: RepresentativeInput,
) {
  const store = await loadStore();
  const index = store.representatives.findIndex((rep) => rep.id === id);

  if (index === -1) {
    return null;
  }

  const representative = {
    ...store.representatives[index],
    ...input,
  };

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

export async function createLocalProduct(input: ProductInput) {
  const store = await loadStore();
  const product: ProductItem = {
    id: `product-${Date.now()}`,
    ...input,
  };

  store.products = [...store.products, product];
  await saveStore(store);

  return product;
}

export async function updateLocalProduct(id: string, input: ProductInput) {
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
  input: ProductCollectionInput,
) {
  const store = await loadStore();
  const collection: ProductCollection = {
    id: `collection-${Date.now()}`,
    ...input,
  };

  store.collections = [...store.collections, collection];
  await saveStore(store);

  return collection;
}

export async function updateLocalProductCollection(
  id: string,
  input: ProductCollectionInput,
) {
  const store = await loadStore();
  const index = store.collections.findIndex((collection) => collection.id === id);

  if (index === -1) {
    return null;
  }

  const collection = {
    ...store.collections[index],
    ...input,
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
