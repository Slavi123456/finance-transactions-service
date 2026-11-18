import { z } from "zod";

export const idParams = z.object({id: z.uuid()});

export const pagination = {
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20)
}

export const isoDate = z.iso.date();
export const nonEmpty = (value: object) => Object.keys(value).length > 0;

export const fromBeforeTo = (value: {from?: string; to?: string}) => 
    !value.from || !value.to || value.from <= value.to;
export const fromBeforeToIssue = { message: "'from' must not be after 'to'", path: ["to"]};
