import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Reps sign in with their DM Google Workspace account. Anyone whose email is
// not on the company domain (or explicitly allow-listed as an admin) is rejected,
// so the per-rep leaderboard only ever contains real DM people.
const ALLOWED_DOMAIN = "dental-monitoring.com";
const ADMIN_EMAILS = (process.env.AUTH_ALLOWED_EMAILS ?? "rraysk@gmail.com")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function isAllowed(email?: string | null): boolean {
  if (!email) return false;
  const e = email.toLowerCase();
  return e.endsWith(`@${ALLOWED_DOMAIN}`) || ADMIN_EMAILS.includes(e);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  trustHost: true, // Vercel sets the host header; required for v5 behind their proxy
  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days — reps sign in once and forget
  },
  callbacks: {
    signIn({ profile }) {
      return isAllowed(profile?.email);
    },
    // Redirect rejected users back to the sign-in page with an error flag.
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
});
