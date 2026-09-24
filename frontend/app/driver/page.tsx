"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Car,
  Users,
  Zap,
  Power,
  RefreshCw,
  Navigation,
  Flag,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "../../lib/auth-context";
import { apiRequest } from "../../lib/api";
import { formatPoishaToTaka } from "../../lib/utils";
import { SeatMeter } from "../../components/SeatMeter";

export default function DriverDashboard() {
  const { user, login } = useAuth();

  const [vehicle, setVehicle] = useState<any>(null);
  const [currentPool, setCurrentPool] = useState<any>(null);
  const [availableRequests, setAvailableRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchDriverData = useCallback(async () => {
    if (!user || user.role !== "DRIVER") {
      setLoading(false);
      return;
    }

    try {
      const [vehicleRes, poolRes, requestsRes] = await Promise.all([
        apiRequest("/driver/vehicle"),
        apiRequest("/driver/pool/current"),
        apiRequest("/driver/requests"),
      ]);

      if (vehicleRes.success) setVehicle(vehicleRes.data?.vehicle);
      if (poolRes.success) setCurrentPool(poolRes.data?.pool);
      if (requestsRes.success) setAvailableRequests(requestsRes.data?.requests || []);
    } catch (err) {
      console.error("Error fetching driver dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDriverData();
    // Poll every 4 seconds for real-time pool updates
    const interval = setInterval(fetchDriverData, 4000);
    return () => clearInterval(interval);
  }, [fetchDriverData]);

  const handleToggleOnline = async () => {
    if (!vehicle) return;
    setActionLoading(true);
    const newStatus = !vehicle.isOnline;
    const res = await apiRequest("/driver/online", {
      method: "PATCH",
      body: JSON.stringify({ isOnline: newStatus }),
    });

    if (res.success && res.data?.vehicle) {
      setVehicle(res.data.vehicle);
      setMessage({
        type: "success",
        text: `Status updated: You are now ${newStatus ? "ONLINE" : "OFFLINE"}.`,
      });
      fetchDriverData();
    }
    setActionLoading(false);
  };

  const handleAcceptRequest = async (rideId: string) => {
    setActionLoading(true);
    setMessage(null);
    const res = await apiRequest(`/driver/rides/${rideId}/accept`, {
      method: "POST",
    });

    if (res.success) {
      setMessage({
        type: "success",
        text: "Ride accepted and pooled into your Tesla successfully!",
      });
      fetchDriverData();
    } else {
      setMessage({
        type: "error",
        text: res.error?.message || "Could not accept ride into pool",
      });
    }
    setActionLoading(false);
  };

  const handleAdvancePool = async (status: string) => {
    setActionLoading(true);
    setMessage(null);
    const res = await apiRequest("/driver/pool/advance", {
      method: "POST",
      body: JSON.stringify({
        status,
        paymentMethod: status === "COMPLETED" ? "TESLA_PAY" : undefined,
      }),
    });

    if (res.success) {
      setMessage({
        type: "success",
        text: `Trip status advanced to ${status.replace("_", " ")}!`,
      });
      fetchDriverData();
    } else {
      setMessage({
        type: "error",
        text: res.error?.message || "Failed to update trip status",
      });
    }
    setActionLoading(false);
  };

  const handleSwitchToJashim = async () => {
    setLoading(true);
    await login("jashim@tesla.dhaka", "Password123!");
    fetchDriverData();
  };

  if (!user || user.role !== "DRIVER") {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur shadow-2xl">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-950/40 text-amber-400 mb-4 border border-amber-800/40">
            <Car className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Driver Cockpit Access</h2>
          <p className="text-xs text-slate-300 mb-6 leading-relaxed">
            {user ? (
              <>
                You are currently signed in as Passenger <strong className="text-cyan-400">{user.name}</strong> ({user.email}).
                The driver cockpit is reserved for <strong className="text-amber-400">Jashim</strong> to operate vehicle <strong className="text-white">&ldquo;Bullet&rdquo;</strong> (Capacity: 3 seats).
              </>
            ) : (
              <>
                Sign in as driver <strong className="text-amber-400">Jashim</strong> to operate vehicle <strong className="text-white">&ldquo;Bullet&rdquo;</strong> (Capacity: 3 seats) and manage passenger pooling across the Banani corridor.
              </>
            )}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleSwitchToJashim}
              className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-3 text-xs font-bold text-slate-950 hover:from-amber-300 hover:to-amber-400 transition shadow-lg shadow-amber-500/20"
            >
              1-Click Switch to Jashim (Driver)
            </button>
            <Link
              href="/passenger"
              className="w-full sm:w-auto rounded-xl border border-slate-800 bg-slate-900 px-5 py-3 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Back to Passenger Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Determine which pool advance action is appropriate
  const poolMembers = currentPool?.members || [];
  const hasMatchedRiders = poolMembers.some(
    (m: any) => m.rideRequest.status === "MATCHED"
  );
  const hasArrivedRiders = poolMembers.some(
    (m: any) => m.rideRequest.status === "DRIVER_ARRIVED"
  );
  const hasStartedRiders = poolMembers.some(
    (m: any) => m.rideRequest.status === "STARTED"
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Car className="h-7 w-7 text-cyan-400" />
            <span>Driver Cockpit — {user.name}</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Vehicle: <span className="font-semibold text-white">{vehicle?.name || "Bullet"}</span> •
            Seat Capacity: <span className="font-semibold text-white">{vehicle?.capacity || 3}</span>
          </p>
        </div>

        {/* Online Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleToggleOnline}
            disabled={actionLoading}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition shadow-lg ${
              vehicle?.isOnline
                ? "bg-emerald-500 text-slate-950 shadow-emerald-500/20 hover:bg-emerald-400"
                : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-white"
            }`}
          >
            <Power className="h-4 w-4" />
            <span>{vehicle?.isOnline ? "ONLINE • ACCEPTING" : "OFFLINE"}</span>
          </button>

          <button
            onClick={fetchDriverData}
            title="Refresh"
            className="p-2 text-slate-400 hover:text-white rounded-lg border border-slate-800 bg-slate-900 transition"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`mb-6 flex items-center gap-2.5 rounded-xl border p-3.5 text-xs ${
            message.type === "success"
              ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-300"
              : "border-rose-500/40 bg-rose-950/30 text-rose-300"
          }`}
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Grid: Current Pool vs Available Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Current Active Pool (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="h-4 w-4 text-cyan-400" />
                  <span>Current Vehicle Pool</span>
                </h2>
                <div className="text-xs text-slate-400 mt-0.5">
                  Status:{" "}
                  <span className="font-bold text-cyan-400">
                    {currentPool ? currentPool.status : "NO ACTIVE POOL"}
                  </span>
                </div>
              </div>

              {currentPool && (
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    currentPool.status === "FULL"
                      ? "bg-amber-950 text-amber-300 border border-amber-800"
                      : "bg-cyan-950 text-cyan-300 border border-cyan-800"
                  }`}
                >
                  {currentPool.status}
                </span>
              )}
            </div>

            {/* Vehicle Card & Seat Meter */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/80 p-4 space-y-4">
              <div className="flex items-center gap-3.5 border-b border-slate-800/80 pb-3">
                <div className="relative h-14 w-24 rounded-lg overflow-hidden border border-slate-700/80 shrink-0 shadow-md">
                  <Image
                    src="/images/dhaka-tesla-bullet.jpg"
                    alt="Tesla Bullet"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Tesla Model 3 &ldquo;Bullet&rdquo;</span>
                    <span className="rounded bg-red-500/20 border border-red-500/30 px-1.5 py-0.5 text-[9px] font-bold text-red-400">
                      3 SEATS
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Assigned Driver: <strong>{user?.name || "Jashim"}</strong> • Banani Road 11 Hub
                  </p>
                </div>
              </div>

              <SeatMeter
                occupied={currentPool?.occupiedSeats || 0}
                capacity={vehicle?.capacity || 3}
              />
            </div>

            {/* Passenger Roster */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Pooled Passengers ({poolMembers.length})
              </h3>

              {poolMembers.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 rounded-xl border border-dashed border-slate-800">
                  No passengers currently in this pool. Available requests will appear on the right.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {poolMembers.map((member: any) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-950 text-cyan-400 font-bold border border-cyan-800/50">
                          {member.passenger.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">
                            {member.passenger.name}
                          </div>
                          <div className="text-slate-400 text-[11px]">
                            {member.rideRequest.pickupArea} → {member.rideRequest.destinationArea}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-extrabold text-cyan-400 text-sm">
                          {formatPoishaToTaka(member.farePoisha)}
                        </div>
                        <div className="text-[10px] font-semibold text-slate-400">
                          {member.seats} seat(s) •{" "}
                          <span className="text-cyan-300">
                            {member.rideRequest.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stepped Lifecycle Action Controls */}
            {poolMembers.length > 0 && (
              <div className="border-t border-slate-800 pt-5 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Pool Lifecycle Controls
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAdvancePool("DRIVER_ARRIVED")}
                    disabled={actionLoading || !hasMatchedRiders}
                    className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition ${
                      hasMatchedRiders
                        ? "bg-sky-500 text-slate-950 hover:bg-sky-400 shadow-md shadow-sky-500/20"
                        : "bg-slate-800/50 text-slate-600 cursor-not-allowed"
                    }`}
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    <span>Mark Arrived</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAdvancePool("STARTED")}
                    disabled={actionLoading || !hasArrivedRiders}
                    className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition ${
                      hasArrivedRiders
                        ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20"
                        : "bg-slate-800/50 text-slate-600 cursor-not-allowed"
                    }`}
                  >
                    <Car className="h-3.5 w-3.5" />
                    <span>Start Pool Trip</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAdvancePool("COMPLETED")}
                    disabled={actionLoading || !hasStartedRiders}
                    className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition ${
                      hasStartedRiders
                        ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20"
                        : "bg-slate-800/50 text-slate-600 cursor-not-allowed"
                    }`}
                  >
                    <Flag className="h-3.5 w-3.5" />
                    <span>Complete Trip</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Available Unassigned Requests (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-cyan-400" />
                <span>Available Requests</span>
              </h2>
              <span className="text-xs text-slate-400">
                {availableRequests.length} waiting
              </span>
            </div>

            {availableRequests.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No matching unassigned ride requests right now.
              </div>
            ) : (
              <div className="space-y-3">
                {availableRequests.map((req) => (
                  <div
                    key={req.id}
                    className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-white text-sm">
                        {req.passenger.name}
                      </div>
                      <span className="font-bold text-cyan-400 text-xs">
                        {formatPoishaToTaka(
                          req.fare?.finalFarePoisha || req.estimatedFarePoisha
                        )}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400">
                      📍 {req.pickupArea} → 🎯 {req.destinationArea}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500">
                        {req.seatsRequested} seat(s) requested
                      </span>

                      <button
                        type="button"
                        onClick={() => handleAcceptRequest(req.id)}
                        disabled={
                          actionLoading ||
                          (currentPool && currentPool.availableSeats < req.seatsRequested)
                        }
                        className="rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition shadow-sm shadow-cyan-500/20 disabled:opacity-40"
                      >
                        Accept into Pool
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
