import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  // Reverse-proxy PostHog through our own domain so ad-blockers / corporate
  // firewalls don't recognize (and block) analytics traffic. Browser → /ingest
  // → PostHog EU. Recovers pageviews, autocapture, identify + recordings for
  // otherwise-blocked reps. (PostHog requires skipTrailingSlashRedirect.)
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      { source: "/ingest/static/:path*", destination: "https://eu-assets.i.posthog.com/static/:path*" },
      { source: "/ingest/:path*", destination: "https://eu.i.posthog.com/:path*" },
      { source: "/ingest/flags", destination: "https://eu.i.posthog.com/flags" },
    ];
  },
};

export default nextConfig;
