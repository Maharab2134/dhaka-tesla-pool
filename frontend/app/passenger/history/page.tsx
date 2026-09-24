"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { History, ArrowLeft, RefreshCw, Car, MapPin, CheckCircle2, XCircle, User, ShieldCheck } from "lucide-react";
import { useAuth } from "../../../lib/auth-context";
import { apiRequest } from "../../../lib/api";
import { formatPoishaToTaka } from "../../../lib/utils";

const PASSENGERS = [
  { name: "Nusrat", email: "nusrat@tesla.dhaka" },
  { name: "Rafiq", email: "rafiq@tesla.dhaka" },
  { name: "Shirin", email: "shirin@tesla.dhaka" },
];

export default function PassengerHistoryPage() {
  const { user, login } = useAuth();
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  const fetchRides = useCallback(async () => {
    if (!user || user.role !== "PASSENGER") {
      setLoading(false);
      return;
    }

    setLoading(true);
    const res = await apiRequest("/rides/my-rides");
    if (res.success && res.data?.rides) {
      setRides(res.data.rides);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchRides();
  }, [fetchRides]);

  const handleQuickLogin = async (email: string) => {
    setLoading(true);
    await login(email, "Password123!");
    fetchRides();
  };

  const filteredRides = rides.filter((r) => {
    if (filter === "ALL") return true;
    if (filter === "COMPLETED") return r.status === "COMPLETED";
    if (filter === "CANCELLED") return r.status === "CANCELLED";
    if (filter === "ACTIVE") return r.status !== "COMPLETED" && r.status !== "CANCELLED";
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
        <div>
          <Link
            href="/passenger"
            className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:underline mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Passenger Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <History className="h-7 w-7 text-cyan-400" />
            <span>My Ride History & Receipts</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete record of your Tesla pooling trips, transparent fare breakdowns, and audit trails.
          </p>
        </div>

        {user && user.role === "PASSENGER" && (
          <button
            onClick={fetchRides}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        )}
      </div>

      {/* Guest / Driver Guard */}
      {!user ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center backdrop-blur max-w-md mx-auto my-12">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-950/40 text-cyan-400 mb-3 border border-cyan-800/40">
            <User className="h-6 w-6" />
          </div>
          <h2 className="text-base font-bold text-white mb-1">Sign In to View Ride History</h2>
          <p className="text-xs text-slate-400 mb-6">
            Select a passenger persona to inspect their personalized trips and poisha receipts:
          </p>

          <div className="grid grid-cols-3 gap-2">
            {PASSENGERS.map((p) => (
              <button
                key={p.email}
                type="button"
                onClick={() => handleQuickLogin(p.email)}
                className="rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-2 text-xs font-semibold text-white hover:border-cyan-500 hover:text-cyan-400 transition"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      ) : user.role === "DRIVER" ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-6 text-center backdrop-blur max-w-lg mx-auto my-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-900/40 text-amber-400 mb-3 border border-amber-700/40">
            <Car className="h-6 w-6" />
          </div>
          <h2 className="text-base font-bold text-white mb-1">Driver Account (Jashim)</h2>
          <p className="text-xs text-slate-300 mb-4">
            Driver accounts do not hold individual passenger tickets. View the entire pool ledger in the Admin Center or switch to a passenger:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {PASSENGERS.map((p) => (
              <button
                key={p.email}
                type="button"
                onClick={() => handleQuickLogin(p.email)}
                className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:border-cyan-400 hover:text-cyan-400 transition"
              >
                Switch to {p.name}
              </button>
            ))}
            <Link
              href="/admin"
              className="rounded-xl bg-amber-400 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-300 transition"
            >
              Admin Command Center
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Passenger Persona Indicator */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2">
              {["ALL", "ACTIVE", "COMPLETED", "CANCELLED"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    filter === f
                      ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold"
                      : "border border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Quick Switch Persona Pill */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>View as:</span>
              {PASSENGERS.map((p) => (
                <button
                  key={p.email}
                  type="button"
                  onClick={() => handleQuickLogin(p.email)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    user.email === p.email
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Rides Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur">
            {filteredRides.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                {loading ? "Loading ride receipts..." : `No rides found for ${user.name} in this filter.`}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="pb-3">Trip ID</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Route</th>
                      <th className="pb-3">Seats</th>
                      <th className="pb-3">Base / Rate</th>
                      <th className="pb-3">Pool Discount</th>
                      <th className="pb-3">Final Fare</th>
                      <th className="pb-3">Vehicle</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredRides.map((r) => (
                      <tr key={r.id} className="text-slate-300 hover:bg-slate-800/20 transition">
                        <td className="py-3 font-mono text-[11px] text-slate-500">
                          #{r.id.slice(-6).toUpperCase()}
                        </td>
                        <td className="py-3 text-slate-400">
                          {new Date(r.createdAt).toLocaleString(undefined, {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </td>
                        <td className="py-3 font-medium text-white">
                          {r.pickupArea} → {r.destinationArea}
                        </td>
                        <td className="py-3 font-semibold">{r.seatsRequested}</td>
                        <td className="py-3 text-slate-400">
                          {r.fare
                            ? formatPoishaToTaka(
                                r.fare.baseFarePoisha + r.fare.distanceChargePoisha
                              )
                            : "-"}
                        </td>
                        <td className="py-3 text-emerald-400 font-semibold">
                          {r.fare && r.fare.poolDiscountPoisha > 0
                            ? `-${formatPoishaToTaka(r.fare.poolDiscountPoisha)}`
                            : "৳0"}
                        </td>
                        <td className="py-3 font-bold text-cyan-400 text-sm">
                          {formatPoishaToTaka(
                            r.fare?.finalFarePoisha || r.estimatedFarePoisha
                          )}
                        </td>
                        <td className="py-3 text-slate-400">
                          {r.poolMember?.pool?.vehicle?.name || "Bullet"}
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                              r.status === "COMPLETED"
                                ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                : r.status === "CANCELLED"
                                ? "bg-rose-950 text-rose-300 border border-rose-800"
                                : "bg-cyan-950 text-cyan-300 border border-cyan-800"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
