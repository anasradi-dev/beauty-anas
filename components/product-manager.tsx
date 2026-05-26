"use client";

import {
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { FormEvent, useMemo, useState } from "react";
import { ProductCollection, ProductItem, SalesRep } from "@/lib/data";
import { useAuth } from "@/components/auth";
import {
  createProduct,
  createProductCollection,
  deleteProduct,
  deleteProductCollection,
  updateProduct,
  updateProductCollection,
} from "@/src/api/beauty-api";

type ProductManagerProps = {
  initialProducts: ProductItem[];
  initialCollections: ProductCollection[];
  representatives: SalesRep[];
  view: "list" | "holders" | "collections";
};

type ProductForm = {
  name: string;
  unitPrice: string;
  batchCode: string;
};

type CollectionForm = {
  representativeId: string;
  productId: string;
  quantity: string;
  saleDate: string;
};

const emptyProductForm: ProductForm = {
  name: "",
  unitPrice: "",
  batchCode: "",
};

const emptyCollectionForm: CollectionForm = {
  representativeId: "",
  productId: "",
  quantity: "",
  saleDate: "",
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900 lg:px-10">
      <section className="container mx-auto rounded-lg border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-pink-600">
          Products
        </p>
        {children}
      </section>
    </main>
  );
}

function Toolbar({
  title,
  actionLabel,
  onAdd,
}: {
  title: string;
  actionLabel: string;
  onAdd: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
        {title}
      </h1>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm shadow-slate-900/15 transition hover:bg-pink-700"
      >
        <PlusIcon className="h-4 w-4" />
        {actionLabel}
      </button>
    </div>
  );
}

