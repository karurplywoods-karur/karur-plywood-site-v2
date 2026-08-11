import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * ─────────────────────────────────────────────────────────────
 *  LAUNCH SWITCH — Karur Plywood site
 * ─────────────────────────────────────────────────────────────
 *  Before this timestamp -> every visitor sees /coming-soon
 *  From this timestamp on -> the real site loads normally
 *
 *  This is timezone-safe: "+05:30" pins it to India Standard
 *  Time regardless of what timezone Vercel's servers run in.
 * ─────────────────────────────────────────────────────────────
 */
const LAUNCH_AT = new Date("2026-08-23T00:00:00+05:30").getTime();

// Secret preview key so YOU can view the real site before launch.
// Change this to your own value before deploying.
const PREVIEW_KEY = "kp2026preview";
const PREVIEW_COOKIE = "kp_preview";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // 1) Always allow these through, launch gate or not:
  //    - Next.js internals & static assets
  //    - the coming-soon page itself (avoid infinite redirect loop)
  //    - admin panel, so you can keep working before launch
  //    - API routes, so admin/data calls keep working
  const alwaysAllowed =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/coming-soon") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    /\.(png|jpg|jpeg|webp|svg|gif|ico|css|js|txt|xml|woff2?)$/.test(pathname);

  if (alwaysAllowed) {
    return NextResponse.next();
  }

  const now = Date.now();
  const launched = now >= LAUNCH_AT;

  // 2) Preview bypass: visiting once with ?preview=kp2026preview
  //    sets a cookie so you (or a client you're showing) can browse
  //    the real site early. Remove the cookie / clear browser data
  //    to go back to seeing Coming Soon.
  const hasPreviewQuery = searchParams.get("preview") === PREVIEW_KEY;
  const hasPreviewCookie = request.cookies.get(PREVIEW_COOKIE)?.value === "1";

  if (!launched && !hasPreviewQuery && !hasPreviewCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/coming-soon";
    url.search = "";
    return NextResponse.rewrite(url);
  }

  const response = NextResponse.next();

  if (hasPreviewQuery) {
    response.cookies.set(PREVIEW_COOKIE, "1", {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
  }

  return response;
}

// Run on every route except the ones already excluded above.
// (Kept broad here; the real filtering happens inside middleware().)
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image).*)",
  ],
};
