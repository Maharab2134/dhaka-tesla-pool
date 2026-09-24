"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, LogOut, Car, Sparkles, Navigation, ShieldCheck } from "lucide-react";
import { useAuth } from "../lib/auth-context";

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-400 to-blue-600 text-slate-950 font-black shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
            <Zap className="h-5 w-5 text-slate-950 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white text-base sm:text-lg">
                Dhaka Tesla Pool
              </span>
              <span className="hidden md:inline-flex items-center gap-1 rounded-md bg-red-500/10 border border-red-500/30 px-1.5 py-0.5 text-[10px] font-bold text-red-400 tracking-wider">
                BULLET • 3 SEATS
              </span>
            </div>
            <span className="hidden sm:block text-[10px] text-cyan-400 font-bold tracking-widest uppercase">
              Survive Dhaka Traffic
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800/90 rounded-full px-2 py-1 shadow-inner">
          <Link
            href="/passenger"
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition flex items-center gap-1.5 ${
              pathname === "/passenger"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                : "text-slate-300 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Navigation className="h-3 w-3" />
            <span>Passenger</span>
          </Link>

          <Link
            href="/passenger/history"
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition ${
              pathname === "/passenger/history"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                : "text-slate-300 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            History
          </Link>

          <Link
            href="/driver"
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition flex items-center gap-1.5 ${
              pathname === "/driver"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                : "text-slate-300 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Car className="h-3 w-3" />
            <span>Driver</span>
          </Link>

          <Link
            href="/admin"
            className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition flex items-center gap-1.5 ${
              pathname === "/admin"
                ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30"
                : "text-amber-400 hover:text-amber-300 hover:bg-slate-800/60"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Admin / PRD</span>
          </Link>
        </nav>

        {/* User / Auth Controls */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 shadow-sm">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 text-slate-950 text-xs font-extrabold shadow-sm">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <div className="text-xs font-bold text-white">{user.name}</div>
                  <div className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">
                    {user.role} {user.vehicle ? `• ${user.vehicle.name}` : ""}
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                title="Sign out"
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-rose-400 hover:border-rose-500/30 transition shadow-sm"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                <Sparkles className="h-3 w-3 text-cyan-400" />
                <span>Demo Sign In</span>
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-sky-400 px-4 py-1.5 text-xs font-bold text-slate-950 hover:from-cyan-400 hover:to-sky-300 transition shadow-md shadow-cyan-500/20"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
