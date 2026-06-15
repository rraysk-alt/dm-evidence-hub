"use client";
import { useSession, signOut } from "next-auth/react";

export function UserMenu() {
  const { data: session, status } = useSession();
  if (status !== "authenticated" || !session?.user) return null;

  const { name, email, image } = session.user;

  return (
    <div className="flex items-center gap-2 pl-2">
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={name ?? email ?? "Account"}
          referrerPolicy="no-referrer"
          className="w-7 h-7 rounded-full border border-gray-200"
        />
      )}
      <span className="hidden lg:block text-sm text-gray-700 font-medium max-w-[120px] truncate">
        {name ?? email}
      </span>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/signin" })}
        title="Sign out"
        className="p-1.5 rounded-lg text-gray-400 hover:text-[#009AAB] hover:bg-[#009AAB]/5 transition-colors"
        aria-label="Sign out"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
