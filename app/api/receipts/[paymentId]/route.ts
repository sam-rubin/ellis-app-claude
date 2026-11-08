import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatPeriod, generateReceiptPdf } from "@/lib/receipt";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  const { paymentId } = await params;

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { member: true },
  });

  if (!payment) {
    return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
  }

  const pdfBytes = await generateReceiptPdf({
    churchName: process.env.CHURCH_NAME || "Church",
    receiptNumber: payment.receiptNumber,
    memberName: payment.member.fullName,
    periodLabel: formatPeriod(payment.periodMonth, payment.periodYear),
    amount: payment.amount.toString(),
    method: payment.method,
    paidDate: payment.paidDate,
    notes: payment.notes,
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="receipt-${payment.receiptNumber}.pdf"`,
    },
  });
}
