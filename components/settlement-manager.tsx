"use client";

import {
  BanknotesIcon,
  CalendarDaysIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { FormEvent, useMemo, useState } from "react";
import { SalesRep } from "@/lib/data";
import { useAuth } from "@/components/auth";
import {
  createRepresentative,
  deleteRepresentative,
  updateRepresentative,
} from "@/src/api/beauty-api";

type SettlementManagerProps = {
  initialRepresentatives: SalesRep[];
  view: "money-deposits" | "dates" | "total-deposited";
};

type SettlementForm = {
  name: string;
  phone: string;
  address: string;
  settlementDate: string;
  depositedAmount: string;
};

const emptyForm: SettlementForm = {
  name: "",
  phone: "",
  address: "",
  settlementDate: "",
  depositedAmount: "",
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const viewCopy = {
  "money-deposits": {
    title: "Money Deposits",
    action: "Add Deposit",
    modalAdd: "Add Money Deposit",
    modalEdit: "Edit Money Deposit",
  },
  dates: {
    title: "Settlement Dates",
    action: "Add Settlement",
    modalAdd: "Add Settlement Date",
    modalEdit: "Edit Settlement Date",
  },
  "total-deposited": {
    title: "Total Deposited Amount",
    action: "Add Deposit",
    modalAdd: "Add Deposited Amount",
    modalEdit: "Edit Deposited Amount",
  },
};

export function SettlementManager({
  initialRepresentatives,
  view,
}: SettlementManagerProps) {
  const [representatives, setRepresentatives] = useState(
    initialRepresentatives,
  );
  const [form, setForm] = useState<SettlementForm>(emptyForm);
  const [editingRepId, setEditingRepId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { isAdmin } = useAuth();

  const totalDeposited = useMemo(
    () => representatives.reduce((sum, rep) => sum + rep.depositedAmount, 0),
    [representatives],
  );

  const sortedRepresentatives = useMemo(
    () =>
      [...representatives].sort((first, second) =>
        first.settlementDate.localeCompare(second.settlementDate),
      ),
    [representatives],
  );

  function openForm(rep?: SalesRep) {
    if (!isAdmin) return;

    if (rep) {
      setEditingRepId(rep.id);
      setForm({
        name: rep.name,
        phone: rep.phone,
        address: rep.address,
        settlementDate: rep.settlementDate,
        depositedAmount: String(rep.depositedAmount),
      });
    } else {
      setEditingRepId(null);
      setForm({
        ...emptyForm,
        settlementDate: new Date().toISOString().slice(0, 10),
      });
    }

    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingRepId(null);
    setForm(emptyForm);
  }

  async function submitSettlement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isAdmin) return;

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      settlementDate: form.settlementDate,
      depositedAmount: Number(form.depositedAmount),
    };
    const data = editingRepId
      ? await updateRepresentative(editingRepId, payload).catch((error) => ({
          error,
        }))
      : await createRepresentative(payload).catch((error) => ({ error }));

    if ("error" in data || !data.representative) {
      window.alert(
        data.error instanceof Error
          ? data.error.message
          : "Could not save settlement.",
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
    closeForm();
  }

  async function removeSettlement(rep: SalesRep) {
    if (!isAdmin) return;

    if (!window.confirm(`Remove settlement for ${rep.name}?`)) {
      return;
    }

    const data = await deleteRepresentative(rep.id).catch((error) => ({
      error,
    }));

    if ("error" in data) {
      window.alert(
        data.error instanceof Error
          ? data.error.message
          : "Could not remove settlement.",
      );
      return;
    }

    setRepresentatives((current) =>
      current.filter((item) => item.id !== rep.id),
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900 lg:px-10">
      <section className="container mx-auto rounded-lg border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-pink-600">
          Settlements
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            {viewCopy[view].title}
          </h1>
          {isAdmin ? (
            <button
              type="button"
              onClick={() => openForm()}
              className="inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm shadow-slate-900/15 transition hover:bg-pink-700"
            >
              <PlusIcon className="h-4 w-4" />
              {viewCopy[view].action}
            </button>
          ) : null}
        </div>

        {view === "total-deposited" ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100 text-pink-700">
                  <BanknotesIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Deposited total
                  </p>
                  <p className="text-2xl font-semibold text-slate-950">
                    {currency.format(totalDeposited)}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-200 text-slate-700">
                  <CalendarDaysIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Settlement rows
                  </p>
                  <p className="text-2xl font-semibold text-slate-950">
                    {representatives.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <SettlementTable
          representatives={sortedRepresentatives}
          primaryColumn={view === "dates" ? "date" : "deposit"}
          isAdmin={isAdmin}
          onEdit={openForm}
          onRemove={removeSettlement}
        />
      </section>

      {isAdmin && isFormOpen ? (
        <SettlementFormModal
          form={form}
          title={
            editingRepId ? viewCopy[view].modalEdit : viewCopy[view].modalAdd
          }
          onChange={setForm}
          onClose={closeForm}
          onSubmit={submitSettlement}
        />
      ) : null}
    </main>
  );
}

function SettlementTable({
  representatives,
  primaryColumn,
  isAdmin,
  onEdit,
  onRemove,
}: {
  representatives: SalesRep[];
  primaryColumn: "deposit" | "date";
  isAdmin: boolean;
  onEdit: (rep: SalesRep) => void;
  onRemove: (rep: SalesRep) => void;
}) {
  return (
    <div className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Sales Representative</th>
              <th className="px-4 py-3 font-semibold">Telephone</th>
              <th className="px-4 py-3 font-semibold">
                {primaryColumn === "deposit"
                  ? "Deposited Amount"
                  : "Settlement Date"}
              </th>
              <th className="px-4 py-3 font-semibold">
                {primaryColumn === "deposit"
                  ? "Settlement Date"
                  : "Deposited Amount"}
              </th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {representatives.map((rep) => (
              <tr key={rep.id} className="text-slate-700">
                <td className="px-4 py-3 align-top">{rep.name}</td>
                <td className="px-4 py-3 align-top">{rep.phone}</td>
                <td className="px-4 py-3 align-top">
                  {primaryColumn === "deposit"
                    ? currency.format(rep.depositedAmount)
                    : dateFormat.format(new Date(rep.settlementDate))}
                </td>
                <td className="px-4 py-3 align-top">
                  {primaryColumn === "deposit"
                    ? dateFormat.format(new Date(rep.settlementDate))
                    : currency.format(rep.depositedAmount)}
                </td>
                <td className="px-4 py-3 align-top">
                  {isAdmin ? (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(rep)}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemove(rep)}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500">—</div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettlementFormModal({
  form,
  title,
  onChange,
  onClose,
  onSubmit,
}: {
  form: SettlementForm;
  title: string;
  onChange: (form: SettlementForm) => void;
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
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Full name
            <input
              required
              value={form.name}
              onChange={(event) =>
                onChange({ ...form, name: event.target.value })
              }
              className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Telephone
            <input
              required
              value={form.phone}
              onChange={(event) =>
                onChange({ ...form, phone: event.target.value })
              }
              className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
            />
          </label>
          <label className="sm:col-span-2 text-sm font-medium text-slate-700">
            Address
            <input
              required
              value={form.address}
              onChange={(event) =>
                onChange({ ...form, address: event.target.value })
              }
              className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Deposited amount
            <input
              required
              min="0"
              step="0.01"
              type="number"
              value={form.depositedAmount}
              onChange={(event) =>
                onChange({ ...form, depositedAmount: event.target.value })
              }
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
                onChange({ ...form, settlementDate: event.target.value })
              }
              className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
            />
          </label>
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
