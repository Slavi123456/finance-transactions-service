import { fileURLToPath } from "node:url";
import type PDFDocument from "pdfkit";
import type { StatementData } from "../../services/statement.service.js";

// The built-in PDF fonts have no Cyrillic glyphs. Put DejaVuSans.ttf (or any TTF with Cyrillic)
// in assets/fonts/ or Bulgarian product names will print as garbage.
const FONT = fileURLToPath(new URL("../../../assets/fonts/DejaVuSans.ttf", import.meta.url));

export function renderStatement(doc: InstanceType<typeof PDFDocument>, data: StatementData) {
  doc.registerFont("body", FONT);
  doc.font("body");

  doc.fontSize(18).text(`Statement ${data.month}`);
  doc.moveDown();

  doc.fontSize(10);
  for (const p of data.purchases) {
    const line = `${p.purchasedOn}   ${p.productName}   ${p.shop ?? "-"}   ${p.price.toFixed(2)}`;
    doc.text(line);
  }

  doc.moveDown().fontSize(12).text(`Total: ${data.total.toFixed(2)}`);
}