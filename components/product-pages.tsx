import { ProductManager } from "@/components/product-manager";
import {
  getProductCollections,
  getProducts,
  getRepresentatives,
} from "@/lib/beauty-repository";

async function productManagerData() {
  const [products, collections, representatives] = await Promise.all([
    getProducts(),
    getProductCollections(),
    getRepresentatives(),
  ]);

  return { products, collections, representatives };
}

export async function ProductListPageContent() {
  const { products, collections, representatives } = await productManagerData();

  return (
    <ProductManager
      initialProducts={products}
      initialCollections={collections}
      representatives={representatives}
      view="list"
    />
  );
}

export async function ProductHoldersPageContent() {
  const { products, collections, representatives } = await productManagerData();

  return (
    <ProductManager
      initialProducts={products}
      initialCollections={collections}
      representatives={representatives}
      view="holders"
    />
  );
}

export async function ProductCollectionsPageContent() {
  const { products, collections, representatives } = await productManagerData();

  return (
    <ProductManager
      initialProducts={products}
      initialCollections={collections}
      representatives={representatives}
      view="collections"
    />
  );
}
