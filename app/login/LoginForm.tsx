"use client";

import { useActionState } from "react";
import { login, type LoginResult } from "./actions";

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<LoginResult, FormData>(
    async (_prev, formData) => (await login(formData)) ?? undefined,
    undefined
  );

  return (
    <form
      action={formAction}
      className="w-full max-w-sm space-y-4 rounded-lg border border-black/10 p-6 dark:border-white/15"
    >
      <h1 className="text-xl font-semibold">Admin sign in</h1>
      <input type="hidden" name="next" value={next} />
      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium">
          Admin password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoFocus
          required
          className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/20 dark:bg-transparent"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
