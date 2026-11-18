import type { Request, Response } from "express";
import PDFDocument from "pdfkit";
import { renderStatement } from "../modules/pdf/statement.js";
import type { StatementService } from "../services/statement.service.js";
import { getUserId, validated } from "../utils/http.js";

export function createExportController(service: StatementService) {
  return {
    statement: async (_req: Request, res: Response) => {
      const { query } = validated<{ query: { month: string } }>(res);
      const data = await service.getData(getUserId(res), query.month);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="statement-${query.month}.pdf"`);

      const doc = new PDFDocument({ margin: 50 });
      doc.pipe(res);
      renderStatement(doc, data);
      doc.end();
    },
  };
}

export type ExportController = ReturnType<typeof createExportController>;