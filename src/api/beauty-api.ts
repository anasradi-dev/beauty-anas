import { requestJson } from "@/src/api/http";
import type { ProductCollection, ProductItem, SalesRep } from "@/lib/data";
import type {
  IProductCollectionInput,
  IProductInput,
  IRepresentativeInput,
} from "@/src/validators/beauty-validators";

export type RepresentativesResponse = {
  representatives?: SalesRep[];
  representative?: SalesRep;
};

export type ProductResponse = {
  products?: ProductItem[];
  product?: ProductItem;
};

export type CollectionResponse = {
  collections?: ProductCollection[];
  collection?: ProductCollection;
};

export function getRepresentatives() {
  return requestJson<RepresentativesResponse>("/api/representatives");
}

export function createRepresentative(payload: IRepresentativeInput) {
  return requestJson<RepresentativesResponse>("/api/representatives", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function updateRepresentative(
  representativeId: string,
  payload: IRepresentativeInput,
) {
  return requestJson<RepresentativesResponse>(
    `/api/representatives/${representativeId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
}

export function deleteRepresentative(representativeId: string) {
  return requestJson<RepresentativesResponse>(
    `/api/representatives/${representativeId}`,
    { method: "DELETE" },
  );
}

export function seedBeautyData() {
  return requestJson<RepresentativesResponse>("/api/beauty/seed", {
    method: "POST",
  });
}

export function createProduct(payload: IProductInput) {
  return requestJson<ProductResponse>("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function updateProduct(productId: string, payload: IProductInput) {
  return requestJson<ProductResponse>(`/api/products/${productId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function deleteProduct(productId: string) {
  return requestJson<ProductResponse>(`/api/products/${productId}`, {
    method: "DELETE",
  });
}

export function createProductCollection(payload: IProductCollectionInput) {
  return requestJson<CollectionResponse>("/api/product-collections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function updateProductCollection(
  collectionId: string,
  payload: IProductCollectionInput,
) {
  return requestJson<CollectionResponse>(
    `/api/product-collections/${collectionId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
}

export function deleteProductCollection(collectionId: string) {
  return requestJson<CollectionResponse>(
    `/api/product-collections/${collectionId}`,
    { method: "DELETE" },
  );
}
