"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, User as UserIcon, LogOut, Car, Shield, History } from "lucide-react";
import { useAuth } from "../lib/auth-context";

export function Navbar() {
  const { user, logout, login } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-md shadow-cyan-500/20">
            <Zap className="h-5 w-5 text-slate-950 fill-current" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-white text-base sm:text-lg">
              Dhaka Tesla Pool
            </span>
            <span className="hidden sm:block text-[10px] text-cyan-400 font-semibold tracking-wider uppercase">
              Survive Dhaka Traffic
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 border border-slate-800 rounded-full px-3 py-1">
          <Link
            href="/passenger"
            className={`px-3 py-1 text-xs font-medium rounded-full transition ${
              pathname === "/passenger"
                ? "bg-cyan-500 text-slate-950 font-semibold"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Passenger
          </Link>
          <Link
            href="/passenger/history"
            className={`px-3 py-1 text-xs font-medium rounded-full transition ${
              pathname === "/passenger/history"
                ? "bg-cyan-500 text-slate-950 font-semibold"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Ride History
          </Link>
          <Link
            href="/driver"
            className={`px-3 py-1 text-xs font-medium rounded-full transition flex items-center gap-1.5 ${
              pathname === "/driver"
                ? "bg-cyan-500 text-slate-950 font-semibold"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <Car className="h-3 w-3" />
            <span>Driver (Jashim)</span>
          </Link>
        </nav>

        {/* User / Auth Controls */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-950 text-cyan-400 text-xs font-bold border border-cyan-800">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-medium text-white">{user.name}</div>
                  <div className="text-[10px] text-cyan-400 font-semibold uppercase">
                    {user.role} {user.vehicle ? `• ${user.vehicle.name}` : ""}
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                title="Sign out"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-rose-400 transition"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-cyan-500 px-3.5 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition shadow-md shadow-cyan-500/20"
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
