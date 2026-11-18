import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

interface Schemas {
    body?: ZodType;
    query?: ZodType;
    params?: ZodType;
}

export const validate = (schemas: Schemas) => 
    (req:Request, res: Response, next: NextFunction) => {
        res.locals.validated = {
            body: schemas.body?.parse(req.body),
            query: schemas.query?.parse(req.query),
            params: schemas.body?.parse(req.params),
        };
        next();
    };