export function ProductManager({
  initialProducts,
  initialCollections,
  representatives,
  view,
}: ProductManagerProps) {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState(initialProducts);
  const [collections, setCollections] = useState(initialCollections);
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm);
  const [collectionForm, setCollectionForm] =
    useState<CollectionForm>(emptyCollectionForm);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(
    null,
  );
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [isCollectionFormOpen, setIsCollectionFormOpen] = useState(false);

  const collectionRows = useMemo(
    () =>
      collections.map((collection) => {
        const product = products.find(
          (item) => item.id === collection.productId,
        );
        const representative = representatives.find(
          (item) => item.id === collection.representativeId,
        );
        const unitPrice = product?.unitPrice || 0;

        return {
          ...collection,
          productName: product?.name || "Unknown product",
          representativeName: representative?.name || "Unknown representative",
          unitPrice,
          value: unitPrice * collection.quantity,
        };
      }),
    [collections, products, representatives],
  );

  function openProductForm(product?: ProductItem) {
    if (!isAdmin) return;

    if (product) {
      setEditingProductId(product.id);
      setProductForm({
        name: product.name,
        unitPrice: String(product.unitPrice),
        batchCode: product.batchCode,
      });
    } else {
      setEditingProductId(null);
      setProductForm(emptyProductForm);
    }

    setIsProductFormOpen(true);
  }

  function openCollectionForm(collection?: ProductCollection) {
    if (!isAdmin) return;

    if (collection) {
      setEditingCollectionId(collection.id);
      setCollectionForm({
        representativeId: collection.representativeId,
        productId: collection.productId,
        quantity: String(collection.quantity),
        saleDate: collection.saleDate,
      });
    } else {
      setEditingCollectionId(null);
      setCollectionForm({
        representativeId: representatives[0]?.id || "",
        productId: products[0]?.id || "",
        quantity: "",
        saleDate: new Date().toISOString().slice(0, 10),
      });
    }

    setIsCollectionFormOpen(true);
  }

  async function submitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isAdmin) return;

    const payload = {
      name: productForm.name.trim(),
      unitPrice: Number(productForm.unitPrice),
      batchCode: productForm.batchCode.trim(),
    };
    const data = editingProductId
      ? await updateProduct(editingProductId, payload).catch((error) => ({
          error,
        }))
      : await createProduct(payload).catch((error) => ({ error }));

    if ("error" in data || !data.product) {
      window.alert(
        data.error instanceof Error
          ? data.error.message
          : "Could not save product.",
      );
      return;
    }

    setProducts((current) =>
      editingProductId
        ? current.map((item) =>
            item.id === editingProductId ? data.product! : item,
          )
        : [...current, data.product!],
    );
    setIsProductFormOpen(false);
  }

  async function removeProduct(product: ProductItem) {
    if (!isAdmin) return;

    if (!window.confirm(`Remove ${product.name}?`)) {
      return;
    }

    const data = await deleteProduct(product.id).catch((error) => ({ error }));

    if ("error" in data) {
      window.alert(
        data.error instanceof Error
          ? data.error.message
          : "Could not remove product.",
      );
      return;
    }

    setProducts((current) => current.filter((item) => item.id !== product.id));
    setCollections((current) =>
      current.filter((item) => item.productId !== product.id),
    );
  }

  async function submitCollection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isAdmin) return;

    const payload = {
      representativeId: collectionForm.representativeId,
      productId: collectionForm.productId,
      quantity: Number(collectionForm.quantity),
      saleDate: collectionForm.saleDate,
    };
    const data = editingCollectionId
      ? await updateProductCollection(editingCollectionId, payload).catch(
          (error) => ({ error }),
        )
      : await createProductCollection(payload).catch((error) => ({ error }));

    if ("error" in data || !data.collection) {
      window.alert(
        data.error instanceof Error
          ? data.error.message
          : "Could not save product collection.",
      );
      return;
    }

    setCollections((current) =>
      editingCollectionId
        ? current.map((item) =>
            item.id === editingCollectionId ? data.collection! : item,
          )
        : [...current, data.collection!],
    );
    setIsCollectionFormOpen(false);
  }

  async function removeCollection(collection: ProductCollection) {
    if (!isAdmin) return;

    if (!window.confirm("Remove this product collection?")) {
      return;
    }

    const data = await deleteProductCollection(collection.id).catch((error) => ({
      error,
    }));

    if ("error" in data) {
      window.alert(
        data.error instanceof Error
          ? data.error.message
          : "Could not remove product collection.",
      );
      return;
    }

    setCollections((current) =>
      current.filter((item) => item.id !== collection.id),
    );
  }

  return (
    <PageShell>
      {view === "list" ? (
        <>
          {isAdmin ? (
            <Toolbar
              title="Product List"
              actionLabel="Add Product"
              onAdd={() => openProductForm()}
            />
          ) : (
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              Product List
            </h1>
          )}
          <ProductTable
            products={products}
            isAdmin={isAdmin}
            onEdit={openProductForm}
            onRemove={removeProduct}
          />
        </>
      ) : (
        <>
          {isAdmin ? (
            <Toolbar
              title={
                view === "holders" ? "Product Holders" : "Product Collections"
              }
              actionLabel={view === "holders" ? "Add Holder" : "Add Collection"}
              onAdd={() => openCollectionForm()}
            />
          ) : (
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              {view === "holders" ? "Product Holders" : "Product Collections"}
            </h1>
          )}
          <CollectionTable
            rows={collectionRows}
            showValue={view === "collections"}
            isAdmin={isAdmin}
            onEdit={openCollectionForm}
            onRemove={removeCollection}
          />
        </>
      )}

      {isAdmin && isProductFormOpen ? (
        <ProductFormModal
          form={productForm}
          title={editingProductId ? "Edit Product" : "Add Product"}
          onChange={setProductForm}
          onClose={() => setIsProductFormOpen(false)}
          onSubmit={submitProduct}
        />
      ) : null}

      {isAdmin && isCollectionFormOpen ? (
        <CollectionFormModal
          form={collectionForm}
          products={products}
          representatives={representatives}
          title={
            editingCollectionId
              ? "Edit Product Collection"
              : "Add Product Collection"
          }
          onChange={setCollectionForm}
          onClose={() => setIsCollectionFormOpen(false)}
          onSubmit={submitCollection}
        />
      ) : null}
    </PageShell>
  );
}

