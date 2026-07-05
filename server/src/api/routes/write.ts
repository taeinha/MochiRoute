import { Response } from "express";
import { ApiResponse } from "@mochiroute/shared";

export function writeErrorResponse(
  res: Response,
  message: string,
  statusCode: number = 500,
) {
  const response: ApiResponse<null> = {
    success: false,
    message,
  };
  return res.status(statusCode).json(response);
}
