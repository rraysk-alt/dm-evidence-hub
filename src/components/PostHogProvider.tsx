"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
// Send analytics to our own domain (/ingest), reverse-proxied to PostHog EU in
// next.config.ts — this dodges ad-blockers/firewalls that block posthog.com directly.
const POSTHOG_HOST = "/ingest";
const POSTHOG_UI_HOST = "https://eu.posthog.com";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!POSTHOG_KEY || posthog.__loaded) return;
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      ui_host: POSTHOG_UI_HOST, // PostHog app lives here (for toolbar/links); data still goes via /ingest
      person_profiles: "identified_only", // only create person records for signed-in reps
      // Capture the pageview ourselves on each route change (see <PageViews/>).
      // The "2025-05-24" defaults put this in "history_change" mode, which fired
      // no $pageview at all here — leaving the leaderboard (a $pageview metric) empty.
      capture_pageview: false,
      capture_pageleave: true,
    });
  }, []);

  // If no key is configured (e.g. local dev), render children without analytics.
  if (!POSTHOG_KEY) return <>{children}</>;

  return (
    <PHProvider client={posthog}>
      <Identify />
      <PageViews />
      {children}
    </PHProvider>
  );
}

// Explicit $pageview on first load and on every App Router navigation.
function PageViews() {
  const ph = usePostHog();
  const pathname = usePathname();

  useEffect(() => {
    if (!ph || !pathname) return;
    ph.capture("$pageview", { $current_url: window.location.href });
  }, [ph, pathname]);

  return null;
}

// Ties every event to the signed-in rep (distinct_id = their DM email) so the
// leaderboard and per-rep views work. Region is added automatically by PostHog's
// server-side GeoIP — no code needed here.
function Identify() {
  const ph = usePostHog();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (!ph) return;
    if (status === "authenticated" && session?.user?.email) {
      ph.identify(session.user.email, {
        email: session.user.email,
        name: session.user.name ?? undefined,
      });
    }
  }, [ph, status, session?.user?.email, session?.user?.name]);

  return null;
}