function ProductTable({
  products,
  isAdmin,
  onEdit,
  onRemove,
}: {
  products: ProductItem[];
  isAdmin: boolean;
  onEdit: (product: ProductItem) => void;
  onRemove: (product: ProductItem) => void;
}) {
  return (
    <div className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Product Name</th>
              <th className="px-4 py-3 font-semibold">Unit Price</th>
              {isAdmin ? (
                <th className="px-4 py-3 font-semibold">Batch Code</th>
              ) : null}
              {isAdmin ? (
                <th className="px-4 py-3 font-semibold">Actions</th>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {products.map((product) => (
              <tr key={product.id} className="text-slate-700">
                <td className="px-4 py-3 align-top">{product.name}</td>
                <td className="px-4 py-3 align-top">
                  {currency.format(product.unitPrice)}
                </td>
                {isAdmin ? (
                  <td className="px-4 py-3 align-top">{product.batchCode}</td>
                ) : null}
                {isAdmin ? (
                  <td className="px-4 py-3 align-top">
                    <ActionButtons
                      onEdit={() => onEdit(product)}
                      onRemove={() => onRemove(product)}
                    />
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CollectionTable({
  rows,
  showValue,
  isAdmin,
  onEdit,
  onRemove,
}: {
  rows: Array<
    ProductCollection & {
      representativeName: string;
      productName: string;
      unitPrice: number;
      value: number;
    }
  >;
  showValue: boolean;
  isAdmin: boolean;
  onEdit: (collection: ProductCollection) => void;
  onRemove: (collection: ProductCollection) => void;
}) {
  return (
    <div className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Sales Representative</th>
              <th className="px-4 py-3 font-semibold">Product Name</th>
              <th className="px-4 py-3 font-semibold">Unit Price</th>
              <th className="px-4 py-3 font-semibold">Quantity</th>
              {showValue ? (
                <th className="px-4 py-3 font-semibold">Collection Value</th>
              ) : null}
              {isAdmin ? (
                <th className="px-4 py-3 font-semibold">Actions</th>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((row, index) => (
              <tr
                key={`${row.id || "collection"}-${row.representativeId}-${row.productId}-${row.saleDate}-${index}`}
                className="text-slate-700"
              >
                <td className="px-4 py-3 align-top">
                  {row.representativeName}
                </td>
                <td className="px-4 py-3 align-top">{row.productName}</td>
                <td className="px-4 py-3 align-top">
                  {currency.format(row.unitPrice)}
                </td>
                <td className="px-4 py-3 align-top">{row.quantity}</td>
                {showValue ? (
                  <td className="px-4 py-3 align-top">
                    {currency.format(row.value)}
                  </td>
                ) : null}
                {isAdmin ? (
                  <td className="px-4 py-3 align-top">
                    <ActionButtons
                      onEdit={() => onEdit(row)}
                      onRemove={() => onRemove(row)}
                    />
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActionButtons({
  onEdit,
  onRemove,
}: {
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
      >
        <PencilSquareIcon className="h-4 w-4" />
        Edit
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-700 transition hover:bg-red-50"
      >
        <TrashIcon className="h-4 w-4" />
        Remove
      </button>
    </div>
  );
}

function ProductFormModal({
  form,
  title,
  onChange,
  onClose,
  onSubmit,
}: {
  form: ProductForm;
  title: string;
  onChange: (form: ProductForm) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Modal title={title} onClose={onClose} onSubmit={onSubmit}>
      <label className="text-sm font-medium text-slate-700">
        Product name
        <input
          required
          value={form.name}
          onChange={(event) => onChange({ ...form, name: event.target.value })}
          className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
        />
      </label>
      <label className="text-sm font-medium text-slate-700">
        Unit price
        <input
          required
          min="0"
          step="0.01"
          type="number"
          value={form.unitPrice}
          onChange={(event) =>
            onChange({ ...form, unitPrice: event.target.value })
          }
          className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
        />
      </label>
      <label className="sm:col-span-2 text-sm font-medium text-slate-700">
        Batch code
        <input
          required
          value={form.batchCode}
          onChange={(event) =>
            onChange({ ...form, batchCode: event.target.value })
          }
          className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
        />
      </label>
    </Modal>
  );
}

function CollectionFormModal({
  form,
  products,
  representatives,
  title,
  onChange,
  onClose,
  onSubmit,
}: {
  form: CollectionForm;
  products: ProductItem[];
  representatives: SalesRep[];
  title: string;
  onChange: (form: CollectionForm) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Modal title={title} onClose={onClose} onSubmit={onSubmit}>
      <label className="text-sm font-medium text-slate-700">
        Sales representative
        <select
          required
          value={form.representativeId}
          onChange={(event) =>
            onChange({ ...form, representativeId: event.target.value })
          }
          className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
        >
          {representatives.map((rep) => (
            <option key={rep.id} value={rep.id}>
              {rep.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-medium text-slate-700">
        Product
        <select
          required
          value={form.productId}
          onChange={(event) =>
            onChange({ ...form, productId: event.target.value })
          }
          className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
        >
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-medium text-slate-700">
        Quantity
        <input
          required
          min="0"
          step="1"
          type="number"
          value={form.quantity}
          onChange={(event) =>
            onChange({ ...form, quantity: event.target.value })
          }
          className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
        />
      </label>
      <label className="text-sm font-medium text-slate-700">
        Sale date
        <input
          required
          type="date"
          value={form.saleDate}
          onChange={(event) =>
            onChange({ ...form, saleDate: event.target.value })
          }
          className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
        />
      </label>
    </Modal>
  );
}

function Modal({
  title,
  children,
  onClose,
  onSubmit,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 px-4 py-8 backdrop-blur-sm">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/20"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100"
            aria-label="Close form"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">{children}</div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-pink-700 px-4 text-sm font-semibold text-white shadow-sm shadow-pink-900/20 transition hover:bg-pink-800"
          >
            <PlusIcon className="h-4 w-4" />
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
