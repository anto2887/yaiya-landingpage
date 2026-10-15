import { NextResponse, type NextRequest } from "next/server";
import { QA_COOKIE } from "@/lib/session";

/**
 * Internal traffic (guide/docs/11-analytics.md): visiting any page with ?qa=1 sets a 30-day cookie,
 * so test signups save as landing_variant "qa" and can be filtered out. ?qa=0 clears it.
 */
export function middleware(req: NextRequest) {
  const qa = req.nextUrl.searchParams.get("qa");
  if (qa !== "1" && qa !== "0") return NextResponse.next();
  const res = NextResponse.next();
  if (qa === "1") res.cookies.set(QA_COOKIE, "1", { path: "/", maxAge: 30 * 24 * 60 * 60, sameSite: "lax" });
  else res.cookies.delete(QA_COOKIE);
  return res;
}

export const config = {
  // Pages only: skip API routes, Next assets and files with an extension.
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
