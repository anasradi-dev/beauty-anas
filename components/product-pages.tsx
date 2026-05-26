import { ProductManager } from "@/components/product-manager";
import { beautyService } from "@/src/services/beauty-service";

async function productManagerData() {
  const [products, collections, representatives] = await Promise.all([
    beautyService.getProducts(),
    beautyService.getProductCollections(),
    beautyService.getRepresentatives(),
  ]);

  return { products, collections, representatives };
}

export async function ProductListPageContent() {
  const products = await beautyService.getProducts();

  return (
    <ProductManager
      initialProducts={products}
      initialCollections={[]}
      representatives={[]}
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
