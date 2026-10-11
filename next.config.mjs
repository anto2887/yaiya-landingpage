// Starting point for next.config.mjs.
// Proxies PostHog through this site so fewer events are lost to ad blockers.
// Check PostHog's current Next.js proxy docs before relying on these paths.

const posthogHost = process.env.POSTHOG_UPSTREAM_HOST ?? "https://us.i.posthog.com";
const posthogAssets = process.env.POSTHOG_ASSETS_HOST ?? "https://us-assets.i.posthog.com";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // PostHog's API uses trailing slashes; do not redirect them away.
  skipTrailingSlashRedirect: true,

  async rewrites() {
    return [
      { source: "/ingest/static/:path*", destination: `${posthogAssets}/static/:path*` },
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
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
