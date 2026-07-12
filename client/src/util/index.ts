import type { ZodError } from "zod";
import type { Order } from "@/types";

export const parseFormFieldErrors = (
  errors: ZodError,
  field: string,
): string[] => {
  return errors.issues.filter((i) => i.path[0] === field).map((i) => i.message);
};

export const descendingComparator = <T>(a: T, b: T, orderBy: keyof T) => {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
};

export const getComparator = <T, Key extends keyof T>(
  order: Order,
  orderBy: Key,
) => {
  return order === "desc"
    ? (a: T, b: T) => descendingComparator(a, b, orderBy)
    : (a: T, b: T) => -descendingComparator(a, b, orderBy);
};
