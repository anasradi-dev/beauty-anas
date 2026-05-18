"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type { StoreApi } from "zustand/vanilla";
import { appStore, type IStoreState } from "@/store/app-store";

export { useShallow };
export type IAppStoreApi = StoreApi<IStoreState>;

const StoreContext = createContext<IAppStoreApi | null>(null);

const store = appStore();

export function StoreProvider({ children }: { children: ReactNode }) {
  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}

export function useBoundStore<T>(selector: (s: IStoreState) => T): T {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error("useBoundStore must be used within StoreProvider.");
  }
  return useStore(store, selector);
}
