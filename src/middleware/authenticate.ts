import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error.js";
import { env } from "../config/env.js";
import jwt from "jsonwebtoken";

const bearerStringSize = 7;

export function authenticate(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    if(!header?.startsWith('Bearer ')) return next(new AppError(401, "Missing access token"));

    try {
        const payload = jwt.verify(header.slice(bearerStringSize), env.JWT_ACCESS_SECRET, 
        { algorithms: ["HS256"]});
        if(typeof payload === "string" || typeof payload.sub !== "string") {
            return(next(new AppError(401, "Invalid access token")));
        }
        res.locals.userId = payload.sub;
        next();
    }catch {
        next(new AppError(401, "Invalid or expired access token"));
    }
}