"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { History, ArrowLeft, RefreshCw, Car, MapPin, CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "../../../lib/auth-context";
import { apiRequest } from "../../../lib/api";
import { formatPoishaToTaka } from "../../../lib/utils";

export default function PassengerHistoryPage() {
  const { user } = useAuth();
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  const fetchRides = useCallback(async () => {
    if (!user) {
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

  const filteredRides = rides.filter((r) => {
    if (filter === "ALL") return true;
    if (filter === "COMPLETED") return r.status === "COMPLETED";
    if (filter === "CANCELLED") return r.status === "CANCELLED";
    if (filter === "ACTIVE") return r.status !== "COMPLETED" && r.status !== "CANCELLED";
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
        <div>
          <Link
            href="/passenger"
            className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:underline mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <History className="h-7 w-7 text-cyan-400" />
            <span>My Ride History</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Complete record of your Tesla pooling trips, transparent fare breakdowns, and audit trails.
          </p>
        </div>

        <button
          onClick={fetchRides}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {["ALL", "ACTIVE", "COMPLETED", "CANCELLED"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              filter === f
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "border border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Rides Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur">
        {filteredRides.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            {loading ? "Loading ride history..." : "No rides found in this category."}
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
                    <td className="py-3 text-emerald-400">
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
                      {r.poolMember?.pool?.vehicle?.name || "Unassigned"}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-block rounded px-2.5 py-1 text-[10px] font-bold ${
                          r.status === "COMPLETED"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : r.status === "CANCELLED"
                            ? "bg-rose-950 text-rose-400 border border-rose-800"
                            : "bg-cyan-950 text-cyan-400 border border-cyan-800"
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
    </div>
  );
}
