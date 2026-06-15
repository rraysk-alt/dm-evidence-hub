import Image from "next/image";
import { signIn } from "@/auth";

export const metadata = { title: "Sign in – Evidence Hub" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center gap-6">
        <Image
          src="/logo.png"
          alt="DentalMonitoring – Smarter Orthodontics"
          width={200}
          height={37}
          className="h-9 w-auto"
          priority
        />

        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900">Sales Objections Evidence Hub</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in with your DentalMonitoring account to continue.</p>
        </div>

        {error === "AccessDenied" && (
          <p className="w-full text-center text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            That account isn&apos;t authorized. Please use your <strong>@dental-monitoring.com</strong> email.
          </p>
        )}

        <form
          className="w-full"
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 bg-[#009AAB] hover:bg-[#00808d] text-white font-semibold rounded-xl px-4 py-3 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#fff" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" opacity=".9" />
              <path fill="#fff" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" opacity=".75" />
              <path fill="#fff" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.05l3.01-2.33z" opacity=".6" />
              <path fill="#fff" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" opacity=".85" />
            </svg>
            Sign in with Google
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center">Authorized DentalMonitoring staff only.</p>
      </div>
    </div>
  );
}
