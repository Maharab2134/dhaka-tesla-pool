import React from "react";
import { Users } from "lucide-react";

interface SeatMeterProps {
  occupied: number;
  capacity: number;
  showDetails?: boolean;
}

export function SeatMeter({
  occupied,
  capacity,
  showDetails = true,
}: SeatMeterProps) {
  const safeOccupied = Math.min(occupied, capacity);
  const seats = Array.from({ length: capacity }, (_, i) => i < safeOccupied);
  const percent = Math.round((safeOccupied / capacity) * 100);

  return (
    <div className="flex flex-col gap-1.5">
      {showDetails && (
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-slate-400 font-medium">
            <Users className="h-3.5 w-3.5 text-cyan-400" />
            <span>Seats Occupied</span>
          </span>
          <span className="font-semibold text-white">
            {safeOccupied} / {capacity} seats ({percent}%)
          </span>
        </div>
      )}

      <div className="flex items-center gap-1.5">
        {seats.map((isOccupied, idx) => (
          <div
            key={idx}
            className={`h-3 flex-1 rounded-full transition-all duration-300 ${
              isOccupied
                ? "bg-gradient-to-r from-cyan-500 to-sky-400 shadow-sm shadow-cyan-500/50"
                : "bg-slate-800 border border-slate-700/60"
            }`}
            title={isOccupied ? `Seat ${idx + 1}: Occupied` : `Seat ${idx + 1}: Available`}
          />
        ))}
      </div>
    </div>
  );
}
