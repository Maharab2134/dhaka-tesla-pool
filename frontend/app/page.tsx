import Link from "next/link";
import { Zap, Shield, Users, Clock, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-lg shadow-cyan-500/20">
              <Zap className="h-6 w-6 text-slate-950 fill-current" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">
                Dhaka Tesla Pool
              </span>
              <span className="block text-xs text-cyan-400 font-medium tracking-wide">
                SURVIVE DHAKA TRAFFIC
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-300 hover:text-white transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition shadow-md shadow-cyan-500/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-24 sm:py-32">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-slate-950" />
          <div className="mx-auto max-w-5xl px-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-4 py-1.5 text-xs font-semibold text-cyan-400 mb-8 backdrop-blur">
              <Zap className="h-3.5 w-3.5" />
              <span>Next-Gen Electric Ride Pooling in Dhaka</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
              Share a seat. Split the fare.{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
                Survive Dhaka traffic.
              </span>
            </h1>

            <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Why sit in gridlock alone? Dhaka Tesla Pool matches compatible riders across Banani,
              Gulshan, and Mohakhali in silent, air-conditioned Teslas with guaranteed seat limits and
              transparent split fares.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/passenger"
                className="flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition shadow-lg shadow-cyan-500/25"
              >
                <span>Passenger Portal</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/driver"
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-6 py-3.5 text-sm font-semibold text-white hover:bg-slate-800/80 transition"
              >
                <span>Driver Dashboard (Jashim)</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Value Props */}
        <section className="border-t border-slate-900 bg-slate-950/50 py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-950 text-cyan-400 mb-4 border border-cyan-800/50">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Strict Capacity Limits</h3>
                <p className="text-sm text-slate-400">
                  Vehicles never overbook. Bullet has 3 seats, and 3 means 3. Concurrency-protected
                  database transactions prevent seat poaching.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-950 text-blue-400 mb-4 border border-blue-800/50">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Fair Individual Pricing</h3>
                <p className="text-sm text-slate-400">
                  Each passenger receives their own clear fare based on route distance and pooling
                  discounts, stored accurately in poisha.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-950 text-emerald-400 mb-4 border border-emerald-800/50">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Audited State Machine</h3>
                <p className="text-sm text-slate-400">
                  Clear transitions: REQUESTED → MATCHED → DRIVER_ARRIVED → STARTED → COMPLETED.
                  Logged with full audit history.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 text-center text-xs text-slate-500">
        <p>© 2026 Dhaka Tesla Pool. Built for the Dhaka Tesla Pool Assessment.</p>
      </footer>
    </div>
  );
}
