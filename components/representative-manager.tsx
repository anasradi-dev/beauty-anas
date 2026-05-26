"use client";

import {
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { FormEvent, useMemo, useState } from "react";
import {
  cities,
  collections,
  products,
  SalesRep,
  streetsByCity,
} from "@/lib/data";
import { useAuth } from "@/components/auth";
import {
  createRepresentative,
  deleteRepresentative,
  seedBeautyData,
  updateRepresentative,
} from "@/src/api/beauty-api";

type RepresentativeManagerProps = {
  initialReps: SalesRep[];
  view?: "list" | "details" | "products";
};

type RepForm = {
  firstName: string;
  lastName: string;
  city: string;
  street: string;
  houseNumber: string;
  apartment: string;
  telephone: string;
};

const emptyForm: RepForm = {
  firstName: "",
  lastName: "",
  city: cities[0] || "",
  street: streetsByCity[cities[0]]?.[0] || "",
  houseNumber: "",
  apartment: "",
  telephone: "",
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function fullName(rep: SalesRep) {
  return `${rep.firstName || ""} ${rep.lastName || ""}`.trim() || rep.name;
}

function addressLine(rep: SalesRep) {
  const apartment = rep.apartment ? `, Apt ${rep.apartment}` : "";
  return rep.city && rep.street && rep.houseNumber
    ? `${rep.houseNumber} ${rep.street}${apartment}, ${rep.city}`
    : rep.address;
}

function normalizeName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.trim().replace(/\s+/g, " ").toLowerCase();
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 rounded-lg border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5"
    >
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-pink-600">
        Sales Representatives
      </p>
      <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function RepresentativeManager({
  initialReps,
  view = "list",
}: RepresentativeManagerProps) {
  const [representatives, setRepresentatives] =
    useState<SalesRep[]>(initialReps);
  const [isAdding, setIsAdding] = useState(false);
  const [editingRepId, setEditingRepId] = useState<string | null>(null);
  const [form, setForm] = useState<RepForm>(emptyForm);
  const [search, setSearch] = useState("");
  const [selectedRepId, setSelectedRepId] = useState(initialReps[0]?.id || "");
  const { isAdmin } = useAuth();

  const detailRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return representatives;

    return representatives.filter((rep) =>
      fullName(rep).toLowerCase().includes(query),
    );
  }, [representatives, search]);

  const selectedRep = representatives.find((rep) => rep.id === selectedRepId);
  const productRows = useMemo(
    () =>
      collections
        .filter((collection) => collection.representativeId === selectedRepId)
        .map((collection) => {
          const product = products.find((item) => item.id === collection.productId);
          return {
            id: collection.id,
            productName: product?.name || "Unknown product",
            quantity: collection.quantity,
            price: product?.unitPrice || 0,
          };
        }),
    [selectedRepId],
  );

  function updateForm(field: keyof RepForm, value: string) {
    setForm((current) => {
      if (field === "city") {
        return {
          ...current,
          city: value,
          street: streetsByCity[value]?.[0] || "",
        };
      }

      return { ...current, [field]: value };
    });
  }

  function openForm(rep?: SalesRep) {
    if (!isAdmin) return;

    if (rep) {
      setEditingRepId(rep.id);
      setForm({
        firstName: rep.firstName,
        lastName: rep.lastName,
        city: rep.city || cities[0] || "",
        street: rep.street || streetsByCity[rep.city]?.[0] || "",
        houseNumber: rep.houseNumber,
        apartment: rep.apartment ? String(rep.apartment) : "",
        telephone: rep.telephone || rep.phone,
      });
    } else {
      setEditingRepId(null);
      setForm(emptyForm);
    }

    setIsAdding(true);
  }

  function closeForm() {
    setIsAdding(false);
    setEditingRepId(null);
    setForm(emptyForm);
  }

  function formPayload() {
    return {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      city: form.city,
      street: form.street,
      houseNumber: form.houseNumber.trim(),
      apartment: form.apartment ? Number(form.apartment) : null,
      telephone: form.telephone.trim(),
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isAdmin) return;

    const payload = formPayload();
    const name = normalizeName(payload.firstName, payload.lastName);
    const duplicate = representatives.some(
      (rep) =>
        rep.id !== editingRepId &&
        normalizeName(rep.firstName, rep.lastName) === name,
    );

    if (duplicate) {
      window.alert("A representative with this first and last name already exists.");
      return;
    }

    const data = editingRepId
      ? await updateRepresentative(editingRepId, payload).catch((error) => ({
          error,
        }))
      : await createRepresentative(payload).catch((error) => ({ error }));

    if ("error" in data || !data.representative) {
      window.alert(
        data.error instanceof Error
          ? data.error.message
          : "Could not save representative.",
      );
      return;
    }

    setRepresentatives((current) =>
      editingRepId
        ? current.map((rep) =>
            rep.id === editingRepId ? data.representative! : rep,
          )
        : [...current, data.representative!],
    );
    setSelectedRepId((current) => current || data.representative!.id);
    closeForm();
  }

  async function removeRepresentative(repId: string) {
    if (!isAdmin) return;

    const rep = representatives.find((item) => item.id === repId);
    if (!rep || !window.confirm(`Remove ${fullName(rep)}?`)) return;

    const data = await deleteRepresentative(repId).catch((error) => ({ error }));

    if ("error" in data) {
      window.alert(
        data.error instanceof Error
          ? data.error.message
          : "Could not remove representative.",
      );
      return;
    }

    setRepresentatives((current) =>
      current.filter((representative) => representative.id !== repId),
    );
    if (selectedRepId === repId) {
      setSelectedRepId(representatives.find((item) => item.id !== repId)?.id || "");
    }
  }

  async function resetRepresentatives() {
    if (!isAdmin || !window.confirm("Reset the representative list?")) return;

    const data = await seedBeautyData().catch((error) => ({ error }));

    if ("error" in data || !data.representatives) {
      window.alert(
        data.error instanceof Error
          ? data.error.message
          : "Could not reset saved data.",
      );
      return;
    }

    setRepresentatives(data.representatives);
    setSelectedRepId(data.representatives[0]?.id || "");
  }

  if (view === "details") {
    return (
      <Section id="representative-details" title="Representative Details">
        <label className="block max-w-md text-sm font-medium text-slate-700">
          Search by name
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Type part of a name"
            className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
          />
        </label>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {detailRows.map((rep) => (
            <article
              key={rep.id}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5"
            >
              <h3 className="font-semibold text-slate-950">{fullName(rep)}</h3>
              <p className="mt-2 text-sm text-slate-600">{addressLine(rep)}</p>
              <p className="mt-2 text-sm text-slate-600">
                {rep.telephone || rep.phone}
              </p>
            </article>
          ))}
        </div>
      </Section>
    );
  }

  if (view === "products") {
    return (
      <Section id="representative-products" title="Representative Products">
        <label className="block max-w-md text-sm font-medium text-slate-700">
          Sales representative
          <select
            value={selectedRepId}
            onChange={(event) => setSelectedRepId(event.target.value)}
            className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
          >
            {representatives.map((rep) => (
              <option key={rep.id} value={rep.id}>
                {fullName(rep)}
              </option>
            ))}
          </select>
        </label>

        <div className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Product Name</th>
                  <th className="px-4 py-3 font-semibold">Quantity</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {productRows.map((row) => (
                  <tr key={row.id} className="text-slate-700">
                    <td className="px-4 py-3 align-top">{row.productName}</td>
                    <td className="px-4 py-3 align-top">{row.quantity}</td>
                    <td className="px-4 py-3 align-top">
                      {currency.format(row.price)}
                    </td>
                  </tr>
                ))}
                {selectedRep && productRows.length === 0 ? (
                  <tr>
                    <td className="px-4 py-4 text-slate-500" colSpan={3}>
                      No products found for {fullName(selectedRep)}.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section id="representative-list" title="Representative List">
      <div className="flex flex-wrap gap-2 sm:justify-end">
        <span className="inline-flex h-10 items-center rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-500">
          Saved
        </span>
        {isAdmin ? (
          <>
            <button
              type="button"
              onClick={resetRepresentatives}
              className="inline-flex h-10 w-fit items-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Reset List
            </button>
            <button
              type="button"
              onClick={() => openForm()}
              className="inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm shadow-slate-900/15 transition hover:bg-pink-700"
            >
              <PlusIcon className="h-4 w-4" />
              Add Representative
            </button>
          </>
        ) : null}
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">First Name</th>
                <th className="px-4 py-3 font-semibold">Last Name</th>
                <th className="px-4 py-3 font-semibold">City</th>
                <th className="px-4 py-3 font-semibold">Street</th>
                <th className="px-4 py-3 font-semibold">House</th>
                <th className="px-4 py-3 font-semibold">Apartment</th>
                <th className="px-4 py-3 font-semibold">Telephone</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {representatives.map((rep) => (
                <tr key={rep.id} className="text-slate-700">
                  <td className="px-4 py-3 align-top">{rep.firstName}</td>
                  <td className="px-4 py-3 align-top">{rep.lastName}</td>
                  <td className="px-4 py-3 align-top">{rep.city}</td>
                  <td className="px-4 py-3 align-top">{rep.street}</td>
                  <td className="px-4 py-3 align-top">{rep.houseNumber}</td>
                  <td className="px-4 py-3 align-top">
                    {rep.apartment || "-"}
                  </td>
                  <td className="px-4 py-3 align-top">
                    {rep.telephone || rep.phone}
                  </td>
                  <td className="px-4 py-3 align-top">
                    {isAdmin ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openForm(rep)}
                          className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => removeRepresentative(rep.id)}
                          className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                          Remove
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-500">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAdmin && isAdding ? (
        <RepresentativeForm
          form={form}
          title={editingRepId ? "Edit Representative" : "Add Representative"}
          onChange={updateForm}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />
      ) : null}
    </Section>
  );
}

function RepresentativeForm({
  form,
  title,
  onChange,
  onClose,
  onSubmit,
}: {
  form: RepForm;
  title: string;
  onChange: (field: keyof RepForm, value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const streetOptions = streetsByCity[form.city] || [];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 px-4 py-8 backdrop-blur-sm">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/20"
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100"
            aria-label="Close form"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <TextField
            label="First name"
            value={form.firstName}
            onChange={(value) => onChange("firstName", value)}
          />
          <TextField
            label="Last name"
            value={form.lastName}
            onChange={(value) => onChange("lastName", value)}
          />
          <label className="text-sm font-medium text-slate-700">
            City
            <select
              required
              value={form.city}
              onChange={(event) => onChange("city", event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Street
            <select
              required
              value={form.street}
              onChange={(event) => onChange("street", event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
            >
              {streetOptions.map((street) => (
                <option key={street} value={street}>
                  {street}
                </option>
              ))}
            </select>
          </label>
          <TextField
            label="House number"
            value={form.houseNumber}
            onChange={(value) => onChange("houseNumber", value)}
          />
          <TextField
            label="Apartment"
            type="number"
            required={false}
            value={form.apartment}
            onChange={(value) => onChange("apartment", value)}
          />
          <TextField
            label="Telephone"
            type="tel"
            value={form.telephone}
            onChange={(value) => onChange("telephone", value)}
          />
        </div>

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

function TextField({
  label,
  value,
  onChange,
  type = "text",
  required = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="text-sm font-medium text-slate-700">
      {label}
      <input
        required={required}
        min={type === "number" ? "0" : undefined}
        step={type === "number" ? "1" : undefined}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
      />
    </label>
  );
}
