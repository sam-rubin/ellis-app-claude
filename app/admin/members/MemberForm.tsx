"use client";

import { useActionState } from "react";
import type { MemberFormResult } from "../actions";

export type MemberInitialValues = {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  monthlyAmount: string;
  notes: string;
  active: boolean;
  dateOfBirth: string;
  weddingDate: string;
  baptismDate: string;
  confirmationDate: string;
};

const emptyValues: MemberInitialValues = {
  fullName: "",
  phone: "",
  email: "",
  address: "",
  monthlyAmount: "0",
  notes: "",
  active: true,
  dateOfBirth: "",
  weddingDate: "",
  baptismDate: "",
  confirmationDate: "",
};

export default function MemberForm({
  action,
  initialValues,
  submitLabel,
  showActiveToggle,
}: {
  action: (formData: FormData) => Promise<MemberFormResult>;
  initialValues?: Partial<MemberInitialValues>;
  submitLabel: string;
  showActiveToggle?: boolean;
}) {
  const values = { ...emptyValues, ...initialValues };

  const [state, formAction, pending] = useActionState<MemberFormResult, FormData>(
    async (_prev, formData) => (await action(formData)) ?? undefined,
    undefined
  );

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      )}

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-black/50 dark:text-white/50">
          Personal details
        </h2>
        <Field label="Full name" name="fullName" required defaultValue={values.fullName} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone" name="phone" defaultValue={values.phone} />
          <Field label="Email" name="email" type="email" defaultValue={values.email} />
        </div>
        <Field label="Address" name="address" defaultValue={values.address} />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-black/50 dark:text-white/50">
          Important dates
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date of birth" name="dateOfBirth" type="date" defaultValue={values.dateOfBirth} />
          <Field label="Wedding date" name="weddingDate" type="date" defaultValue={values.weddingDate} />
          <Field label="Baptism date" name="baptismDate" type="date" defaultValue={values.baptismDate} />
          <Field
            label="Confirmation date"
            name="confirmationDate"
            type="date"
            defaultValue={values.confirmationDate}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-black/50 dark:text-white/50">
          Subscription
        </h2>
        <Field
          label="Monthly subscription amount ($)"
          name="monthlyAmount"
          type="number"
          step="0.01"
          min="0"
          defaultValue={values.monthlyAmount}
        />
        {showActiveToggle && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="active" defaultChecked={values.active} />
            Active member
          </label>
        )}
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="notes">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            defaultValue={values.notes}
            rows={3}
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/20 dark:bg-transparent"
          />
        </div>
      </section>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  step,
  min,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  step?: string;
  min?: string;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        step={step}
        min={min}
        required={required}
        defaultValue={defaultValue}
        className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/20 dark:bg-transparent"
      />
    </div>
  );
}
