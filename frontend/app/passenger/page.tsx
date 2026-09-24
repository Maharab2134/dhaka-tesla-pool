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
  Lock,
  User,
  CheckCircle2,
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

const PASSENGER_PERSONAS = [
  {
    name: "Nusrat",
    email: "nusrat@tesla.dhaka",
    pickup: "Banani",
    destination: "Mohakhali",
    badge: "1st Pool Member",
  },
  {
    name: "Rafiq",
    email: "rafiq@tesla.dhaka",
    pickup: "Banani",
    destination: "Gulshan 1",
    badge: "2nd Pool Member",
  },
  {
    name: "Shirin",
    email: "shirin@tesla.dhaka",
    pickup: "Banani",
    destination: "Mohakhali",
    badge: "3rd Seat (Capacity Full)",
  },
];

export default function PassengerDashboard() {
  const { user, login } = useAuth();

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
    if (!user || user.role !== "PASSENGER") {
      setActiveRide(null);
      setRides([]);
      return;
    }
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
    const interval = setInterval(fetchRides, 3500);
    return () => clearInterval(interval);
  }, [fetchRides]);

  // Handle switching between passenger personas
  const handleQuickPassengerSwitch = async (email: string, defaultPickup: string, defaultDest: string) => {
    setLoadingAction(true);
    setMessage(null);
    await login(email, "Password123!");
    setPickupArea(defaultPickup);
    setDestinationArea(defaultDest);
    setLoadingAction(false);
  };

  const handleRequestRide = async () => {
    if (!user) {
      setMessage({ type: "error", text: "Please sign in as a passenger first" });
      return;
    }

    if (activeRide) {
      setMessage({
        type: "error",
        text: "You already have an active ride request! A passenger cannot hold multiple simultaneous bookings.",
      });
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
        text: "Ride requested successfully! Auto-matched into Tesla Bullet pool.",
      });
      fetchRides();
    } else {
      setMessage({
        type: "error",
        text: res.error?.message || "Failed to request ride.",
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
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 lg:px-8">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Zap className="h-7 w-7 text-cyan-400 fill-current" />
            <span>Passenger Dashboard</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Electric Ride-Pooling Corridor • Banani Road 11 ➔ Mohakhali & Gulshan
          </p>
        </div>

        {/* Current User Role Pill */}
        {user ? (
          <div className="flex items-center gap-2.5 rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 py-2 shadow-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 to-sky-400 text-slate-950 font-black text-xs">
              {user.name.charAt(0)}
            </div>
            <div className="leading-tight">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{user.name}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
                    user.role === "PASSENGER"
                      ? "bg-sky-500/20 text-sky-300"
                      : "bg-amber-500/20 text-amber-300"
                  }`}
                >
                  {user.role}
                </span>
              </div>
              <div className="text-[10px] text-slate-400">{user.email}</div>
            </div>
          </div>
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition shadow-md shadow-cyan-500/20"
          >
            <span>Sign In to Book</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* Role Notice If Logged in as Driver */}
      {user && user.role === "DRIVER" && (
        <div className="mb-6 rounded-2xl border border-amber-500/40 bg-amber-950/30 p-4 backdrop-blur">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                <Car className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Driver Account Detected (Jashim)
                </h3>
                <p className="text-xs text-slate-300">
                  Drivers operate vehicle &ldquo;Bullet&rdquo; and cannot book passenger seats. Switch to a passenger persona below to test pooling:
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {PASSENGER_PERSONAS.map((p) => (
                <button
                  key={p.email}
                  type="button"
                  onClick={() => handleQuickPassengerSwitch(p.email, p.pickup, p.destination)}
                  className="rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-xs font-semibold text-white hover:border-cyan-400 hover:text-cyan-400 transition"
                >
                  Switch to {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 1-Click Passenger Persona Selector Bar */}
      <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 backdrop-blur">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-bold text-white">Switch Passenger Persona:</span>
            <span className="text-[11px] text-slate-400 hidden md:inline">
              (Test multi-passenger pooling step-by-step)
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {PASSENGER_PERSONAS.map((p) => {
              const isSelected = user?.email === p.email;
              return (
                <button
                  key={p.email}
                  type="button"
                  onClick={() => handleQuickPassengerSwitch(p.email, p.pickup, p.destination)}
                  disabled={loadingAction}
                  className={`flex items-center justify-between gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    isSelected
                      ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                      : "bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-cyan-500/40 hover:text-white"
                  }`}
                >
                  <span>{p.name}</span>
                  {isSelected && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Alert / Notification Card */}
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Request Form OR Locked Active State */}
        <div className="lg:col-span-5 space-y-6">
          {activeRide ? (
            /* LOCKED STATE: User already has an active ride (No multiple simultaneous requests!) */
            <div className="rounded-2xl border border-cyan-500/40 bg-slate-900/80 p-6 backdrop-blur shadow-xl shadow-cyan-950/30">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    Active Booking in Progress
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    A passenger can only hold 1 active ride at a time.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2.5 text-xs mb-4">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Passenger:</span>
                  <span className="font-bold text-white">{user?.name}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Route:</span>
                  <span className="font-semibold text-cyan-300">
                    {activeRide.pickupArea} ➔ {activeRide.destinationArea}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Seats Booked:</span>
                  <span className="font-bold text-white">{activeRide.seatsRequested} Seat</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-extrabold text-amber-400 uppercase">
                    {activeRide.status.replace("_", " ")}
                  </span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Individual Fare:</span>
                  <span className="text-sm font-extrabold text-white">
                    {formatPoishaToTaka(
                      activeRide.fare?.finalFarePoisha || activeRide.estimatedFarePoisha
                    )}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-3 text-[11px] text-slate-300 leading-relaxed mb-4">
                💡 <strong>Single Concurrent Request Policy:</strong> To request a ride for another passenger or a new trip, wait until this trip completes or cancel your current request.
              </div>

              {activeRide.status === "REQUESTED" || activeRide.status === "MATCHED" ? (
                <button
                  type="button"
                  onClick={() => handleCancelRide(activeRide.id)}
                  disabled={loadingAction}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-950/30 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-900/40 transition"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Cancel Current Ride Request</span>
                </button>
              ) : (
                <div className="text-center text-[11px] text-slate-400 font-medium">
                  Trip is in progress with Driver Jashim. Cannot be cancelled.
                </div>
              )}
            </div>
          ) : (
            /* BOOKING FORM: Only visible when passenger has NO active ride */
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-cyan-400" />
                <span>Book a Shared Seat</span>
              </h2>

              <div className="space-y-4">
                {/* Pickup Area */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Pickup Location (Dhaka)
                  </label>
                  <select
                    value={pickupArea}
                    onChange={(e) => setPickupArea(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
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
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
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
                    Seats Needed (Bullet Capacity: 3)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setSeatsRequested(num)}
                        className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition ${
                          seatsRequested === num
                            ? "border-cyan-500 bg-cyan-950/50 text-cyan-300 font-bold"
                            : "border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white"
                        }`}
                      >
                        <Users className="h-3.5 w-3.5" />
                        <span>{num} {num === 1 ? "Seat" : "Seats"}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic Fare Breakdown */}
                {estimate && (
                  <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>Corridor Distance</span>
                      <span className="font-semibold text-white">~{estimate.distanceKm} km</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>Standard Solo Fare</span>
                      <span className="line-through text-slate-400">
                        {formatPoishaToTaka(estimate.soloFare.finalFarePoisha)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                      <span>Tesla Pool Discount (25%)</span>
                      <span>-{formatPoishaToTaka(estimate.pooledFare.poolDiscountPoisha)}</span>
                    </div>
                    <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-slate-400">Your Pooled Fare</div>
                        <div className="text-[10px] text-cyan-400 font-medium">
                          Exact integer poisha precision
                        </div>
                      </div>
                      <div className="text-xl font-extrabold text-white">
                        {formatPoishaToTaka(estimate.pooledFare.finalFarePoisha)}
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
                      <span>Matching Compatible Pool...</span>
                    </>
                  ) : (
                    <>
                      <span>Request Pool Seat in Bullet</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (7 cols): Live Timeline & Pool State */}
        <div className="lg:col-span-7 space-y-6">
          {activeRide ? (
            <div className="rounded-2xl border border-cyan-500/40 bg-slate-900/80 p-6 backdrop-blur shadow-xl shadow-cyan-950/20">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
                    <Car className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Live Ride Tracking</h3>
                    <span className="text-xs text-slate-400">
                      Trip ID: #{activeRide.id.slice(-6).toUpperCase()}
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

              {/* Progress Timeline Component */}
              <div className="my-6">
                <RideTimeline status={activeRide.status} />
              </div>

              {/* Vehicle & Assigned Driver Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-slate-950/70 p-4 border border-slate-800/80 text-xs">
                <div>
                  <div className="text-slate-400 mb-0.5">Assigned Vehicle</div>
                  <div className="font-bold text-white text-sm">
                    {activeRide.poolMember?.pool?.vehicle?.name || "Tesla &ldquo;Bullet&rdquo;"}
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Driver: {activeRide.poolMember?.pool?.vehicle?.driver?.name || "Jashim"}
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 mb-0.5">Route & Seats</div>
                  <div className="font-semibold text-white">
                    {activeRide.pickupArea} ➔ {activeRide.destinationArea}
                  </div>
                  <div className="text-cyan-400 text-[11px] mt-0.5 font-bold">
                    Pooled Fare:{" "}
                    {formatPoishaToTaka(
                      activeRide.fare?.finalFarePoisha || activeRide.estimatedFarePoisha
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center backdrop-blur">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-400 mb-3">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white">No Active Trip</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Select your pickup and destination in the left panel to match with Jashim&apos;s 3-seat Tesla Bullet.
              </p>
            </div>
          )}

          {/* Recent Rides Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-base">Your Trip History</h3>
              <Link
                href="/passenger/history"
                className="text-xs font-semibold text-cyan-400 hover:underline"
              >
                View Full Ledger →
              </Link>
            </div>

            {rides.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                No past rides recorded for this passenger account.
              </div>
            ) : (
              <div className="space-y-2.5">
                {rides.slice(0, 4).map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">
                        {r.pickupArea} → {r.destinationArea}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(r.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        • {r.seatsRequested} seat
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-white">
                        {formatPoishaToTaka(r.fare?.finalFarePoisha || r.estimatedFarePoisha)}
                      </div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          r.status === "COMPLETED"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : r.status === "CANCELLED"
                            ? "bg-rose-500/20 text-rose-300"
                            : "bg-cyan-500/20 text-cyan-300"
                        }`}
                      >
                        {r.status}
                      </span>
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
