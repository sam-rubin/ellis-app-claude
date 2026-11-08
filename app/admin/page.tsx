import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const now = new Date();
  const month = now.getUTCMonth() + 1;
  const year = now.getUTCFullYear();

  const members = await prisma.member.findMany({
    where: q
      ? {
          fullName: { contains: q, mode: "insensitive" },
        }
      : undefined,
    orderBy: { fullName: "asc" },
    include: {
      payments: {
        where: { periodMonth: month, periodYear: year },
        select: { id: true },
      },
    },
  });

  const monthLabel = now.toLocaleString("en-US", { month: "long" });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Members</h1>
        <Link
          href="/admin/members/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Add member
        </Link>
      </div>

      <form method="get" className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by name…"
          className="w-full max-w-sm rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/20 dark:bg-transparent"
        />
        <button
          type="submit"
          className="rounded-md border border-black/15 px-4 py-2 text-sm dark:border-white/20"
        >
          Search
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/15">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/[.03] dark:bg-white/[.06]">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Phone</th>
              <th className="px-4 py-2 font-medium">Monthly amount</th>
              <th className="px-4 py-2 font-medium">{monthLabel} {year}</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr
                key={m.id}
                className="border-t border-black/10 dark:border-white/10"
              >
                <td className="px-4 py-2">
                  <Link
                    href={`/admin/members/${m.id}`}
                    className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {m.fullName}
                  </Link>
                </td>
                <td className="px-4 py-2 text-black/70 dark:text-white/70">
                  {m.phone ?? "—"}
                </td>
                <td className="px-4 py-2">${m.monthlyAmount.toString()}</td>
                <td className="px-4 py-2">
                  {m.payments.length > 0 ? (
                    <span className="text-green-700 dark:text-green-400">Paid</span>
                  ) : (
                    <span className="text-amber-700 dark:text-amber-400">Due</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {m.active ? "Active" : "Inactive"}
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-black/50 dark:text-white/50">
                  No members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
