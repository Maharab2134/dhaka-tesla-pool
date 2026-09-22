import Link from "next/link";
import Image from "next/image";
import {
  Zap,
  Shield,
  Users,
  Clock,
  ArrowRight,
  Sparkles,
  MapPin,
  TrendingDown,
  Lock,
  Compass,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-28">
          {/* Ambient Lighting Gradients */}
          <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[550px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-cyan-600/20 via-blue-600/15 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute top-1/3 -right-40 -z-10 h-96 w-96 rounded-full bg-red-600/10 blur-3xl" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Top Eyebrow Badge */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-4 py-1.5 text-xs font-semibold text-cyan-300 backdrop-blur-md shadow-lg shadow-cyan-950/50">
                <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>8:41 AM • Banani Road 11 • Autonomous Electric Pooling</span>
              </div>
            </div>

            {/* Main Headline */}
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl leading-[1.1] text-white">
                Share a seat. Split the fare.{" "}
                <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
                  Survive Dhaka traffic.
                </span>
              </h1>

              <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Meet <strong className="text-white">Bullet</strong> — Jashim&apos;s three-seat,
                battery-powered, totally unaffiliated &ldquo;Tesla&rdquo;. When Nusrat is late for
                Mohakhali and Rafiq needs Gulshan 1, Dhaka Tesla Pool pairs them in seconds, splits
                their fare by <strong className="text-cyan-400 font-bold">25%</strong>, and locks
                the last seat for Shirin.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
                <Link
                  href="/passenger"
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-400 px-6 py-3.5 text-sm font-bold text-slate-950 hover:from-cyan-400 hover:to-sky-300 transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Request a Seat (Passenger)</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/driver"
                  className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-sm font-bold text-white hover:bg-slate-800 hover:border-slate-600 transition-all shadow-md hover:-translate-y-0.5"
                >
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
                  <span>Driver Cockpit (Jashim)</span>
                </Link>

                <Link
                  href="/login"
                  className="flex items-center gap-1.5 rounded-xl border border-cyan-800/50 bg-cyan-950/30 px-5 py-3.5 text-sm font-semibold text-cyan-300 hover:bg-cyan-900/40 transition-all"
                >
                  <span>1-Click Evaluator Demo</span>
                </Link>
              </div>
            </div>

            {/* Vehicle Showcase Card featuring generated "Bullet" */}
            <div className="mt-14 max-w-5xl mx-auto">
              <div className="relative rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 p-3 sm:p-5 shadow-2xl backdrop-blur-xl">
                {/* Floating pill badge on the image */}
                <div className="relative overflow-hidden rounded-2xl aspect-[16/9] w-full max-h-[480px]">
                  <Image
                    src="/images/dhaka-tesla-bullet.jpg"
                    alt="Dhaka Tesla Bullet - Jashim's 3-seat electric three-wheeler in Banani Road 11"
                    fill
                    priority
                    className="object-cover object-center transform hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  {/* Overlaid Tagline & Specs */}
                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
                    <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-xl px-4 py-2.5 shadow-lg">
                      <div className="flex items-center gap-2">
                        <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
                        <span className="text-sm font-extrabold text-white">
                          Tesla Model 3 &ldquo;Bullet&rdquo;
                        </span>
                        <span className="rounded bg-red-500/20 border border-red-500/40 px-1.5 py-0.5 text-[10px] font-bold text-red-400">
                          SEEDED FLEET
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Driver: <strong>Jashim Uddin</strong> • Location: <strong>Banani Road 11</strong> • Capacity: <strong>3 Seats Max</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-xl px-3.5 py-2 text-xs">
                      <div className="text-center px-2 border-r border-slate-800">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Base Fare</div>
                        <div className="font-extrabold text-cyan-400">৳60.00</div>
                      </div>
                      <div className="text-center px-2 border-r border-slate-800">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Per KM</div>
                        <div className="font-extrabold text-cyan-400">৳20.00</div>
                      </div>
                      <div className="text-center px-2">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Pool Discount</div>
                        <div className="font-extrabold text-emerald-400">25% OFF</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Banani Rush-Hour Story Interactive Cast & Timeline */}
        <section className="py-16 border-t border-slate-900 bg-slate-950/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-950 border border-cyan-800/40 px-3 py-1 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                <Compass className="h-3.5 w-3.5" />
                The Banani Rush-Hour Story
              </span>
              <h2 className="mt-3 text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                How Dhaka Tesla Pool Works in Real Life
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Straight from Section 1 of the official project brief. Follow the exact cast through the morning commute.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Step 1: Jashim */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur hover:border-slate-700 transition">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40">
                    8:41 AM
                  </span>
                  <span className="text-xs font-semibold text-slate-400">Driver</span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-950 text-red-400 border border-red-800/40 font-bold">
                    J
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Jashim Uddin</h3>
                    <p className="text-xs text-slate-400">Driver of &ldquo;Bullet&rdquo;</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Leaning against Bullet on Banani Road 11. Switches to <strong>ONLINE</strong> in his driver cockpit. 3 seats ready.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-cyan-400 flex items-center justify-between">
                  <span>Occupancy</span>
                  <strong className="text-white">0 / 3 seats</strong>
                </div>
              </div>

              {/* Step 2: Nusrat */}
              <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-5 backdrop-blur hover:border-cyan-500/50 transition shadow-lg shadow-cyan-950/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-900/60 px-2 py-0.5 rounded border border-cyan-700/50">
                    8:43 AM
                  </span>
                  <span className="text-xs font-semibold text-cyan-400">Passenger 1</span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                    N
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Nusrat Jahan</h3>
                    <p className="text-xs text-slate-400">Banani ➔ Mohakhali</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Already late. Requests 1 seat. System creates a pool with Jashim. Status updates to <strong>MATCHED</strong>.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-cyan-400 flex items-center justify-between">
                  <span>Fare (25% off)</span>
                  <strong className="text-white">৳105.00</strong>
                </div>
              </div>

              {/* Step 3: Rafiq */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur hover:border-slate-700 transition">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40">
                    8:45 AM
                  </span>
                  <span className="text-xs font-semibold text-slate-400">Passenger 2</span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-950 text-blue-300 border border-blue-800/40 font-bold">
                    R
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Rafiq Ahmed</h3>
                    <p className="text-xs text-slate-400">Banani ➔ Gulshan 1</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Total stranger. Books Banani ➔ Gulshan 1. Route matches the 2km corridor. Auto-pooled into Bullet!
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-cyan-400 flex items-center justify-between">
                  <span>Occupancy</span>
                  <strong className="text-white">2 / 3 seats</strong>
                </div>
              </div>

              {/* Step 4: Shirin */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur hover:border-slate-700 transition">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40">
                    8:46 AM
                  </span>
                  <span className="text-xs font-semibold text-slate-400">Passenger 3</span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-950 text-purple-300 border border-purple-800/40 font-bold">
                    S
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Shirin Akter</h3>
                    <p className="text-xs text-slate-400">Takes the last seat</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Shirin books seat #3. Bullet is now <strong>FULL (3/3)</strong>. Concurrency lock prevents 4th passenger overbooking.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-emerald-400 flex items-center justify-between">
                  <span>Status</span>
                  <strong className="text-emerald-400 font-bold">FULL (3/3)</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Predefined Corridors & Transparent Pricing */}
        <section className="py-16 border-t border-slate-900 bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                  Transparent Pricing
                </span>
                <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">
                  Popular Dhaka Pooling Corridors
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Fixed transparent formula: Base ৳60.00 + ৳20.00/km − 25% Pool Discount.
                </p>
              </div>

              <Link
                href="/passenger"
                className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition"
              >
                <span>Open Interactive Fare Estimator</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Corridor 1 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur hover:border-slate-700 transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                    <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Banani ➔ Mohakhali</span>
                  </div>
                  <span className="text-xs bg-cyan-950 text-cyan-400 border border-cyan-800/40 px-2 py-0.5 rounded-full font-mono">
                    ~3.0 km
                  </span>
                </div>
                <div className="flex items-baseline gap-3 my-2">
                  <span className="text-3xl font-extrabold text-white">৳105.00</span>
                  <span className="text-xs text-slate-500 line-through">৳120.00 regular</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Nusrat&apos;s morning route. Saves ৳15.00 instantly while bypassing Banani-Chairmanbari gridlock.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-semibold">25% Pool Savings</span>
                  <Link
                    href="/login"
                    className="text-cyan-400 hover:text-white font-semibold transition"
                  >
                    Test as Nusrat →
                  </Link>
                </div>
              </div>

              {/* Corridor 2 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur hover:border-slate-700 transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                    <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Banani ➔ Gulshan 1</span>
                  </div>
                  <span className="text-xs bg-cyan-950 text-cyan-400 border border-cyan-800/40 px-2 py-0.5 rounded-full font-mono">
                    ~2.5 km
                  </span>
                </div>
                <div className="flex items-baseline gap-3 my-2">
                  <span className="text-3xl font-extrabold text-white">৳82.50</span>
                  <span className="text-xs text-slate-500 line-through">৳110.00 regular</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Rafiq&apos;s route. Shares the Banani pickup corridor with Nusrat in Jashim&apos;s Bullet.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-semibold">25% Pool Savings</span>
                  <Link
                    href="/login"
                    className="text-cyan-400 hover:text-white font-semibold transition"
                  >
                    Test as Rafiq →
                  </Link>
                </div>
              </div>

              {/* Corridor 3 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur hover:border-slate-700 transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                    <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Uttara ➔ Farmgate</span>
                  </div>
                  <span className="text-xs bg-cyan-950 text-cyan-400 border border-cyan-800/40 px-2 py-0.5 rounded-full font-mono">
                    ~14.5 km
                  </span>
                </div>
                <div className="flex items-baseline gap-3 my-2">
                  <span className="text-3xl font-extrabold text-white">৳270.00</span>
                  <span className="text-xs text-slate-500 line-through">৳360.00 regular</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Long-haul Airport corridor. Significant savings without surge pricing gouging.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-semibold">৳90.00 Saved</span>
                  <Link
                    href="/passenger"
                    className="text-cyan-400 hover:text-white font-semibold transition"
                  >
                    Estimate Live →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Architectural Pillars */}
        <section className="py-16 border-t border-slate-900 bg-slate-950/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                Production-Minded Engineering
              </span>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">
                Built for High Reliability & Concurrency
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-950 text-cyan-400 mb-4 border border-cyan-800/50">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Hard 3-Seat Capacity</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Vehicles never overbook. Bullet has 3 seats, and 3 means 3. Concurrency-protected
                  database transactions serialize seat claims, preventing race condition overbooking.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-950 text-blue-400 mb-4 border border-blue-800/50">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Pessimistic Row Locking</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Uses PostgreSQL <code className="text-cyan-400 bg-slate-950 px-1 py-0.5 rounded">SELECT ... FOR UPDATE</code> in Prisma transactions. Simultaneous requests for the last seat are strictly serialized at the DB engine layer.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-950 text-emerald-400 mb-4 border border-emerald-800/50">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Audited State Machine</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Finite State Machine (<code className="text-cyan-400 bg-slate-950 px-1 py-0.5 rounded">REQUESTED → MATCHED → DRIVER_ARRIVED → STARTED → COMPLETED</code>). Illegal jumps are rejected with full history logging.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <p className="max-w-md mx-auto">
          © 2026 Dhaka Tesla Pool. Developed for the Internship Assessment.
          <br />
          <span className="text-slate-600">
            &ldquo;In Dhaka, your Tesla may have three wheels — but your engineering should still be production-minded.&rdquo;
          </span>
        </p>
      </footer>
    </div>
  );
}
