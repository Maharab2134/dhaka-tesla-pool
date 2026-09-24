"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Zap,
  Lock,
  Mail,
  ArrowRight,
  Car,
  User,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Users,
} from "lucide-react";
import { useAuth } from "../../lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"quick" | "password">("quick");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      router.push("/passenger");
    } else {
      setError(res.error || "Login failed. Check your credentials.");
    }
  };

  const handleQuickLogin = async (
    demoEmail: string,
    targetRole: "PASSENGER" | "DRIVER"
  ) => {
    setError(null);
    setLoading(true);
    const res = await login(demoEmail, "Password123!");
    setLoading(false);

    if (res.success) {
      if (targetRole === "DRIVER") {
        router.push("/driver");
      } else {
        router.push("/passenger");
      }
    } else {
      setError(res.error || "Quick login failed.");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-950">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header with Fleet Branding */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-semibold text-cyan-300 backdrop-blur-md mb-4 shadow-md">
            <Zap className="h-3.5 w-3.5 text-cyan-400 fill-current" />
            <span>Role-Based Authentication • Banani Corridor</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Choose Your Role or Sign In
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Select a verified persona from the PRD storyline or log in with your custom registered credentials.
          </p>
        </div>

        {/* Tab Switcher: 1-Click Role Login vs Password Login */}
        <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setActiveTab("quick")}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === "quick"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>1-Click Role Login (Evaluator)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("password")}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === "password"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Standard Email / Password</span>
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-950/30 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* SECTION 1: 1-Click Role Cards */}
        {activeTab === "quick" && (
          <div className="space-y-4">
            {/* Passenger Roles */}
            <div className="rounded-2xl border border-sky-500/30 bg-sky-950/20 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Passenger Personas</h2>
                    <p className="text-[11px] text-slate-400">
                      Request seats, split fares with 25% pool discount, and view live status.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 rounded-full">
                  ROLE: PASSENGER
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Nusrat */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin("nusrat@tesla.dhaka", "PASSENGER")}
                  disabled={loading}
                  className="group rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 text-left hover:border-sky-500 hover:bg-slate-800/90 transition shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-white group-hover:text-sky-400 transition text-sm">
                      Nusrat
                    </span>
                    <span className="text-[9px] font-semibold bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded">
                      Seat 1
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-medium">
                    Banani ➔ Mohakhali
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">nusrat@tesla.dhaka</div>
                  <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-sky-400 group-hover:translate-x-0.5 transition-transform">
                    <span>Log in as Nusrat</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </button>

                {/* Rafiq */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin("rafiq@tesla.dhaka", "PASSENGER")}
                  disabled={loading}
                  className="group rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 text-left hover:border-sky-500 hover:bg-slate-800/90 transition shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-white group-hover:text-sky-400 transition text-sm">
                      Rafiq
                    </span>
                    <span className="text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
                      Seat 2
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-medium">
                    Banani ➔ Gulshan 1
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">rafiq@tesla.dhaka</div>
                  <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-sky-400 group-hover:translate-x-0.5 transition-transform">
                    <span>Log in as Rafiq</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </button>

                {/* Shirin */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin("shirin@tesla.dhaka", "PASSENGER")}
                  disabled={loading}
                  className="group rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 text-left hover:border-sky-500 hover:bg-slate-800/90 transition shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-white group-hover:text-sky-400 transition text-sm">
                      Shirin
                    </span>
                    <span className="text-[9px] font-semibold bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">
                      Seat 3 (Full)
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-medium">
                    Banani ➔ Mohakhali
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">shirin@tesla.dhaka</div>
                  <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-sky-400 group-hover:translate-x-0.5 transition-transform">
                    <span>Log in as Shirin</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </button>
              </div>
            </div>

            {/* Driver Role */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                    <Car className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Driver Cockpit (Jashim)</h2>
                    <p className="text-[11px] text-slate-400">
                      Operate vehicle Bullet (Tesla Model 3, 3 seats), accept pools, advance ride status.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  ROLE: DRIVER
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleQuickLogin("jashim@tesla.dhaka", "DRIVER")}
                  disabled={loading}
                  className="group rounded-xl border border-slate-800 bg-slate-900/90 p-4 text-left hover:border-amber-500 hover:bg-slate-800/90 transition shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-white group-hover:text-amber-400 transition text-sm">
                      Jashim (Driver)
                    </span>
                    <span className="text-[9px] font-semibold bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded">
                      Vehicle: Bullet
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Fleet: Tesla Model 3 • Capacity: 3 Seats
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">jashim@tesla.dhaka</div>
                  <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-amber-400 group-hover:translate-x-0.5 transition-transform">
                    <span>Open Driver Cockpit</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </button>

                {/* Direct Link to Admin Command Center */}
                <Link
                  href="/admin"
                  className="group rounded-xl border border-amber-500/20 bg-slate-900/90 p-4 text-left hover:border-amber-400 hover:bg-slate-800/90 transition shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Admin / PRD Matrix</span>
                      </span>
                      <span className="text-[9px] font-semibold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                        Evaluator
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Live Telemetry, 8 DB models, 1-Click Story Simulator, and PRD audit.
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-amber-400 group-hover:translate-x-0.5 transition-transform">
                    <span>Open Command Center</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: Standard Email / Password Form */}
        {activeTab === "password" && (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl"
          >
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. nusrat@tesla.dhaka"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-sky-400 py-3 text-xs font-bold text-slate-950 hover:from-cyan-400 hover:to-sky-300 transition shadow-lg shadow-cyan-500/25 disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Sign In to Account"}
            </button>
          </form>
        )}

        {/* Footer info */}
        <div className="text-center text-xs text-slate-500">
          <span>Need a new account? </span>
          <Link href="/register" className="font-semibold text-cyan-400 hover:underline">
            Register as Passenger or Driver
          </Link>
        </div>
      </div>
    </div>
  );
}
