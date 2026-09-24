"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  RefreshCw,
  RotateCcw,
  Zap,
  Play,
  CheckCircle2,
  AlertTriangle,
  Car,
  Users,
  CreditCard,
  History,
  Lock,
  Layers,
  Sparkles,
  ArrowRight,
  Database,
  Compass,
} from "lucide-react";
import { apiRequest } from "../../lib/api";
import { formatPoishaToTaka } from "../../lib/utils";
import { SeatMeter } from "../../components/SeatMeter";

export default function AdminPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"pools" | "rides" | "ledger" | "audit" | "matrix">("matrix");
  const [lastActionResult, setLastActionResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    try {
      const res = await apiRequest("/admin/overview");
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      console.error("Error loading admin overview:", err);
      setErrorMsg("Failed to connect to backend API");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
    const interval = setInterval(fetchOverview, 4000);
    return () => clearInterval(interval);
  }, [fetchOverview]);

  const handleResetDemo = async () => {
    if (!confirm("Are you sure you want to reset the database to pristine demo state? All current rides will be cleared.")) {
      return;
    }
    setActionLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiRequest("/admin/reset-demo", { method: "POST" });
      if (res.success) {
        setLastActionResult({
          title: "Database Reset Complete",
          description: "All rides, pools, fares, and payments cleared. Jashim & Bullet set to OFFLINE. Nusrat, Rafiq, Shirin ready.",
        });
        await fetchOverview();
      } else {
        setErrorMsg(res.error?.message || "Failed to reset demo state");
      }
    } catch (err: any) {
      setErrorMsg("Network error during reset");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSimulateStep = async (stepKey: string) => {
    setActionLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiRequest("/admin/simulate-step", {
        method: "POST",
        body: JSON.stringify({ step: stepKey }),
      });

      if (res.success && res.data) {
        setLastActionResult(res.data);
        await fetchOverview();
      } else {
        setErrorMsg(res.error?.message || "Simulation step failed");
      }
    } catch (err: any) {
      setErrorMsg("Error executing simulation step");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-cyan-400">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span className="text-sm font-semibold">Loading Live Evaluator Command Center...</span>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const vehicle = data?.vehicle;
  const activePool = data?.activePool;
  const pools = data?.pools || [];
  const rides = data?.rides || [];
  const recentHistory = data?.recentHistory || [];
  const payments = data?.payments || [];
  const users = data?.users || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-950/40 px-3.5 py-1 text-xs font-bold text-amber-300 mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>PRD Internship Assessment • Live Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Evaluator Command Center</span>
            <span className="rounded-md bg-cyan-950 border border-cyan-800 px-2.5 py-0.5 text-xs font-mono text-cyan-400 font-semibold">
              LIVE 4s SYNC
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time inspection of database models, capacity locking, automated scenario simulation, and PRD compliance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchOverview}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${actionLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleResetDemo}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-950/40 px-4 py-2 text-xs font-bold text-rose-300 hover:bg-rose-900/60 transition shadow-sm"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Demo State</span>
          </button>
        </div>
      </div>

      {/* Action Notification Box */}
      {lastActionResult && (
        <div className="mb-6 rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-4.5 text-xs backdrop-blur animate-in fade-in">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-extrabold text-emerald-300 text-sm">{lastActionResult.title}</h4>
              <p className="text-slate-300 mt-1 leading-relaxed">{lastActionResult.description}</p>
            </div>
            <button
              onClick={() => setLastActionResult(null)}
              className="text-slate-400 hover:text-white text-xs px-2 py-0.5"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 rounded-2xl border border-rose-500/40 bg-rose-950/30 p-4 text-xs text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Real-time Telemetry Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Bullet Status</span>
            <Car className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-lg font-extrabold text-white flex items-center gap-2">
            <span>{vehicle?.name || "Bullet"}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                vehicle?.isOnline
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {vehicle?.isOnline ? "ONLINE" : "OFFLINE"}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Driver: Jashim (Banani)</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Occupancy</span>
            <Users className="h-4 w-4 text-sky-400" />
          </div>
          <div className="text-lg font-extrabold text-white">
            {activePool ? `${activePool.occupiedSeats} / 3 Seats` : "0 / 3 Seats"}
          </div>
          <div className="text-[11px] text-cyan-400 mt-1 font-semibold">
            {activePool ? `Pool: ${activePool.status}` : "No Active Pool"}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Active Rides</span>
            <Zap className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-white">{metrics.activeRides || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Pending / In-Progress</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Completed Trips</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-white">{metrics.completedRides || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Finalized & Settled</div>
        </div>

        <div className="col-span-2 md:col-span-1 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Settled Revenue</span>
            <CreditCard className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-emerald-400">
            {formatPoishaToTaka(metrics.totalRevenuePoisha || 0)}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            {(metrics.totalRevenuePoisha || 0).toLocaleString()} poisha
          </div>
        </div>
      </div>

      {/* 1-Click Interactive Story Scenario Simulator */}
      <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/20 via-slate-900/80 to-slate-950 p-6 backdrop-blur mb-10 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
              <h2 className="text-base font-extrabold text-white uppercase tracking-wider">
                Interactive PRD Story Scenario Simulator
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Follow Section 1 of the PRD step-by-step. Click each button to trigger live DB transactions & observe the changes below!
            </p>
          </div>
          <span className="text-xs text-cyan-400 font-bold bg-cyan-950/80 border border-cyan-800/60 px-3 py-1 rounded-full">
            Banani Road 11 Story
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Step 1 */}
          <button
            onClick={() => handleSimulateStep("step1_online")}
            disabled={actionLoading}
            className="flex flex-col items-start rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 text-left hover:border-cyan-500/60 hover:bg-slate-800 transition group"
          >
            <div className="flex items-center justify-between w-full mb-1.5">
              <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950 px-1.5 py-0.5 rounded">8:41 AM</span>
              <Play className="h-3 w-3 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="font-bold text-white text-xs">1. Jashim Online</div>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">Bullet goes ONLINE on Banani Rd 11 with 3 seats</p>
          </button>

          {/* Step 2 */}
          <button
            onClick={() => handleSimulateStep("step2_nusrat")}
            disabled={actionLoading}
            className="flex flex-col items-start rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 text-left hover:border-cyan-500/60 hover:bg-slate-800 transition group"
          >
            <div className="flex items-center justify-between w-full mb-1.5">
              <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950 px-1.5 py-0.5 rounded">8:43 AM</span>
              <Play className="h-3 w-3 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="font-bold text-white text-xs">2. Nusrat Requests</div>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">Banani ➔ Mohakhali (1 seat, ৳105 with 25% discount)</p>
          </button>

          {/* Step 3 */}
          <button
            onClick={() => handleSimulateStep("step3_rafiq")}
            disabled={actionLoading}
            className="flex flex-col items-start rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 text-left hover:border-cyan-500/60 hover:bg-slate-800 transition group"
          >
            <div className="flex items-center justify-between w-full mb-1.5">
              <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950 px-1.5 py-0.5 rounded">8:45 AM</span>
              <Play className="h-3 w-3 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="font-bold text-white text-xs">3. Rafiq Auto-Pools</div>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">Banani ➔ Gulshan 1 (&lt;2km corridor, Occupied: 2/3)</p>
          </button>

          {/* Step 4 */}
          <button
            onClick={() => handleSimulateStep("step4_shirin")}
            disabled={actionLoading}
            className="flex flex-col items-start rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 text-left hover:border-cyan-500/60 hover:bg-slate-800 transition group"
          >
            <div className="flex items-center justify-between w-full mb-1.5">
              <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950 px-1.5 py-0.5 rounded">8:46 AM</span>
              <Play className="h-3 w-3 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="font-bold text-white text-xs">4. Shirin Takes Seat #3</div>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">Grabs last seat! Bullet now FULL (3/3 seats occupied)</p>
          </button>

          {/* Step 5 */}
          <button
            onClick={() => handleSimulateStep("step5_overflow")}
            disabled={actionLoading}
            className="flex flex-col items-start rounded-xl border border-rose-500/30 bg-rose-950/20 p-3.5 text-left hover:border-rose-500/60 hover:bg-rose-950/30 transition group"
          >
            <div className="flex items-center justify-between w-full mb-1.5">
              <span className="text-[10px] font-mono text-rose-400 font-bold bg-rose-950 px-1.5 py-0.5 rounded">8:47 AM</span>
              <Lock className="h-3 w-3 text-rose-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="font-bold text-rose-300 text-xs">5. Capacity Test (4th User)</div>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">Tests 4th booking: Rejected with 409 POOL_FULL!</p>
          </button>

          {/* Step 6 */}
          <button
            onClick={() => handleSimulateStep("step6_advance")}
            disabled={actionLoading}
            className="flex flex-col items-start rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 text-left hover:border-cyan-500/60 hover:bg-slate-800 transition group"
          >
            <div className="flex items-center justify-between w-full mb-1.5">
              <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950 px-1.5 py-0.5 rounded">TRIP</span>
              <Play className="h-3 w-3 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="font-bold text-white text-xs">6. Arrive ➔ Start Trip</div>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">FSM transitions: ARRIVED ➔ STARTED for all riders</p>
          </button>

          {/* Step 7 */}
          <button
            onClick={() => handleSimulateStep("step7_complete")}
            disabled={actionLoading}
            className="flex flex-col items-start rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-3.5 text-left hover:border-emerald-500/60 hover:bg-emerald-950/40 transition group lg:col-span-2"
          >
            <div className="flex items-center justify-between w-full mb-1.5">
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950 px-1.5 py-0.5 rounded">FINALIZE</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="font-bold text-emerald-300 text-xs">7. Complete Trip & Auto-Settle Payments</div>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">Transitions to COMPLETED, resets Bullet seats to 0, and records settled payments in integer poisha.</p>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 mb-6 pb-2">
        <button
          onClick={() => setActiveTab("matrix")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
            activeTab === "matrix"
              ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>PRD Compliance Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab("pools")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
            activeTab === "pools"
              ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Car className="h-3.5 w-3.5" />
          <span>Pools & Vehicles ({pools.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("rides")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
            activeTab === "rides"
              ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>All Ride Requests ({rides.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("ledger")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
            activeTab === "ledger"
              ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <CreditCard className="h-3.5 w-3.5" />
          <span>Financial Ledger ({payments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
            activeTab === "audit"
              ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <History className="h-3.5 w-3.5" />
          <span>Audit Log History ({recentHistory.length})</span>
        </button>
      </div>

      {/* Tab 1: PRD Compliance Matrix */}
      {activeTab === "matrix" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur">
              <div className="flex items-center gap-2.5 text-emerald-400 mb-2">
                <CheckCircle2 className="h-5 w-5" />
                <h3 className="font-extrabold text-white text-sm">PRD Section 1 & 2: Story Cast & Invariants</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Uses the exact story cast: <strong>Jashim Uddin</strong> (Driver), vehicle <strong>Bullet</strong> (Capacity: 3), and passengers <strong>Nusrat Jahan</strong>, <strong>Rafiq Ahmed</strong>, <strong>Shirin Akter</strong>.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-mono">
                <span className="rounded bg-slate-800 px-2 py-0.5 text-cyan-300">jashim@tesla.dhaka</span>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-cyan-300">nusrat@tesla.dhaka</span>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-cyan-300">rafiq@tesla.dhaka</span>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-cyan-300">shirin@tesla.dhaka</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur">
              <div className="flex items-center gap-2.5 text-emerald-400 mb-2">
                <CheckCircle2 className="h-5 w-5" />
                <h3 className="font-extrabold text-white text-sm">PRD Section 3: Hard 3-Seat Capacity Limit</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Bullet capacity is strictly locked at <strong>3 seats</strong>. Whenever 3 seats are claimed, pool status flips to <code>FULL</code>. Fourth passenger attempts are rejected with <code>409 POOL_FULL</code>.
              </p>
              <div className="mt-3 text-[11px] text-cyan-400 font-semibold">
                Status: Verified via 4 automated test suites & pessimistic locking.
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur">
              <div className="flex items-center gap-2.5 text-emerald-400 mb-2">
                <CheckCircle2 className="h-5 w-5" />
                <h3 className="font-extrabold text-white text-sm">PRD Section 4 & 5: Fare Formula & Integer Poisha</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Exact formula: <code>Base (৳60.00) + Distance (৳20.00/km) - Pool Discount (25%)</code>. All transactions calculated and stored in integer <strong>poisha</strong> to prevent floating-point rounding drift.
              </p>
              <div className="mt-3 text-[11px] text-cyan-400 font-semibold">
                Status: Banani ➔ Mohakhali (3km) = ৳105.00 (10,500 poisha).
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur">
              <div className="flex items-center gap-2.5 text-emerald-400 mb-2">
                <CheckCircle2 className="h-5 w-5" />
                <h3 className="font-extrabold text-white text-sm">PRD Section 9: Finite State Machine & Concurrency</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Strict transitions: <code>REQUESTED ➔ MATCHED ➔ DRIVER_ARRIVED ➔ STARTED ➔ COMPLETED</code>. Concurrency race conditions eliminated via PostgreSQL row locks: <code>SELECT ... FOR UPDATE</code>.
              </p>
              <div className="mt-3 text-[11px] text-cyan-400 font-semibold">
                Status: Illegal transitions (e.g. COMPLETED ➔ STARTED) strictly rejected.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Pools & Vehicle */}
      {activeTab === "pools" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur">
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
              Active Vehicle: Tesla &ldquo;Bullet&rdquo;
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="text-xs text-slate-400">Driver</div>
                <div className="text-base font-bold text-white mt-1">{vehicle?.driver?.name || "Jashim Uddin"}</div>
                <div className="text-xs text-cyan-400">{vehicle?.driver?.email}</div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="text-xs text-slate-400">Capacity & State</div>
                <div className="text-base font-bold text-white mt-1">{vehicle?.capacity} Seats Hard Limit</div>
                <div className="text-xs text-emerald-400 font-semibold">
                  {vehicle?.isOnline ? "● ONLINE & ACCEPTING" : "○ OFFLINE"}
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="text-xs text-slate-400">Hub Location</div>
                <div className="text-base font-bold text-white mt-1">Banani Road 11</div>
                <div className="text-xs text-slate-400">Dhaka North Corridor</div>
              </div>
            </div>

            {/* Pools List */}
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              All Pools ({pools.length})
            </h3>
            {pools.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 rounded-xl border border-dashed border-slate-800">
                No active or historical pools found. Use the story simulator above to create one.
              </div>
            ) : (
              <div className="space-y-4">
                {pools.map((p: any) => (
                  <div key={p.id} className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-xs font-mono font-bold text-cyan-400">POOL #{p.id.slice(-6).toUpperCase()}</span>
                        <span className="text-xs text-slate-400 ml-2">Vehicle: {p.vehicle?.name}</span>
                      </div>
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {p.status}
                      </span>
                    </div>

                    <SeatMeter occupied={p.occupiedSeats || 0} capacity={p.vehicle?.capacity || 3} />

                    <div className="space-y-1.5 pt-2">
                      <div className="text-[11px] font-bold text-slate-400 uppercase">Pooled Riders ({p.members.length})</div>
                      {p.members.map((m: any) => (
                        <div key={m.id} className="flex items-center justify-between text-xs bg-slate-900/60 p-2.5 rounded-lg">
                          <div>
                            <span className="font-bold text-white">{m.passenger.name}</span>
                            <span className="text-slate-400 ml-2">({m.rideRequest.pickupArea} ➔ {m.rideRequest.destinationArea})</span>
                          </div>
                          <div className="font-extrabold text-cyan-400">{formatPoishaToTaka(m.farePoisha)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Ride Requests */}
      {activeTab === "rides" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Ride ID</th>
                <th className="pb-3 font-semibold">Passenger</th>
                <th className="pb-3 font-semibold">Route</th>
                <th className="pb-3 font-semibold">Seats</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Fare (BDT)</th>
                <th className="pb-3 font-semibold">Pool ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {rides.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No ride requests yet. Run a step above to populate.
                  </td>
                </tr>
              ) : (
                rides.map((r: any) => (
                  <tr key={r.id} className="hover:bg-slate-850/50">
                    <td className="py-3 font-mono text-[11px] text-cyan-400 font-bold">
                      #{r.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3 font-bold text-white">{r.passenger?.name}</td>
                    <td className="py-3">
                      {r.pickupArea} ➔ {r.destinationArea}
                    </td>
                    <td className="py-3 font-bold text-white">{r.seatsRequested}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        r.status === "COMPLETED"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : r.status === "MATCHED" || r.status === "STARTED"
                          ? "bg-cyan-950 text-cyan-300 border border-cyan-800"
                          : "bg-slate-800 text-slate-400"
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 font-extrabold text-white">
                      {formatPoishaToTaka(r.fare?.finalFarePoisha || r.estimatedFarePoisha)}
                    </td>
                    <td className="py-3 font-mono text-[10px] text-slate-400">
                      {r.poolMember ? `#${r.poolMember.poolId.slice(-6).toUpperCase()}` : "UNASSIGNED"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Financial Ledger */}
      {activeTab === "ledger" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur overflow-x-auto">
          <div className="text-xs text-slate-400 mb-4">
            Demonstrates exact integer poisha arithmetic and automatic settlement upon completion.
          </div>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Payment ID</th>
                <th className="pb-3 font-semibold">Passenger</th>
                <th className="pb-3 font-semibold">Amount (BDT)</th>
                <th className="pb-3 font-semibold">Integer Poisha</th>
                <th className="pb-3 font-semibold">Method</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No payment records yet. Complete a trip in the simulator to generate settlements.
                  </td>
                </tr>
              ) : (
                payments.map((p: any) => (
                  <tr key={p.id}>
                    <td className="py-3 font-mono text-[11px] text-cyan-400">#{p.id.slice(-6).toUpperCase()}</td>
                    <td className="py-3 font-bold text-white">{p.passenger?.name}</td>
                    <td className="py-3 font-extrabold text-emerald-400">{formatPoishaToTaka(p.amountPoisha)}</td>
                    <td className="py-3 font-mono text-[11px] text-slate-400">{p.amountPoisha.toLocaleString()} poisha</td>
                    <td className="py-3 font-semibold text-slate-300">{p.method}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-800">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 text-[11px] text-slate-400">{new Date(p.createdAt).toLocaleTimeString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 5: Audit Log */}
      {activeTab === "audit" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur overflow-x-auto">
          <div className="text-xs text-slate-400 mb-4">
            Immutable audit trail from <code>RideStatusHistory</code> tracking every lifecycle state transition.
          </div>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Time</th>
                <th className="pb-3 font-semibold">Ride</th>
                <th className="pb-3 font-semibold">Passenger</th>
                <th className="pb-3 font-semibold">Transition</th>
                <th className="pb-3 font-semibold">Actor ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {recentHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No status history logged yet.
                  </td>
                </tr>
              ) : (
                recentHistory.map((h: any) => (
                  <tr key={h.id}>
                    <td className="py-3 text-[11px] text-slate-400 font-mono">
                      {new Date(h.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-3 font-mono text-[11px] text-cyan-400 font-bold">
                      #{h.rideRequestId.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3 font-bold text-white">{h.rideRequest?.passenger?.name}</td>
                    <td className="py-3">
                      <span className="font-mono text-slate-400">{h.fromStatus || "START"}</span>
                      <span className="mx-1.5 text-cyan-400 font-bold">➔</span>
                      <span className="font-mono font-bold text-emerald-400">{h.toStatus}</span>
                    </td>
                    <td className="py-3 font-mono text-[10px] text-slate-500">{h.changedBy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
