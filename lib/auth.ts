import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "church_admin_session";
const SESSION_DURATION_SECONDS = 12 * 60 * 60; // 12 hours

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "SESSION_SECRET env var must be set to a random string of 16+ characters"
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createAdminSessionToken(): Promise<string> {
  return await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS)
    .sign(getSecretKey());
}

export async function verifyAdminSessionToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function setAdminSessionCookie() {
  const token = await createAdminSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  return await verifyAdminSessionToken(token);
}

export async function requireAdmin() {
  const ok = await isAdminAuthenticated();
  if (!ok) {
    throw new Error("Not authenticated");
  }
}
