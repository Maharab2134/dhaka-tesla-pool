"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Users,
  Zap,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  XCircle,
  Car,
  Clock,
} from "lucide-react";
import { useAuth } from "../../lib/auth-context";
import { apiRequest } from "../../lib/api";
import { formatPoishaToTaka } from "../../lib/utils";
import { RideTimeline } from "../../components/RideTimeline";

const DHAKA_AREAS = [
  "Banani",
  "Gulshan 1",
  "Gulshan 2",
  "Mohakhali",
  "Farmgate",
  "Dhanmondi",
  "Mirpur 10",
  "Uttara",
  "Bashundhara",
];

export default function PassengerDashboard() {
  const { user, isLoading: authLoading } = useAuth();

  const [pickupArea, setPickupArea] = useState("Banani");
  const [destinationArea, setDestinationArea] = useState("Mohakhali");
  const [seatsRequested, setSeatsRequested] = useState(1);

  const [estimate, setEstimate] = useState<any>(null);
  const [estimateLoading, setEstimateLoading] = useState(false);

  const [activeRide, setActiveRide] = useState<any>(null);
  const [rides, setRides] = useState<any[]>([]);
  const [loadingAction, setLoadingAction] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch fare estimate
  const fetchEstimate = useCallback(async () => {
    if (pickupArea === destinationArea) {
      setEstimate(null);
      return;
    }

    setEstimateLoading(true);
    const res = await apiRequest("/rides/estimate", {
      method: "POST",
      body: JSON.stringify({
        pickupArea,
        destinationArea,
        seatsRequested,
      }),
    });

    if (res.success) {
      setEstimate(res.data);
    } else {
      setEstimate(null);
    }
    setEstimateLoading(false);
  }, [pickupArea, destinationArea, seatsRequested]);

  // Fetch passenger's rides
  const fetchRides = useCallback(async () => {
    if (!user) return;
    const res = await apiRequest("/rides/my-rides");
    if (res.success && res.data?.rides) {
      const allRides = res.data.rides;
      setRides(allRides);

      // Find first non-terminal active ride
      const active = allRides.find(
        (r: any) => r.status !== "COMPLETED" && r.status !== "CANCELLED"
      );
      setActiveRide(active || null);
    }
  }, [user]);

  useEffect(() => {
    fetchEstimate();
  }, [fetchEstimate]);

  useEffect(() => {
    fetchRides();
    // Poll every 5s for active status changes
    const interval = setInterval(fetchRides, 5000);
    return () => clearInterval(interval);
  }, [fetchRides]);

  const handleRequestRide = async () => {
    if (!user) {
      setMessage({ type: "error", text: "Please sign in as a passenger first" });
      return;
    }

    setLoadingAction(true);
    setMessage(null);

    const res = await apiRequest("/rides", {
      method: "POST",
      body: JSON.stringify({
        pickupArea,
        destinationArea,
        seatsRequested,
      }),
    });

    setLoadingAction(false);

    if (res.success && res.data?.ride) {
      setMessage({
        type: "success",
        text: "Ride requested successfully! Checking compatible Tesla pool...",
      });
      fetchRides();
    } else {
      setMessage({
        type: "error",
        text: res.error?.message || "Failed to request ride",
      });
    }
  };

  const handleCancelRide = async (rideId: string) => {
    setLoadingAction(true);
    const res = await apiRequest(`/rides/${rideId}/cancel`, {
      method: "POST",
    });
    setLoadingAction(false);

    if (res.success) {
      setMessage({ type: "success", text: "Ride successfully cancelled." });
      fetchRides();
    } else {
      setMessage({
        type: "error",
        text: res.error?.message || "Could not cancel ride",
      });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Zap className="h-7 w-7 text-cyan-400 fill-current" />
            <span>Passenger Dashboard</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Book smart, pooled seats in silent electric Teslas across Dhaka corridors.
          </p>
        </div>

        {user ? (
          <div className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-950/20 px-3.5 py-2">
            <span className="text-xs text-slate-400">Logged in as:</span>
            <span className="text-xs font-semibold text-cyan-400">{user.name}</span>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded">
              {user.email}
            </span>
          </div>
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition"
          >
            <span>Sign In to Request</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {message && (
        <div
          className={`mb-6 flex items-center gap-2.5 rounded-xl border p-3.5 text-xs ${
            message.type === "success"
              ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-300"
              : "border-rose-500/40 bg-rose-950/30 text-rose-300"
          }`}
        >
          {message.type === "success" ? (
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Grid: Request Form vs Active Ride */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Ride Request Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-cyan-400" />
              <span>Where are you going?</span>
            </h2>

            <div className="space-y-4">
              {/* Pickup Area */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Pickup Location
                </label>
                <select
                  value={pickupArea}
                  onChange={(e) => setPickupArea(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  {DHAKA_AREAS.map((area) => (
                    <option key={area} value={area}>
                      📍 {area}
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination Area */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Destination Location
                </label>
                <select
                  value={destinationArea}
                  onChange={(e) => setDestinationArea(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  {DHAKA_AREAS.map((area) => (
                    <option key={area} value={area}>
                      🎯 {area}
                    </option>
                  ))}
                </select>
              </div>

              {/* Seats Requested */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Seats Needed
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSeatsRequested(num)}
                      className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold transition ${
                        seatsRequested === num
                          ? "border-cyan-500 bg-cyan-950/40 text-cyan-400"
                          : "border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white"
                      }`}
                    >
                      <Users className="h-3.5 w-3.5" />
                      <span>{num} {num === 1 ? "Seat" : "Seats"}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Dynamic Fare Breakdown */}
              {estimate && (
                <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Trip Distance</span>
                    <span className="font-semibold text-white">
                      ~{estimate.distanceKm} km
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Base Fare + Rate</span>
                    <span>
                      {formatPoishaToTaka(
                        estimate.pooledFare.baseFarePoisha +
                          estimate.pooledFare.distanceChargePoisha
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-emerald-400">
                    <span>Tesla Pool Discount (25%)</span>
                    <span>
                      -{formatPoishaToTaka(estimate.pooledFare.poolDiscountPoisha)}
                    </span>
                  </div>
                  <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400">Individual Final Fare</div>
                      <div className="text-[10px] text-cyan-400 font-medium">
                        Guaranteed transparent poisha math
                      </div>
                    </div>
                    <div className="text-xl font-extrabold text-white">
                      {formatPoishaToTaka(estimate.pooledFare.finalFarePoisha)}
                    </div>
                  </div>

                  {/* Vehicle Fleet Preview */}
                  <div className="flex items-center gap-2.5 pt-2 border-t border-slate-800/60 bg-slate-950/60 -mx-4 -mb-4 px-4 py-2.5 rounded-b-xl">
                    <div className="relative h-8 w-12 rounded overflow-hidden border border-slate-700 shrink-0">
                      <Image
                        src="/images/dhaka-tesla-bullet.jpg"
                        alt="Bullet"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="text-[11px] leading-tight">
                      <span className="font-bold text-white">Tesla &ldquo;Bullet&rdquo;</span>
                      <span className="text-slate-400"> (3 Seats) • Jashim</span>
                      <div className="text-[10px] text-cyan-400 font-semibold">Active Banani Fleet</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleRequestRide}
                disabled={loadingAction || !estimate}
                className="w-full rounded-xl bg-cyan-500 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-400 transition shadow-lg shadow-cyan-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loadingAction ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Request Shared Tesla Ride</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Active Ride & History Overview (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Ride Card */}
          {activeRide ? (
            <div className="rounded-2xl border border-cyan-500/40 bg-slate-900/80 p-6 backdrop-blur shadow-xl shadow-cyan-950/20">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
                    <Car className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Active Trip</h3>
                    <span className="text-xs text-slate-400">
                      ID: #{activeRide.id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchRides}
                    title="Refresh status"
                    className="p-1.5 text-slate-400 hover:text-white transition rounded-lg hover:bg-slate-800"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <span className="rounded-full bg-cyan-500/20 border border-cyan-500/40 px-3 py-1 text-xs font-bold text-cyan-300">
                    {activeRide.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* Progress Timeline */}
              <div className="my-6">
                <RideTimeline status={activeRide.status} />
              </div>

              {/* Route & Pool Details */}
              <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-950/60 p-4 border border-slate-800/80 text-xs">
                <div>
                  <div className="text-slate-400 mb-0.5">Route Corridor</div>
                  <div className="font-semibold text-white">
                    {activeRide.pickupArea} → {activeRide.destinationArea}
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    {activeRide.seatsRequested} seat(s) requested
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 mb-0.5">Individual Fare</div>
                  <div className="font-bold text-cyan-400 text-sm">
                    {formatPoishaToTaka(
                      activeRide.fare?.finalFarePoisha || activeRide.estimatedFarePoisha
                    )}
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Vehicle:{" "}
                    {activeRide.poolMember?.pool?.vehicle?.name || "Assigning..."}
                  </div>
                </div>
              </div>

              {/* Cancellation Option */}
              {activeRide.status === "REQUESTED" || activeRide.status === "MATCHED" ? (
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleCancelRide(activeRide.id)}
                    disabled={loadingAction}
                    className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 hover:underline transition"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Cancel Ride Request</span>
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center backdrop-blur">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-400 mb-3">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white">No Active Ride</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Select your pickup and destination in the left panel to match with a Dhaka Tesla Pool.
              </p>
            </div>
          )}

          {/* Recent Rides Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-base">Recent Rides</h3>
              <Link
                href="/passenger/history"
                className="text-xs font-semibold text-cyan-400 hover:underline"
              >
                View All History →
              </Link>
            </div>

            {rides.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                No past rides found.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Route</th>
                      <th className="pb-2">Seats</th>
                      <th className="pb-2">Fare</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {rides.slice(0, 4).map((r) => (
                      <tr key={r.id} className="text-slate-300">
                        <td className="py-2.5 text-slate-500">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 font-medium text-white">
                          {r.pickupArea} → {r.destinationArea}
                        </td>
                        <td className="py-2.5">{r.seatsRequested}</td>
                        <td className="py-2.5 font-semibold text-cyan-400">
                          {formatPoishaToTaka(
                            r.fare?.finalFarePoisha || r.estimatedFarePoisha
                          )}
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
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
      </div>
    </div>
  );
}
