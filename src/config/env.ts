import { config } from "dotenv";
import { z } from "zod";

config();


const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().default(3002),
    DATABASE_URL: z.string().min(1),
    JWT_ACCESS_SECRET: z.string().min(32),
    CORS_ORIGIN: z.string().min(1),
});

export const env = envSchema.parse(process.env);