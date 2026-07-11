import type { ZodError } from "zod";

export const parseFormFieldErrors = (
  errors: ZodError,
  field: string,
): string[] => {
  return errors.issues.filter((i) => i.path[0] === field).map((i) => i.message);
};
