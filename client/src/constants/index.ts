import type { HeadCell } from "@/types/types";
import type { UrlRecord } from "@mochiroute/shared";
import { formatDateTime } from "@/util";

export const urlHeadCells: readonly HeadCell<UrlRecord>[] = [
  {
    id: "shortCode",
    numeric: false,
    disablePadding: false,
    label: "Short Code",
    width: "20%",
  },
  {
    id: "originalUrl",
    numeric: false,
    disablePadding: false,
    label: "Original URL",
    truncate: true,
    link: true,
    width: "40%",
    maxWidth: 480,
  },
  {
    id: "clicks",
    numeric: true,
    disablePadding: false,
    label: "Clicks",
    width: "12%",
  },
  {
    id: "createdAt",
    numeric: false,
    disablePadding: false,
    label: "Created At",
    width: "18%",
    format: (value) => formatDateTime(String(value)),
  },
];
