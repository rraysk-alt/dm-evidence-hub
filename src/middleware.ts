export { auth as middleware } from "@/auth";

// Gate everything except the auth endpoints, the sign-in page itself, Next's
// internals, and static files (anything with a file extension, e.g. /logo.png).
// Unauthenticated requests are redirected to /signin by the `authorized` callback.
export const config = {
  matcher: ["/((?!api/auth|ingest|_next/static|_next/image|signin|.*\\..*).*)"],
};
