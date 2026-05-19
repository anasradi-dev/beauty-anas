"use client";

import {
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  collections,
  commissionRate,
  products,
  SalesRep,
} from "@/lib/data";

type RepresentativeManagerProps = {
  initialReps: SalesRep[];
};

type RepForm = {
  name: string;
  address: string;
  phone: string;
  settlementDate: string;
  depositedAmount: string;
};

type DataSource = "loading" | "mongodb" | "local";

type RepresentativesResponse = {
  representatives?: SalesRep[];
  representative?: SalesRep;
  error?: string;
};

const emptyForm: RepForm = {
  name: "",
  address: "",
  phone: "",
  settlementDate: "",
  depositedAmount: "",
};

const storageKey = "beauty-sales-representatives";

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

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
    <section id={id} className="scroll-mt-28">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function RepresentativeManager({
  initialReps,
}: RepresentativeManagerProps) {
  const [representatives, setRepresentatives] = useState<SalesRep[]>(initialReps);
  const [isAdding, setIsAdding] = useState(false);
  const [editingRepId, setEditingRepId] = useState<string | null>(null);
  const [form, setForm] = useState<RepForm>(emptyForm);
  const [dataSource, setDataSource] = useState<DataSource>("loading");
  const [hasLoadedSavedReps, setHasLoadedSavedReps] = useState(false);
  const totalDeposited = representatives.reduce(
    (sum, rep) => sum + rep.depositedAmount,
    0,
  );

  const reportRows = useMemo(
    () =>
      representatives.map((rep) => {
        const repCollections = collections.filter((row) => row.repId === rep.id);
        const salesVolume = repCollections.reduce((sum, row) => {
          const product = products.find((item) => item.id === row.productId);
          return sum + (product?.unitPrice || 0) * row.quantity;
        }, 0);
        const productNames = repCollections
          .map((row) => products.find((item) => item.id === row.productId)?.name)
          .filter(Boolean);

        return {
          rep,
          productNames,
          productCount: repCollections.reduce(
            (sum, row) => sum + row.quantity,
            0,
          ),
          salesVolume,
          commission: salesVolume * commissionRate,
        };
      }),
    [representatives],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadRepresentatives() {
      try {
        const response = await fetch("/api/representatives", {
          cache: "no-store",
        });

        if (response.ok) {
          const data = (await response.json()) as RepresentativesResponse;

          if (isMounted && data.representatives) {
            setRepresentatives(data.representatives);
            setDataSource("mongodb");
            setHasLoadedSavedReps(true);
            return;
          }
        }
      } catch {
        // The local fallback keeps the app useful before MongoDB is configured.
      }

      const savedReps = window.localStorage.getItem(storageKey);

      if (isMounted) {
        if (savedReps) {
          setRepresentatives(JSON.parse(savedReps) as SalesRep[]);
        }

        setDataSource("local");
        setHasLoadedSavedReps(true);
      }
    }

    loadRepresentatives();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (hasLoadedSavedReps && dataSource === "local") {
      window.localStorage.setItem(storageKey, JSON.stringify(representatives));
    }
  }, [dataSource, hasLoadedSavedReps, representatives]);

  function updateForm(field: keyof RepForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function closeForm() {
    setIsAdding(false);
    setEditingRepId(null);
    setForm(emptyForm);
  }

  function formPayload() {
    return {
      name: form.name.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
      settlementDate: form.settlementDate,
      depositedAmount: Number(form.depositedAmount),
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = formPayload();

    if (editingRepId) {
      if (dataSource === "mongodb") {
        const response = await fetch(`/api/representatives/${editingRepId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = (await response.json()) as RepresentativesResponse;

        if (!response.ok || !data.representative) {
          window.alert(data.error || "Could not update representative.");
          return;
        }

        setRepresentatives((current) =>
          current.map((rep) =>
            rep.id === editingRepId ? data.representative! : rep,
          ),
        );
        closeForm();
        return;
      }

      setRepresentatives((current) =>
        current.map((rep) =>
          rep.id === editingRepId
            ? {
                ...rep,
                ...payload,
              }
            : rep,
        ),
      );
      closeForm();
      return;
    }

    if (dataSource === "mongodb") {
      const response = await fetch("/api/representatives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as RepresentativesResponse;

      if (!response.ok || !data.representative) {
        window.alert(data.error || "Could not create representative.");
        return;
      }

      setRepresentatives((current) => [...current, data.representative!]);
      closeForm();
      return;
    }

    const newRepresentative: SalesRep = {
      id: `rep-${Date.now()}`,
      ...payload,
    };

    setRepresentatives((current) => [...current, newRepresentative]);
    closeForm();
  }

  function startEdit(rep: SalesRep) {
    setEditingRepId(rep.id);
    setForm({
      name: rep.name,
      address: rep.address,
      phone: rep.phone,
      settlementDate: rep.settlementDate,
      depositedAmount: String(rep.depositedAmount),
    });
    setIsAdding(true);
  }

  async function removeRepresentative(repId: string) {
    const rep = representatives.find((item) => item.id === repId);

    if (!rep) {
      return;
    }

    const shouldRemove = window.confirm(`Remove ${rep.name}?`);

    if (shouldRemove) {
      if (dataSource === "mongodb") {
        const response = await fetch(`/api/representatives/${repId}`, {
          method: "DELETE",
        });
        const data = (await response.json()) as RepresentativesResponse;

        if (!response.ok) {
          window.alert(data.error || "Could not remove representative.");
          return;
        }
      }

      setRepresentatives((current) =>
        current.filter((representative) => representative.id !== repId),
      );
    }
  }

  async function resetRepresentatives() {
    const shouldReset = window.confirm("Reset the representative list?");

    if (shouldReset) {
      if (dataSource === "mongodb") {
        const response = await fetch("/api/beauty/seed", {
          method: "POST",
        });
        const data = (await response.json()) as RepresentativesResponse;

        if (!response.ok || !data.representatives) {
          window.alert(data.error || "Could not seed MongoDB data.");
          return;
        }

        setRepresentatives(data.representatives);
        return;
      }

      setRepresentatives(initialReps);
    }
  }

  return (
    <>
      <section id="representative-list" className="scroll-mt-28">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            Representative List
          </h2>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex h-10 items-center rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-500">
              {dataSource === "mongodb"
                ? "MongoDB"
                : dataSource === "local"
                  ? "Local"
                  : "Loading"}
            </span>
            <button
              type="button"
              onClick={resetRepresentatives}
              className="inline-flex h-10 w-fit items-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Reset List
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm shadow-slate-900/15 transition hover:bg-pink-700"
            >
              <PlusIcon className="h-4 w-4" />
              Add Representative
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Full Name</th>
                  <th className="px-4 py-3 font-semibold">Telephone</th>
                  <th className="px-4 py-3 font-semibold">Settlement Date</th>
                  <th className="px-4 py-3 font-semibold">Deposited</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {representatives.map((rep) => (
                  <tr key={rep.id} className="text-slate-700">
                    <td className="px-4 py-3 align-top">{rep.name}</td>
                    <td className="px-4 py-3 align-top">{rep.phone}</td>
                    <td className="px-4 py-3 align-top">
                      {dateFormat.format(new Date(rep.settlementDate))}
                    </td>
                    <td className="px-4 py-3 align-top">
                      ${rep.depositedAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(rep)}
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="representative-details" className="scroll-mt-28">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          Representative Details
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {representatives.map((rep) => (
            <article
              key={rep.id}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5"
            >
              <h3 className="font-semibold text-slate-950">{rep.name}</h3>
              <p className="mt-2 text-sm text-slate-600">{rep.address}</p>
              <p className="mt-2 text-sm text-slate-600">{rep.phone}</p>
              <p className="mt-4 text-sm font-medium text-slate-950">
                Settlement: {dateFormat.format(new Date(rep.settlementDate))}
              </p>
            </article>
          ))}
        </div>
      </section>

      <Section id="representative-products" title="Representative Products">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Sales Representative</th>
                  <th className="px-4 py-3 font-semibold">Products Taken</th>
                  <th className="px-4 py-3 font-semibold">Total Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reportRows.map((row) => (
                  <tr key={row.rep.id} className="text-slate-700">
                    <td className="px-4 py-3 align-top">{row.rep.name}</td>
                    <td className="px-4 py-3 align-top">
                      {row.productNames.join(", ") || "No products yet"}
                    </td>
                    <td className="px-4 py-3 align-top">{row.productCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      <Section id="money-deposits" title="Money Deposits">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Sales Representative</th>
                  <th className="px-4 py-3 font-semibold">Amount Deposited</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {representatives.map((rep) => (
                  <tr key={rep.id} className="text-slate-700">
                    <td className="px-4 py-3 align-top">{rep.name}</td>
                    <td className="px-4 py-3 align-top">
                      {currency.format(rep.depositedAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      <Section id="settlement-dates" title="Settlement Dates">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Sales Representative</th>
                  <th className="px-4 py-3 font-semibold">Settlement Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {representatives.map((rep) => (
                  <tr key={rep.id} className="text-slate-700">
                    <td className="px-4 py-3 align-top">{rep.name}</td>
                    <td className="px-4 py-3 align-top">
                      {dateFormat.format(new Date(rep.settlementDate))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      <Section id="total-deposited-amount" title="Total Deposited Amount">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
          <p className="text-sm font-medium text-slate-500">
            Total deposited amount
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">
            {currency.format(totalDeposited)}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Sum of all money returned by visible sales representatives
          </p>
        </article>
      </Section>

      <Section id="sales-volume" title="Sales Volume">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Sales Representative</th>
                  <th className="px-4 py-3 font-semibold">Sales Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reportRows.map((row) => (
                  <tr key={row.rep.id} className="text-slate-700">
                    <td className="px-4 py-3 align-top">{row.rep.name}</td>
                    <td className="px-4 py-3 align-top">
                      {currency.format(row.salesVolume)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      <Section id="commission-salary" title="Commission Salary">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Sales Representative</th>
                  <th className="px-4 py-3 font-semibold">Commission Rate</th>
                  <th className="px-4 py-3 font-semibold">Salary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reportRows.map((row) => (
                  <tr key={row.rep.id} className="text-slate-700">
                    <td className="px-4 py-3 align-top">{row.rep.name}</td>
                    <td className="px-4 py-3 align-top">
                      {commissionRate * 100}%
                    </td>
                    <td className="px-4 py-3 align-top">
                      {currency.format(row.commission)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      <Section id="representative-report" title="Representative Report">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Representative</th>
                  <th className="px-4 py-3 font-semibold">Products Taken</th>
                  <th className="px-4 py-3 font-semibold">Sales Volume</th>
                  <th className="px-4 py-3 font-semibold">Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reportRows.map((row) => (
                  <tr key={row.rep.id} className="text-slate-700">
                    <td className="px-4 py-3 align-top">{row.rep.name}</td>
                    <td className="px-4 py-3 align-top">{row.productCount}</td>
                    <td className="px-4 py-3 align-top">
                      {currency.format(row.salesVolume)}
                    </td>
                    <td className="px-4 py-3 align-top">
                      {currency.format(row.commission)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      <Section id="deposit-summary" title="Deposit Summary">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Representative</th>
                  <th className="px-4 py-3 font-semibold">Deposited</th>
                  <th className="px-4 py-3 font-semibold">Settlement Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {representatives.map((rep) => (
                  <tr key={rep.id} className="text-slate-700">
                    <td className="px-4 py-3 align-top">{rep.name}</td>
                    <td className="px-4 py-3 align-top">
                      {currency.format(rep.depositedAmount)}
                    </td>
                    <td className="px-4 py-3 align-top">
                      {dateFormat.format(new Date(rep.settlementDate))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {isAdding ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 px-4 py-8 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/20"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-950">
                  {editingRepId ? "Edit Representative" : "Add Representative"}
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {editingRepId
                    ? "Update the representative contact and settlement information."
                    : "Enter the representative contact and settlement information."}
                </p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100"
                aria-label="Close form"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Full name
                <input
                  required
                  value={form.name}
                  onChange={(event) => updateForm("name", event.target.value)}
                  className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Telephone
                <input
                  required
                  value={form.phone}
                  onChange={(event) => updateForm("phone", event.target.value)}
                  className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
                />
              </label>
              <label className="sm:col-span-2 text-sm font-medium text-slate-700">
                Address
                <input
                  required
                  value={form.address}
                  onChange={(event) => updateForm("address", event.target.value)}
                  className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Settlement date
                <input
                  required
                  type="date"
                  value={form.settlementDate}
                  onChange={(event) =>
                    updateForm("settlementDate", event.target.value)
                  }
                  className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Amount deposited
                <input
                  required
                  min="0"
                  step="0.01"
                  type="number"
                  value={form.depositedAmount}
                  onChange={(event) =>
                    updateForm("depositedAmount", event.target.value)
                  }
                  className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
                />
              </label>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeForm}
                className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-pink-700 px-4 text-sm font-semibold text-white shadow-sm shadow-pink-900/20 transition hover:bg-pink-800"
              >
                <PlusIcon className="h-4 w-4" />
                {editingRepId ? "Save Changes" : "Save Representative"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
