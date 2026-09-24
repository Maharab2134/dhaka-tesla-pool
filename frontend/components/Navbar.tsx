"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Zap,
  LogOut,
  Car,
  Sparkles,
  Navigation,
  ShieldCheck,
  User,
  ChevronDown,
  History,
  Check,
} from "lucide-react";
import { useAuth } from "../lib/auth-context";

interface Persona {
  id: string;
  name: string;
  email: string;
  role: "PASSENGER" | "DRIVER";
  desc: string;
  color: string;
}

const DEMO_PERSONAS: Persona[] = [
  {
    id: "nusrat",
    name: "Nusrat",
    email: "nusrat@tesla.dhaka",
    role: "PASSENGER",
    desc: "Passenger • Banani ➔ Mohakhali",
    color: "text-sky-400 bg-sky-500/10 border-sky-500/30",
  },
  {
    id: "rafiq",
    name: "Rafiq",
    email: "rafiq@tesla.dhaka",
    role: "PASSENGER",
    desc: "Passenger • Banani ➔ Gulshan 1",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
  {
    id: "shirin",
    name: "Shirin",
    email: "shirin@tesla.dhaka",
    role: "PASSENGER",
    desc: "Passenger • Banani ➔ Mohakhali (3rd Seat)",
    color: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  },
  {
    id: "jashim",
    name: "Jashim",
    email: "jashim@tesla.dhaka",
    role: "DRIVER",
    desc: "Driver of Bullet • 3 Seats",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  },
];

export function Navbar() {
  const { user, login, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwitchPersona = async (persona: Persona) => {
    setSwitching(true);
    setDropdownOpen(false);
    await login(persona.email, "Password123!");
    setSwitching(false);

    if (persona.role === "DRIVER") {
      router.push("/driver");
    } else {
      router.push("/passenger");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2.5 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-400 to-blue-600 text-slate-950 font-black shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
            <Zap className="h-5 w-5 text-slate-950 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold tracking-tight text-white text-sm sm:text-base md:text-lg">
                Dhaka Tesla Pool
              </span>
              <span className="hidden lg:inline-flex items-center gap-1 rounded-md bg-red-500/10 border border-red-500/30 px-1.5 py-0.5 text-[9px] font-bold text-red-400 tracking-wider">
                BULLET • 3 SEATS
              </span>
            </div>
            <span className="hidden sm:block text-[9px] text-cyan-400 font-bold tracking-widest uppercase">
              Banani Corridor • Real-Time Pool
            </span>
          </div>
        </Link>

        {/* Primary Navigation Links */}
        <nav className="flex items-center gap-1 bg-slate-900/90 border border-slate-800/90 rounded-full px-1.5 py-1 shadow-inner">
          <Link
            href="/passenger"
            className={`px-3 py-1 text-xs font-semibold rounded-full transition flex items-center gap-1.5 ${
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
            className={`hidden sm:flex px-3 py-1 text-xs font-semibold rounded-full transition items-center gap-1.5 ${
              pathname === "/passenger/history"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                : "text-slate-300 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <History className="h-3 w-3" />
            <span>History</span>
          </Link>

          <Link
            href="/driver"
            className={`px-3 py-1 text-xs font-semibold rounded-full transition flex items-center gap-1.5 ${
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
            className={`px-3 py-1 text-xs font-bold rounded-full transition flex items-center gap-1.5 ${
              pathname === "/admin"
                ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30"
                : "text-amber-400 hover:text-amber-300 hover:bg-slate-800/60"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Admin / PRD</span>
          </Link>
        </nav>

        {/* Role & Persona Switcher */}
        <div className="relative" ref={dropdownRef}>
          {user ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 px-2.5 py-1.5 hover:border-cyan-500/50 hover:bg-slate-800/80 transition shadow-sm text-left"
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-lg text-slate-950 text-xs font-black shadow-sm ${
                    user.role === "DRIVER"
                      ? "bg-gradient-to-tr from-amber-400 to-amber-500"
                      : "bg-gradient-to-tr from-cyan-400 to-blue-500"
                  }`}
                >
                  {user.name.charAt(0)}
                </div>
                <div className="hidden md:block leading-tight">
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <span>{user.name}</span>
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded font-extrabold uppercase tracking-wider ${
                        user.role === "DRIVER"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-cyan-500/20 text-cyan-300"
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[110px]">
                    {user.email}
                  </div>
                </div>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              <button
                onClick={logout}
                title="Sign out"
                className="hidden sm:flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-rose-400 hover:border-rose-500/30 transition shadow-sm"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/40 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-900/50 transition shadow-sm"
              >
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Switch Role</span>
                <span className="sm:hidden">Roles</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              <Link
                href="/login"
                className="hidden sm:inline-flex rounded-xl bg-cyan-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition shadow-md shadow-cyan-500/20"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Persona Switcher Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-800 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 pb-2 border-b border-slate-800/80 flex items-center justify-between">
                <span>1-Click Switch Persona</span>
                {switching && (
                  <span className="text-[10px] text-cyan-400 animate-pulse font-normal">
                    Switching...
                  </span>
                )}
              </div>

              {/* Passenger Personas */}
              <div className="pt-2">
                <div className="text-[10px] font-extrabold text-sky-400 px-2 pb-1 uppercase tracking-wider flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>Passengers (Nusrat, Rafiq, Shirin)</span>
                </div>
                <div className="space-y-1">
                  {DEMO_PERSONAS.filter((p) => p.role === "PASSENGER").map((persona) => {
                    const isCurrent = user?.email === persona.email;
                    return (
                      <button
                        key={persona.id}
                        type="button"
                        onClick={() => handleSwitchPersona(persona)}
                        disabled={switching}
                        className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-left transition ${
                          isCurrent
                            ? "bg-sky-950/60 border border-sky-500/40 text-white"
                            : "hover:bg-slate-900 text-slate-300"
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{persona.name}</span>
                            {isCurrent && (
                              <span className="text-[9px] bg-sky-500/20 text-sky-300 px-1 py-0.2 rounded font-bold">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">{persona.desc}</div>
                        </div>
                        {isCurrent && <Check className="h-4 w-4 text-sky-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Driver Persona */}
              <div className="pt-2.5 mt-2 border-t border-slate-800/80">
                <div className="text-[10px] font-extrabold text-amber-400 px-2 pb-1 uppercase tracking-wider flex items-center gap-1">
                  <Car className="h-3 w-3" />
                  <span>Driver Cockpit (Jashim)</span>
                </div>
                {DEMO_PERSONAS.filter((p) => p.role === "DRIVER").map((persona) => {
                  const isCurrent = user?.email === persona.email;
                  return (
                    <button
                      key={persona.id}
                      type="button"
                      onClick={() => handleSwitchPersona(persona)}
                      disabled={switching}
                      className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-left transition ${
                        isCurrent
                          ? "bg-amber-950/60 border border-amber-500/40 text-white"
                          : "hover:bg-slate-900 text-slate-300"
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{persona.name} (Driver)</span>
                          {isCurrent && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded font-bold">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">{persona.desc}</div>
                      </div>
                      {isCurrent && <Check className="h-4 w-4 text-amber-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Admin & Other Actions */}
              <div className="pt-2.5 mt-2 border-t border-slate-800/80 space-y-1">
                <Link
                  href="/admin"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-amber-400 hover:bg-slate-900 transition"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Admin & PRD Command Center</span>
                </Link>

                <Link
                  href="/passenger/history"
                  onClick={() => setDropdownOpen(false)}
                  className="sm:hidden flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-900 transition"
                >
                  <History className="h-4 w-4" />
                  <span>Trip History</span>
                </Link>

                {user ? (
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/30 transition text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log Out</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      href="/login"
                      onClick={() => setDropdownOpen(false)}
                      className="flex-1 text-center rounded-xl bg-slate-900 border border-slate-800 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setDropdownOpen(false)}
                      className="flex-1 text-center rounded-xl bg-cyan-500 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
