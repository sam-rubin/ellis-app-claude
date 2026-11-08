import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MemberForm from "../MemberForm";
import PaymentForm from "../PaymentForm";
import ConfirmButton from "../ConfirmButton";
import { deleteMember, deletePayment, recordPayment, updateMember } from "../../actions";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toDateInputValue(d: Date | null): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const member = await prisma.member.findUnique({
    where: { id },
    include: {
      payments: {
        orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }],
      },
    },
  });

  if (!member) notFound();

  const boundUpdate = updateMember.bind(null, member.id);
  const boundRecordPayment = recordPayment.bind(null, member.id);
  const boundDeleteMember = deleteMember.bind(null, member.id);

  return (
    <div className="max-w-2xl space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{member.fullName}</h1>
        <Link href="/admin" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
          ← Back to members
        </Link>
      </div>

      <MemberForm
        action={boundUpdate}
        submitLabel="Save changes"
        showActiveToggle
        initialValues={{
          fullName: member.fullName,
          phone: member.phone ?? "",
          email: member.email ?? "",
          address: member.address ?? "",
          monthlyAmount: member.monthlyAmount.toString(),
          notes: member.notes ?? "",
          active: member.active,
          dateOfBirth: toDateInputValue(member.dateOfBirth),
          weddingDate: toDateInputValue(member.weddingDate),
          baptismDate: toDateInputValue(member.baptismDate),
          confirmationDate: toDateInputValue(member.confirmationDate),
        }}
      />

      <PaymentForm action={boundRecordPayment} defaultAmount={member.monthlyAmount.toString()} />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-black/50 dark:text-white/50">
          Payment history
        </h2>
        <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/15">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/[.03] dark:bg-white/[.06]">
              <tr>
                <th className="px-4 py-2 font-medium">Period</th>
                <th className="px-4 py-2 font-medium">Amount</th>
                <th className="px-4 py-2 font-medium">Method</th>
                <th className="px-4 py-2 font-medium">Paid on</th>
                <th className="px-4 py-2 font-medium">Receipt</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {member.payments.map((p) => {
                const boundDeletePayment = deletePayment.bind(null, member.id, p.id);
                return (
                  <tr key={p.id} className="border-t border-black/10 dark:border-white/10">
                    <td className="px-4 py-2">{MONTHS[p.periodMonth - 1]} {p.periodYear}</td>
                    <td className="px-4 py-2">${p.amount.toString()}</td>
                    <td className="px-4 py-2 capitalize">{p.method}</td>
                    <td className="px-4 py-2">{p.paidDate.toISOString().slice(0, 10)}</td>
                    <td className="px-4 py-2">
                      <a
                        href={`/api/receipts/${p.id}`}
                        className="text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Download PDF
                      </a>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <form action={boundDeletePayment}>
                        <ConfirmButton
                          confirmMessage="Delete this payment record?"
                          className="text-xs text-red-600 hover:underline dark:text-red-400"
                        >
                          Delete
                        </ConfirmButton>
                      </form>
                    </td>
                  </tr>
                );
              })}
              {member.payments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-black/50 dark:text-white/50">
                    No payments recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-2 border-t border-black/10 pt-6 dark:border-white/15">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
          Danger zone
        </h2>
        <form action={boundDeleteMember}>
          <ConfirmButton
            confirmMessage={`Delete ${member.fullName} and all of their payment records? This cannot be undone.`}
            className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
          >
            Delete member
          </ConfirmButton>
        </form>
      </section>
    </div>
  );
}
