export interface CustomState {
  isDarkMode: boolean;
  SidebarWidth: number;
  MiniSidebarWidth: number;
  TopbarHeight: number;
  isCollapse: boolean;
  isMobileSidebar: boolean;
}

export interface AuthState {
  email: string | null;
  isAuthenticated: boolean;
  authChecked: boolean;
}

export interface HeadCell<T> {
  disablePadding: boolean;
  id: keyof T;
  label: string;
  numeric: boolean;
  truncate?: boolean;
  link?: boolean;
  width?: number | string;
  maxWidth?: number;
  format?: (value: T[keyof T]) => string;
}

export type Order = "asc" | "desc";
