import { PrismaClient } from "../../generated/prisma/client";
import { Request, Response } from "express";
import {
  ApiResponse,
  createUrlSchema,
  CreateUrlResponse,
  shortCodeParamSchema,
  urlIdParamSchema,
  UrlListResponse,
  listQuerySchema,
} from "@mochiroute/shared";
import { writeErrorResponse, logError } from "./write";
import { Config } from "../../config";
import { toCreateUrlResponse } from "../../exposed/url";
import {
  createUrlRecord,
  ShortCodeExhaustedError,
  resolveRedirect,
  UrlNotFoundError,
  getUrlRecord,
  getUrlsRecord,
  deleteUrlRecord,
} from "../../service/url";
import { AuthenticatedRequest } from "../../middleware/auth";

export const createUrl =
  (db: PrismaClient, config: Config) => async (req: Request, res: Response) => {
    const validationResult = createUrlSchema.safeParse(req.body);
    if (!validationResult.success) {
      return writeErrorResponse(res, validationResult.error.message, 400);
    }
    const { user } = req as AuthenticatedRequest;
    try {
      const newUrl = await createUrlRecord(
        db,
        validationResult.data.originalUrl,
        user?.userId,
      );

      const response: ApiResponse<CreateUrlResponse> = {
        success: true,
        message: "Created short URL successfully",
        data: toCreateUrlResponse(newUrl, config),
      };

      return res.status(201).json(response);
    } catch (error) {
      if (error instanceof ShortCodeExhaustedError) {
        return writeErrorResponse(res, error.message, 409);
      }
      const message = "Failed to create URL";
      logError(message, error);
      return writeErrorResponse(res, message, 500);
    }
  };

export const redirectUrl =
  (db: PrismaClient) => async (req: Request, res: Response) => {
    const validationResult = shortCodeParamSchema.safeParse(req.params);
    if (!validationResult.success) {
      return writeErrorResponse(res, validationResult.error.message, 400);
    }
    const { shortCode } = validationResult.data;

    try {
      const originalURL = await resolveRedirect(db, shortCode);
      return res.redirect(302, originalURL);
    } catch (error) {
      if (error instanceof UrlNotFoundError)
        return writeErrorResponse(res, error.message, 404);
      const message = "Failed to redirect URL";
      logError(message, error);
      return writeErrorResponse(res, message, 500);
    }
  };

export const getUrl =
  (db: PrismaClient) => async (req: Request, res: Response) => {
    const validationResult = urlIdParamSchema.safeParse(req.params);
    if (!validationResult.success) {
      return writeErrorResponse(res, validationResult.error.message, 400);
    }
    const { id } = validationResult.data;
    const { user } = req as AuthenticatedRequest;
    try {
      const url = await getUrlRecord(db, Number(id), user.userId);
      return res.json({
        success: true,
        message: "URL fetched successfully",
        data: url,
      });
    } catch (error) {
      if (error instanceof UrlNotFoundError)
        return writeErrorResponse(res, error.message, 404);
      const message = "Failed to get URL";
      logError(message, error);
      return writeErrorResponse(res, message, 500);
    }
  };

export const getUrls =
  (db: PrismaClient) => async (req: Request, res: Response) => {
    const validationResult = listQuerySchema.safeParse(req.query);
    if (!validationResult.success) {
      return writeErrorResponse(res, validationResult.error.message, 400);
    }

    const { user } = req as AuthenticatedRequest;
    try {
      const { urls, count } = await getUrlsRecord(
        db,
        user.userId,
        validationResult.data,
      );
      const response: UrlListResponse = {
        success: true,
        message: "URLs fetched successfully",
        data: urls,
        count: count,
      };
      return res.json(response);
    } catch (error) {
      const message = "Failed to get URLs";
      logError(message, error);
      return writeErrorResponse(res, message, 500);
    }
  };

export const deleteUrl =
  (db: PrismaClient) => async (req: Request, res: Response) => {
    const validationResult = urlIdParamSchema.safeParse(req.params);
    if (!validationResult.success) {
      return writeErrorResponse(res, validationResult.error.message, 400);
    }
    const { user } = req as AuthenticatedRequest;
    const { id } = validationResult.data;
    try {
      await deleteUrlRecord(db, Number(id), user.userId);
      return res.json({
        success: true,
        message: "URL deleted successfully",
      });
    } catch (error) {
      const message = "Failed to delete URL";
      logError(message, error);
      return writeErrorResponse(res, message, 500);
    }
  };
