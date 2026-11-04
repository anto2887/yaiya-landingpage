// Starting point for next.config.mjs.
// Proxies PostHog through this site so fewer events are lost to ad blockers.
// Check PostHog's current Next.js proxy docs before relying on these paths.

const posthogHost = process.env.POSTHOG_UPSTREAM_HOST ?? "https://us.i.posthog.com";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // PostHog's API uses trailing slashes; do not redirect them away.
  skipTrailingSlashRedirect: true,

  async rewrites() {
    return [
      // /ingest/static/* is served by app/ingest/static/[...path]/route.ts (see the note there).
      { source: "/ingest/:path*", destination: `${posthogHost}/:path*` },
    ];
  },

  async headers() {
    return [
      {
        source: "/thank-you",
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },

  images: {
    // WebP only. AVIF encoding intermittently hung on Railway (requests stalled 40s+ and the
    // flavor pouches never loaded); WebP returns in about 0.2s at every size.
    formats: ["image/webp"],
  },
};

export default nextConfig;
