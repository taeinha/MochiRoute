import { Response } from "express";
import { ApiResponse } from "@mochiroute/shared";
import { logger } from "../../lib/logger";

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

export function logError(context: string, error: unknown) {
  if (error instanceof Error) {
    logger.error(context, { message: error.message, stack: error.stack });
    return;
  }
  logger.error(context, { error: String(error) });
}
