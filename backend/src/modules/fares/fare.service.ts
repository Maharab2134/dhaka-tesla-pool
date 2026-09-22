import { DhakaArea, calculateDistanceKm } from "../../config/dhaka-geography.js";

export interface FareCalculationResult {
  distanceKm: number;
  baseFarePoisha: number;
  distanceChargePoisha: number;
  poolDiscountPoisha: number;
  finalFarePoisha: number;
  isPooled: boolean;
  seats: number;
}

export class FareService {
  // Base fare: ৳60.00 (6000 poisha)
  public static readonly BASE_FARE_POISHA = 6000;

  // Rate per kilometer: ৳20.00 / km (2000 poisha)
  public static readonly RATE_PER_KM_POISHA = 2000;

  // Pool discount: 25% discount when sharing the ride
  public static readonly POOL_DISCOUNT_PERCENT = 25;

  /**
   * Calculates the fare for a trip based on distance, pool status, and seat count.
   * All currency values are returned in integer poisha to prevent floating point inaccuracies.
   */
  static calculateFare(
    distanceKm: number,
    isPooled: boolean = false,
    seats: number = 1
  ): FareCalculationResult {
    const validSeats = Math.max(1, Math.min(3, seats));
    const safeDistance = Math.max(0.5, distanceKm);

    // 1. Base fare
    const baseFarePoisha = this.BASE_FARE_POISHA;

    // 2. Distance charge = distance * rate_per_km
    const distanceChargePoisha = Math.round(safeDistance * this.RATE_PER_KM_POISHA);

    // 3. Subtotal before discount
    const subtotal = baseFarePoisha + distanceChargePoisha;

    // 4. Pool discount
    const poolDiscountPoisha = isPooled
      ? Math.round((subtotal * this.POOL_DISCOUNT_PERCENT) / 100)
      : 0;

    // 5. Final single passenger fare
    const singlePassengerFare = subtotal - poolDiscountPoisha;

    // 6. Total fare for requested seats
    const finalFarePoisha = singlePassengerFare * validSeats;

    return {
      distanceKm: safeDistance,
      baseFarePoisha: baseFarePoisha * validSeats,
      distanceChargePoisha: distanceChargePoisha * validSeats,
      poolDiscountPoisha: poolDiscountPoisha * validSeats,
      finalFarePoisha,
      isPooled,
      seats: validSeats,
    };
  }

  /**
   * Helper to calculate fare between two predefined Dhaka areas.
   */
  static calculateFareBetweenAreas(
    pickup: DhakaArea,
    destination: DhakaArea,
    isPooled: boolean = false,
    seats: number = 1
  ): FareCalculationResult {
    const distanceKm = calculateDistanceKm(pickup, destination);
    return this.calculateFare(distanceKm, isPooled, seats);
  }
}
