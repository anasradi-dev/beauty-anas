"use client";
import { INav } from "@/types/nav-t";
import { Bars4Icon, ChevronDownIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useState } from "react";

type IProps = { menu: INav[] };

export function Nav(props: IProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [openGroup, setOpenGroup] = useState<number | null>(null);
  const { menu } = props;

  return (
    <nav className="w-full md:w-auto">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
        >
          <Bars4Icon className="h-5 w-5" />
        </button>

        <div
          className={`${isOpen ? "block" : "hidden"} absolute inset-x-0 top-20 z-40 rounded-b-3xl border border-slate-200 bg-white px-6 py-5 shadow-xl md:static md:block md:border-0 md:bg-transparent md:px-0 md:py-0 md:shadow-none`}
        >
          <ul className="flex flex-col gap-2 text-sm md:flex-row md:items-center md:gap-1">
            {menu.map((item, index) => {
              const hasChildren = item.children && item.children.length > 0;
              const isGroupOpen = openGroup === index;
              return (
                <li key={item.title} className="relative group">
                  {hasChildren ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setOpenGroup(isGroupOpen ? null : index)}
                        className="inline-flex w-full items-center justify-between gap-2 rounded-full px-4 py-2 text-slate-700 transition hover:bg-slate-100 md:px-3 md:py-2 md:w-auto md:bg-transparent md:hover:bg-slate-100"
                      >
                        {item.title}
                        <ChevronDownIcon className="h-4 w-4 text-slate-500" />
                      </button>
                      <div
                        className={`mt-2 w-full rounded-3xl border border-slate-200 bg-white shadow-lg md:absolute md:left-0 md:top-full md:w-64 md:mt-0 md:opacity-0 md:pointer-events-none md:transition md:duration-200 md:group-hover:opacity-100 md:group-hover:pointer-events-auto ${
                          isGroupOpen
                            ? "block md:block md:opacity-100 md:pointer-events-auto"
                            : "hidden"
                        }`}
                      >
                        <div className="flex flex-col p-3 md:p-4">
                          {item.children?.map((child) => (
                            <Link
                              key={child.title}
                              href={child.slug || "#"}
                              className="rounded-2xl px-3 py-2 text-slate-700 transition hover:bg-slate-50"
                              onClick={() => setIsOpen(false)}
                            >
                              {child.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <Link
                      href={item.slug || "#"}
                      className="block rounded-full px-4 py-2 text-slate-700 transition hover:bg-slate-100 md:px-3 md:py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.title}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
