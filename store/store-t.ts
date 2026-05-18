import { INav } from "@/types/nav-t";

export interface INotificationSlice {
  messages: string[];
  setMessage: (message: string) => void;
}

export interface INavSlice {
  menu: INav[];
  setMenu: (menu: INav[]) => void;
}
