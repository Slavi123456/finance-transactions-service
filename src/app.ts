import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { v1Router } from "./container.js";
import { mountDocs } from "./docs/swagger.js";
import { errorHandler } from "./middleware/error-handler.js";
import { AppError } from "./utils/app-error.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json({ limit: "100kb" }));

  app.get("/health", (_req, res) => res.json({ status: "ok" })); // unversioned: for infrastructure
  app.use("/api/v1", v1Router);
  mountDocs(app);

  app.use((_req, _res, next) => next(new AppError(404, "Route not found")));
  app.use(errorHandler); // always last
  return app;
}