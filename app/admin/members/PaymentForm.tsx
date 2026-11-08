"use client";

import { useActionState } from "react";
import type { MemberFormResult } from "../actions";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function PaymentForm({
  action,
  defaultAmount,
}: {
  action: (formData: FormData) => Promise<MemberFormResult>;
  defaultAmount: string;
}) {
  const now = new Date();
  const [state, formAction, pending] = useActionState<MemberFormResult, FormData>(
    async (_prev, formData) => (await action(formData)) ?? undefined,
    undefined
  );

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-black/10 p-4 dark:border-white/15">
      <h3 className="text-sm font-semibold">Record a payment</h3>
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="periodMonth">Month</label>
          <select
            id="periodMonth"
            name="periodMonth"
            defaultValue={now.getUTCMonth() + 1}
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/20 dark:bg-transparent"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="periodYear">Year</label>
          <input
            id="periodYear"
            name="periodYear"
            type="number"
            defaultValue={now.getUTCFullYear()}
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/20 dark:bg-transparent"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="amount">Amount ($)</label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            defaultValue={defaultAmount}
            required
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/20 dark:bg-transparent"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="method">Method</label>
          <select
            id="method"
            name="method"
            defaultValue="cash"
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/20 dark:bg-transparent"
          >
            <option value="cash">Cash</option>
            <option value="check">Check</option>
            <option value="online">Online</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="paidDate">Date paid</label>
          <input
            id="paidDate"
            name="paidDate"
            type="date"
            defaultValue={now.toISOString().slice(0, 10)}
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/20 dark:bg-transparent"
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="payment-notes">Notes</label>
        <input
          id="payment-notes"
          name="notes"
          className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/20 dark:bg-transparent"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Record payment"}
      </button>
    </form>
  );
}
