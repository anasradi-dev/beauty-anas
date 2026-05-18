"use client";
import { INav } from "@/types/nav-t";
import { AcademicCapIcon, Bars4Icon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useState } from "react";

type IProps = { menu: INav[] };

const HOST = "http://localhost:3000";

export function Nav(props: IProps) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const { menu } = props;
  return (
    <nav className="bg-white border-gray-200">
      <div className="max-w-7xl flex flex-wrap items-center gap-x-4 justify-between mx-auto p-4">
        <Link href={HOST} className="flex items-center space-x-3">
          <div className="flex gap-x-2">
            <AcademicCapIcon className="h-8 w-8 stroke-orange-700" />
            <div className="text-2xl text-orange-700 font-bold">AAS</div>
          </div>
        </Link>
        <button
          onClick={() => setIsVisible(!isVisible)}
          type="button"
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          <span className="sr-only">Open menu</span>
          <Bars4Icon className="h-7 w-7 stroke-gray-800" />
        </button>
        <div
          className={`w-full md:block md:w-auto ${isVisible ? "" : "hidden"}`}
        >
          <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white">
            {menu.map((item) => (
              <li key={item.slug}>
                <Link
                  href={item.slug}
                  className="block py-2 px-3 text-gray-800 hover:no-underline hover:text-gray-900 visited:text-gray-800 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:p-0"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
