import React from "react";
import { Check, Clock, Car, Navigation, Flag, XCircle } from "lucide-react";

interface RideTimelineProps {
  status: "REQUESTED" | "MATCHED" | "DRIVER_ARRIVED" | "STARTED" | "COMPLETED" | "CANCELLED";
}

const STEPS = [
  { key: "REQUESTED", label: "Requested", icon: Clock },
  { key: "MATCHED", label: "Driver Matched", icon: Car },
  { key: "DRIVER_ARRIVED", label: "Driver Arrived", icon: Navigation },
  { key: "STARTED", label: "Trip Started", icon: Navigation },
  { key: "COMPLETED", label: "Completed", icon: Flag },
];

export function RideTimeline({ status }: RideTimelineProps) {
  if (status === "CANCELLED") {
    return (
      <div className="rounded-xl border border-rose-900/60 bg-rose-950/20 p-4 text-center">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose-900/40 text-rose-400 mb-2">
          <XCircle className="h-6 w-6" />
        </div>
        <div className="text-sm font-semibold text-rose-400">Ride Cancelled</div>
        <p className="text-xs text-rose-300/70 mt-1">
          This ride request was cancelled. Vehicle seat reservation has been released.
        </p>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === status);

  return (
    <div className="relative py-2">
      <div className="flex items-center justify-between">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isFuture = idx > currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex flex-1 flex-col items-center relative">
              {/* Connector line */}
              {idx > 0 && (
                <div
                  className={`absolute top-4 -left-1/2 w-full h-0.5 -z-0 transition-colors duration-300 ${
                    idx <= currentIndex ? "bg-cyan-500" : "bg-slate-800"
                  }`}
                />
              )}

              {/* Step indicator circle */}
              <div
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition-all duration-300 ${
                  isDone
                    ? "border-cyan-500 bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                    : isCurrent
                    ? "border-cyan-400 bg-slate-950 text-cyan-400 shadow-md shadow-cyan-500/50 ring-4 ring-cyan-500/20 animate-pulse"
                    : "border-slate-800 bg-slate-900 text-slate-500"
                }`}
              >
                {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
              </div>

              {/* Step label */}
              <span
                className={`mt-2 text-[11px] text-center font-medium max-w-[70px] truncate leading-tight ${
                  isCurrent
                    ? "text-cyan-400 font-bold"
                    : isDone
                    ? "text-slate-200"
                    : "text-slate-500"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
