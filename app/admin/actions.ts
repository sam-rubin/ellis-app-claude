"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function emptyToNull(val: FormDataEntryValue | null): string | null {
  const s = (val ?? "").toString().trim();
  return s.length === 0 ? null : s;
}

function toDateOrNull(val: FormDataEntryValue | null): Date | null {
  const s = emptyToNull(val);
  if (!s) return null;
  const d = new Date(s + "T00:00:00Z");
  return Number.isNaN(d.getTime()) ? null : d;
}

const memberSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  phone: z.string().optional().nullable(),
  email: z
    .union([z.string().email(), z.literal("")])
    .optional()
    .nullable(),
  address: z.string().optional().nullable(),
  monthlyAmount: z.coerce.number().min(0).default(0),
  notes: z.string().optional().nullable(),
});

export type MemberFormResult = { error?: string } | void;

export async function createMember(formData: FormData): Promise<MemberFormResult> {
  await requireAdmin();

  const parsed = memberSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: emptyToNull(formData.get("phone")),
    email: emptyToNull(formData.get("email")) ?? "",
    address: emptyToNull(formData.get("address")),
    monthlyAmount: formData.get("monthlyAmount") || 0,
    notes: emptyToNull(formData.get("notes")),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const member = await prisma.member.create({
    data: {
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      address: parsed.data.address,
      monthlyAmount: parsed.data.monthlyAmount,
      notes: parsed.data.notes,
      dateOfBirth: toDateOrNull(formData.get("dateOfBirth")),
      weddingDate: toDateOrNull(formData.get("weddingDate")),
      baptismDate: toDateOrNull(formData.get("baptismDate")),
      confirmationDate: toDateOrNull(formData.get("confirmationDate")),
    },
  });

  revalidatePath("/admin");
  redirect(`/admin/members/${member.id}`);
}

export async function updateMember(
  memberId: string,
  formData: FormData
): Promise<MemberFormResult> {
  await requireAdmin();

  const parsed = memberSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: emptyToNull(formData.get("phone")),
    email: emptyToNull(formData.get("email")) ?? "",
    address: emptyToNull(formData.get("address")),
    monthlyAmount: formData.get("monthlyAmount") || 0,
    notes: emptyToNull(formData.get("notes")),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  await prisma.member.update({
    where: { id: memberId },
    data: {
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      address: parsed.data.address,
      monthlyAmount: parsed.data.monthlyAmount,
      notes: parsed.data.notes,
      active: formData.get("active") === "on",
      dateOfBirth: toDateOrNull(formData.get("dateOfBirth")),
      weddingDate: toDateOrNull(formData.get("weddingDate")),
      baptismDate: toDateOrNull(formData.get("baptismDate")),
      confirmationDate: toDateOrNull(formData.get("confirmationDate")),
    },
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/members/${memberId}`);
  redirect(`/admin/members/${memberId}`);
}

export async function deleteMember(memberId: string) {
  await requireAdmin();
  await prisma.member.delete({ where: { id: memberId } });
  revalidatePath("/admin");
  redirect("/admin");
}

const paymentSchema = z.object({
  periodMonth: z.coerce.number().int().min(1).max(12),
  periodYear: z.coerce.number().int().min(2000).max(2100),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  method: z.enum(["cash", "check", "online", "other"]).default("cash"),
  notes: z.string().optional().nullable(),
});

export async function recordPayment(
  memberId: string,
  formData: FormData
): Promise<MemberFormResult> {
  await requireAdmin();

  const parsed = paymentSchema.safeParse({
    periodMonth: formData.get("periodMonth"),
    periodYear: formData.get("periodYear"),
    amount: formData.get("amount"),
    method: formData.get("method") || "cash",
    notes: emptyToNull(formData.get("notes")),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const paidDate = toDateOrNull(formData.get("paidDate")) ?? new Date();

  try {
    await prisma.payment.create({
      data: {
        memberId,
        periodMonth: parsed.data.periodMonth,
        periodYear: parsed.data.periodYear,
        amount: parsed.data.amount,
        method: parsed.data.method,
        notes: parsed.data.notes,
        paidDate,
      },
    });
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code?: string }).code === "P2002"
    ) {
      return { error: "A payment for that month/year already exists for this member." };
    }
    throw err;
  }

  revalidatePath(`/admin/members/${memberId}`);
}

export async function deletePayment(memberId: string, paymentId: string) {
  await requireAdmin();
  await prisma.payment.delete({ where: { id: paymentId } });
  revalidatePath(`/admin/members/${memberId}`);
}
