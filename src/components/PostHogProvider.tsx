"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
// Send analytics to our own domain (/ingest), reverse-proxied to PostHog EU in
// next.config.ts — this dodges ad-blockers/firewalls that block posthog.com directly.
const POSTHOG_HOST = "/ingest";
const POSTHOG_UI_HOST = "https://eu.posthog.com";

// Initialise at module scope, not in an effect: React runs child effects before
// parent ones, so <PageViews/> would capture against an uninitialised client and
// PostHog would silently drop it. (Dev hid this — StrictMode's double-invoke made
// the second pass succeed — while production, which runs effects once, lost every
// $pageview.)
if (typeof window !== "undefined" && POSTHOG_KEY && !posthog.__loaded) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    ui_host: POSTHOG_UI_HOST, // PostHog app lives here (for toolbar/links); data still goes via /ingest
    person_profiles: "identified_only", // only create person records for signed-in reps
    // We capture pageviews ourselves per route change (see <PageViews/>); the
    // "2025-05-24" defaults' "history_change" mode fired no $pageview at all.
    capture_pageview: false,
    capture_pageleave: true,
  });
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {

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
  const { status } = useSession();
  const lastCaptured = useRef<string | null>(null);

  useEffect(() => {
    if (!ph || !pathname) return;
    // Hold until the session resolves. <Identify/> is rendered above us, so its
    // effect runs first and attaches the rep — capturing earlier would send the
    // first pageview of every visit anonymously, and `identified_only` never
    // back-links those, which is what left ~11% of landing views unattributed.
    if (status === "loading") return;
    // Guard against a session refetch re-firing this for the same route.
    if (lastCaptured.current === pathname) return;
    lastCaptured.current = pathname;
    ph.capture("$pageview", { $current_url: window.location.href });
  }, [ph, pathname, status]);

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
