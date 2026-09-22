"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, Lock, Mail, User, Car, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "../../lib/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"PASSENGER" | "DRIVER">("PASSENGER");
  const [vehicleName, setVehicleName] = useState("Bullet");
  const [vehicleCapacity, setVehicleCapacity] = useState(3);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload: any = {
      name,
      email,
      password,
      role,
    };

    if (role === "DRIVER") {
      payload.vehicleName = vehicleName;
      payload.vehicleCapacity = Number(vehicleCapacity);
    }

    const res = await register(payload);
    setLoading(false);

    if (res.success) {
      if (role === "DRIVER") {
        router.push("/driver");
      } else {
        router.push("/passenger");
      }
    } else {
      setError(res.error || "Registration failed");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-lg shadow-cyan-500/20 mb-3">
            <Zap className="h-6 w-6 text-slate-950 fill-current" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Create an account</h2>
          <p className="mt-1 text-sm text-slate-400">
            Join Dhaka&apos;s electric ride-pooling revolution
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-500/40 bg-rose-950/30 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Role Selector Tabs */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              I want to register as
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("PASSENGER")}
                className={`flex items-center justify-center gap-2 rounded-lg border py-2 text-xs font-semibold transition ${
                  role === "PASSENGER"
                    ? "border-cyan-500 bg-cyan-950/40 text-cyan-400"
                    : "border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white"
                }`}
              >
                <User className="h-4 w-4" />
                <span>Passenger</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("DRIVER")}
                className={`flex items-center justify-center gap-2 rounded-lg border py-2 text-xs font-semibold transition ${
                  role === "DRIVER"
                    ? "border-cyan-500 bg-cyan-950/40 text-cyan-400"
                    : "border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white"
                }`}
              >
                <Car className="h-4 w-4" />
                <span>Tesla Driver</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Nusrat Jahan"
                className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Driver specific vehicle fields */}
          {role === "DRIVER" && (
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/10 p-3 space-y-3">
              <div className="text-xs font-semibold text-cyan-400">
                Tesla Vehicle Setup
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Vehicle Call-sign
                  </label>
                  <input
                    type="text"
                    value={vehicleName}
                    onChange={(e) => setVehicleName(e.target.value)}
                    className="w-full rounded border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Seat Capacity
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={vehicleCapacity}
                    onChange={(e) => setVehicleCapacity(Number(e.target.value))}
                    className="w-full rounded border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition shadow-md shadow-cyan-500/20 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Complete Registration"}
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="text-center text-xs text-slate-400 pt-2">
            Already have an account?{" "}
            <Link href="/login" className="text-cyan-400 hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
