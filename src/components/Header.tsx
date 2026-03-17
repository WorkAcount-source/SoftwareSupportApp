"use client";

import { FaSignOutAlt, FaSignInAlt } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { user, signOut, setShowLoginModal } = useAuth();

  return (
    <header className="bg-[var(--card)] border-b border-[var(--card-border)] px-4 py-3">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex flex-col justify-center">
            <img src="/logo-full.png" alt="Rigaku" className="h-[20px] sm:h-[24px] object-contain mb-[2px]" />
            <p className="text-[9px] sm:text-[10px] text-[var(--muted)] uppercase tracking-wider font-semibold">Support Team Manager</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Auth button */}
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="hidden sm:flex text-xs font-semibold text-slate-700 bg-slate-100 items-center gap-1.5 border border-slate-200 rounded-lg px-3 py-1.5 max-w-[160px] truncate shadow-sm">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {user.email?.split("@")[0]}
              </span>
              <button
                onClick={signOut}
                className="text-xs font-semibold flex items-center gap-1.5 bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] shadow-sm rounded-lg px-2.5 py-1.5 sm:px-3 transition-all"
              >
                <FaSignOutAlt size={12} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="text-xs font-semibold flex items-center gap-1.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white shadow-sm rounded-lg px-2.5 py-1.5 sm:px-3 transition-all"
            >
              <FaSignInAlt size={12} />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
