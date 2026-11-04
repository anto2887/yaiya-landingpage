import { NextResponse, type NextRequest } from "next/server";

/**
 * PostHog's add-on scripts (session recorder, exception capture, web vitals, surveys) through
 * this site. A plain rewrite in next.config.mjs forwards our own Host header, and since
 * takeayaiya.com moved to Cloudflare, PostHog's Cloudflare-fronted asset host refuses that with
 * error 1000 (403). Fetching here sends PostHog's own host name instead.
 */
const ASSETS = process.env.POSTHOG_ASSETS_HOST ?? "https://us-assets.i.posthog.com";
// Only script and map files, with safe names; nothing else is proxied.
const SAFE_PATH = /^[\w.\-/]+\.(js|map|css)$/;

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const path = (await params).path.join("/");
  if (!SAFE_PATH.test(path) || path.includes("..")) return new NextResponse(null, { status: 404 });

  try {
    const upstream = await fetch(`${ASSETS}/static/${path}${req.nextUrl.search}`, {
      headers: { accept: req.headers.get("accept") ?? "*/*" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!upstream.ok) return new NextResponse(null, { status: upstream.status === 404 ? 404 : 502 });
    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "content-type": upstream.headers.get("content-type") ?? "application/javascript",
        // Versioned files; safe to cache for a day in browsers and Cloudflare.
        "cache-control": "public, max-age=86400",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
