import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error.js";
import { ZodError } from "zod";
import { pgErrorCode } from "../utils/pg-error.js";

export function errorHandler (err: unknown, _req: Request, res: Response, _next: NextFunction) {
    if(err instanceof AppError) return res.status(err.status).json({error: err.message});

    if(err instanceof ZodError) return res.status(400).json({error: "Validation failed", details: err.issues});

    const code = pgErrorCode(err);
    if (code === "23505") return res.status(409).json({ error: "Already exists" });
    if (code === "23503") {
        return res.status(409).json({ error: "Cannot complete: the record is still in use" });
    }

    console.error(err);
    res.status(500).json({ error: "Internal server error" });
}