"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, Lock, Mail, ArrowRight, Car, User, AlertCircle } from "lucide-react";
import { useAuth } from "../../lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      router.push("/passenger");
    } else {
      setError(res.error || "Login failed");
    }
  };

  const handleQuickLogin = async (demoEmail: string, targetRole: "PASSENGER" | "DRIVER") => {
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
      setError(res.error || "Quick login failed");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-lg shadow-cyan-500/20 mb-4">
            <Zap className="h-6 w-6 text-slate-950 fill-current" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to your Dhaka Tesla Pool account
          </p>
        </div>

        {/* 1-Click Fast Demo Login Grid */}
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4 backdrop-blur">
          <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5" />
            <span>1-Click Evaluator Quick Login</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin("jashim@tesla.dhaka", "DRIVER")}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/90 p-2.5 text-left text-slate-200 hover:border-cyan-500 hover:bg-slate-800 transition"
            >
              <Car className="h-4 w-4 text-cyan-400 shrink-0" />
              <div>
                <div className="font-semibold text-white">Jashim</div>
                <div className="text-[10px] text-slate-400">Driver (Bullet)</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("nusrat@tesla.dhaka", "PASSENGER")}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/90 p-2.5 text-left text-slate-200 hover:border-cyan-500 hover:bg-slate-800 transition"
            >
              <User className="h-4 w-4 text-sky-400 shrink-0" />
              <div>
                <div className="font-semibold text-white">Nusrat</div>
                <div className="text-[10px] text-slate-400">Passenger</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("rafiq@tesla.dhaka", "PASSENGER")}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/90 p-2.5 text-left text-slate-200 hover:border-cyan-500 hover:bg-slate-800 transition"
            >
              <User className="h-4 w-4 text-emerald-400 shrink-0" />
              <div>
                <div className="font-semibold text-white">Rafiq</div>
                <div className="text-[10px] text-slate-400">Passenger</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("shirin@tesla.dhaka", "PASSENGER")}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/90 p-2.5 text-left text-slate-200 hover:border-cyan-500 hover:bg-slate-800 transition"
            >
              <User className="h-4 w-4 text-amber-400 shrink-0" />
              <div>
                <div className="font-semibold text-white">Shirin</div>
                <div className="text-[10px] text-slate-400">Passenger</div>
              </div>
            </button>
          </div>
        </div>

        {/* Regular Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-500/40 bg-rose-950/30 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

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
                placeholder="you@tesla.dhaka"
                className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
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
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition shadow-md shadow-cyan-500/20 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="text-center text-xs text-slate-400 pt-2">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-cyan-400 hover:underline">
              Create an account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
