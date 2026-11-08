import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "church_admin_session";

async function hasValidSession(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  const secret = process.env.SESSION_SECRET;
  if (!secret) return false;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtectedPage = pathname.startsWith("/admin");
  const isProtectedApi =
    pathname.startsWith("/api/receipts") || pathname.startsWith("/api/admin");

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const authed = await hasValidSession(req);

  if (!authed) {
    if (isProtectedApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/receipts/:path*", "/api/admin/:path*"],
};
