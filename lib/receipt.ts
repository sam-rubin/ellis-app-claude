import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type ReceiptData = {
  churchName: string;
  receiptNumber: number;
  memberName: string;
  periodLabel: string;
  amount: string;
  method: string;
  paidDate: Date;
  notes: string | null;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function formatPeriod(month: number, year: number): string {
  return `${MONTHS[month - 1]} ${year}`;
}

export async function generateReceiptPdf(data: ReceiptData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([400, 560]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const dark = rgb(0.1, 0.1, 0.1);
  const gray = rgb(0.45, 0.45, 0.45);
  const line = rgb(0.85, 0.85, 0.85);

  let y = 500;
  const left = 40;
  const right = 360;

  const drawCentered = (text: string, size: number, f = font, color = dark) => {
    const width = f.widthOfTextAtSize(text, size);
    page.drawText(text, { x: (400 - width) / 2, y, size, font: f, color });
    y -= size + 10;
  };

  const drawRow = (label: string, value: string) => {
    page.drawText(label, { x: left, y, size: 11, font, color: gray });
    const valWidth = font.widthOfTextAtSize(value, 11);
    page.drawText(value, { x: right - valWidth, y, size: 11, font: bold, color: dark });
    y -= 24;
  };

  drawCentered(data.churchName, 18, bold);
  drawCentered("Payment Receipt", 13, font, gray);

  y -= 10;
  page.drawLine({ start: { x: left, y }, end: { x: right, y }, thickness: 1, color: line });
  y -= 24;

  drawRow("Receipt No.", `#${data.receiptNumber.toString().padStart(5, "0")}`);
  drawRow("Date issued", data.paidDate.toISOString().slice(0, 10));
  drawRow("Member", data.memberName);
  drawRow("Subscription period", data.periodLabel);
  drawRow("Payment method", data.method.charAt(0).toUpperCase() + data.method.slice(1));

  if (data.notes) {
    drawRow("Notes", data.notes);
  }

  y -= 10;
  page.drawLine({ start: { x: left, y }, end: { x: right, y }, thickness: 1, color: line });
  y -= 30;

  page.drawText("Amount paid", { x: left, y, size: 13, font, color: gray });
  const amountText = `$${data.amount}`;
  const amountWidth = bold.widthOfTextAtSize(amountText, 20);
  page.drawText(amountText, { x: right - amountWidth, y: y - 4, size: 20, font: bold, color: dark });

  y -= 60;
  page.drawLine({ start: { x: left, y }, end: { x: right, y }, thickness: 1, color: line });
  y -= 20;

  page.drawText("Thank you for your continued support.", {
    x: left,
    y,
    size: 10,
    font,
    color: gray,
  });

  return doc.save();
}
