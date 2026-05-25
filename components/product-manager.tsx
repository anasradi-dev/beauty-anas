"use client";

import {
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { FormEvent, useMemo, useState } from "react";
import { ProductCollection, ProductItem, SalesRep } from "@/lib/data";

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
  repId: string;
  productId: string;
  quantity: string;
  saleDate: string;
};

type ProductResponse = {
  products?: ProductItem[];
  product?: ProductItem;
  error?: string;
};

type CollectionResponse = {
  collections?: ProductCollection[];
  collection?: ProductCollection;
  error?: string;
};

const emptyProductForm: ProductForm = {
  name: "",
  unitPrice: "",
  batchCode: "",
};

const emptyCollectionForm: CollectionForm = {
  repId: "",
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
  const [products, setProducts] = useState(initialProducts);
  const [collections, setCollections] = useState(initialCollections);
  const [productForm, setProductForm] =
    useState<ProductForm>(emptyProductForm);
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
        const product = products.find((item) => item.id === collection.productId);
        const representative = representatives.find(
          (item) => item.id === collection.repId,
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
    if (collection) {
      setEditingCollectionId(collection.id);
      setCollectionForm({
        repId: collection.repId,
        productId: collection.productId,
        quantity: String(collection.quantity),
        saleDate: collection.saleDate,
      });
    } else {
      setEditingCollectionId(null);
      setCollectionForm({
        repId: representatives[0]?.id || "",
        productId: products[0]?.id || "",
        quantity: "",
        saleDate: new Date().toISOString().slice(0, 10),
      });
    }

    setIsCollectionFormOpen(true);
  }

  async function submitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      name: productForm.name.trim(),
      unitPrice: Number(productForm.unitPrice),
      batchCode: productForm.batchCode.trim(),
    };
    const url = editingProductId
      ? `/api/products/${editingProductId}`
      : "/api/products";
    const response = await fetch(url, {
      method: editingProductId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as ProductResponse;

    if (!response.ok || !data.product) {
      window.alert(data.error || "Could not save product.");
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
    if (!window.confirm(`Remove ${product.name}?`)) {
      return;
    }

    const response = await fetch(`/api/products/${product.id}`, {
      method: "DELETE",
    });
    const data = (await response.json()) as ProductResponse;

    if (!response.ok) {
      window.alert(data.error || "Could not remove product.");
      return;
    }

    setProducts((current) => current.filter((item) => item.id !== product.id));
    setCollections((current) =>
      current.filter((item) => item.productId !== product.id),
    );
  }

  async function submitCollection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      repId: collectionForm.repId,
      productId: collectionForm.productId,
      quantity: Number(collectionForm.quantity),
      saleDate: collectionForm.saleDate,
    };
    const url = editingCollectionId
      ? `/api/product-collections/${editingCollectionId}`
      : "/api/product-collections";
    const response = await fetch(url, {
      method: editingCollectionId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as CollectionResponse;

    if (!response.ok || !data.collection) {
      window.alert(data.error || "Could not save product collection.");
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
    if (!window.confirm("Remove this product collection?")) {
      return;
    }

    const response = await fetch(`/api/product-collections/${collection.id}`, {
      method: "DELETE",
    });
    const data = (await response.json()) as CollectionResponse;

    if (!response.ok) {
      window.alert(data.error || "Could not remove product collection.");
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
          <Toolbar
            title="Product List"
            actionLabel="Add Product"
            onAdd={() => openProductForm()}
          />
          <ProductTable
            products={products}
            onEdit={openProductForm}
            onRemove={removeProduct}
          />
        </>
      ) : (
        <>
          <Toolbar
            title={view === "holders" ? "Product Holders" : "Product Collections"}
            actionLabel={view === "holders" ? "Add Holder" : "Add Collection"}
            onAdd={() => openCollectionForm()}
          />
          <CollectionTable
            rows={collectionRows}
            showValue={view === "collections"}
            onEdit={openCollectionForm}
            onRemove={removeCollection}
          />
        </>
      )}

      {isProductFormOpen ? (
        <ProductFormModal
          form={productForm}
          title={editingProductId ? "Edit Product" : "Add Product"}
          onChange={setProductForm}
          onClose={() => setIsProductFormOpen(false)}
          onSubmit={submitProduct}
        />
      ) : null}

      {isCollectionFormOpen ? (
        <CollectionFormModal
          form={collectionForm}
          products={products}
          representatives={representatives}
          title={
            editingCollectionId ? "Edit Product Collection" : "Add Product Collection"
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
  onEdit,
  onRemove,
}: {
  products: ProductItem[];
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
              <th className="px-4 py-3 font-semibold">Batch Code</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {products.map((product) => (
              <tr key={product.id} className="text-slate-700">
                <td className="px-4 py-3 align-top">{product.name}</td>
                <td className="px-4 py-3 align-top">
                  {currency.format(product.unitPrice)}
                </td>
                <td className="px-4 py-3 align-top">{product.batchCode}</td>
                <td className="px-4 py-3 align-top">
                  <ActionButtons
                    onEdit={() => onEdit(product)}
                    onRemove={() => onRemove(product)}
                  />
                </td>
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
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((row) => (
              <tr key={row.id} className="text-slate-700">
                <td className="px-4 py-3 align-top">{row.representativeName}</td>
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
                <td className="px-4 py-3 align-top">
                  <ActionButtons
                    onEdit={() => onEdit(row)}
                    onRemove={() => onRemove(row)}
                  />
                </td>
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
          value={form.repId}
          onChange={(event) => onChange({ ...form, repId: event.target.value })}
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
