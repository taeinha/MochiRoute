import { z } from "zod";
import { listQuerySchema } from "./validations/url";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  code?: string;
}

export type ListQueryOptions = z.infer<typeof listQuerySchema>;
