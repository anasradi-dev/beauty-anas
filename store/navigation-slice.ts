import { StateCreator } from "zustand";
import { INav } from "@/types/nav-t";
import { INavSlice } from "./store-t";

export const createNavigationSlice: StateCreator<
  INavSlice,
  [],
  [],
  INavSlice
> = (set) => ({
  menu: [],
  setMenu: (menu: INav[]) => set(() => ({ menu })),
});
