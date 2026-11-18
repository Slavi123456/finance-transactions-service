import {z} from "zod";

export const categorySchema = z.object({name: z.string().trim().min(1).max(50)});
export type CategoryInput = z.infer<typeof categorySchema>;