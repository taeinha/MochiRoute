import type { HeadCell } from "@/types/types";
import type { UrlRecord } from "@mochiroute/shared";

export const urlHeadCells: readonly HeadCell<UrlRecord>[] = [
  {
    id: "shortCode",
    numeric: false,
    disablePadding: false,
    label: "Short Code",
  },
  {
    id: "originalUrl",
    numeric: false,
    disablePadding: false,
    label: "Original URL",
  },
  {
    id: "clicks",
    numeric: true,
    disablePadding: false,
    label: "Clicks",
  },
  {
    id: "createdAt",
    numeric: false,
    disablePadding: false,
    label: "Created At",
  },
];
