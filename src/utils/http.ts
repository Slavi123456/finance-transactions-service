import type { Response } from "express";
import { AppError } from "./app-error.js";

// Set by the authenticate middleware
export function getUserId(res: Response): string {
  const id: unknown = res.locals.userId;
  if (typeof id !== "string") throw new AppError(401, "Not authenticated");
  return id;
}

// Set by the validate middleware. The cast is safe only on routes that use validate().
export function validated<T>(res: Response): T {
  return res.locals.validated as T;
}