"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { clearAdminSessionCookie, setAdminSessionCookie } from "@/lib/auth";

export type LoginResult = { error: string } | void;

function isSafeNextPath(next: string | null): next is string {
  return !!next && next.startsWith("/") && !next.startsWith("//");
}

export async function login(formData: FormData): Promise<LoginResult> {
  const password = (formData.get("password") ?? "").toString();
  const next = (formData.get("next") ?? "").toString();

  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) {
    return { error: "Server is not configured with ADMIN_PASSWORD_HASH." };
  }

  const matches = password.length > 0 && (await bcrypt.compare(password, hash));

  if (!matches) {
    return { error: "Incorrect password." };
  }

  await setAdminSessionCookie();
  redirect(isSafeNextPath(next) ? next : "/admin");
}

export async function logout() {
  await clearAdminSessionCookie();
  redirect("/login");
}
