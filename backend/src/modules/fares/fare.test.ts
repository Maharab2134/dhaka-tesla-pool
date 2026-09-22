import { describe, it, expect } from "vitest";
import { FareService } from "./fare.service.js";
import { getDhakaArea } from "../../config/dhaka-geography.js";

describe("FareService Unit Tests", () => {
  it("should calculate unpooled fare accurately in integer poisha", () => {
    // 4.0 km trip, unpooled, 1 seat
    // Base: 6000 poisha (৳60)
    // Distance charge: 4.0 * 2000 = 8000 poisha (৳80)
    // Discount: 0
    // Total: 14000 poisha (৳140)
    const result = FareService.calculateFare(4.0, false, 1);

    expect(result.baseFarePoisha).toBe(6000);
    expect(result.distanceChargePoisha).toBe(8000);
    expect(result.poolDiscountPoisha).toBe(0);
    expect(result.finalFarePoisha).toBe(14000);
    expect(result.isPooled).toBe(false);
    expect(result.seats).toBe(1);
  });

  it("should apply 25% pool discount for pooled trips", () => {
    // 4.0 km trip, pooled, 1 seat
    // Base: 6000, Distance: 8000 -> Subtotal: 14000
    // Discount: 25% of 14000 = 3500 poisha (৳35)
    // Total: 14000 - 3500 = 10500 poisha (৳105)
    const result = FareService.calculateFare(4.0, true, 1);

    expect(result.baseFarePoisha).toBe(6000);
    expect(result.distanceChargePoisha).toBe(8000);
    expect(result.poolDiscountPoisha).toBe(3500);
    expect(result.finalFarePoisha).toBe(10500);
    expect(result.isPooled).toBe(true);
  });

  it("should proportionally calculate fare for multiple requested seats", () => {
    // 2 seats pooled
    const single = FareService.calculateFare(4.0, true, 1);
    const double = FareService.calculateFare(4.0, true, 2);

    expect(double.finalFarePoisha).toBe(single.finalFarePoisha * 2);
    expect(double.baseFarePoisha).toBe(single.baseFarePoisha * 2);
    expect(double.distanceChargePoisha).toBe(single.distanceChargePoisha * 2);
    expect(double.poolDiscountPoisha).toBe(single.poolDiscountPoisha * 2);
    expect(double.seats).toBe(2);
  });

  it("should calculate realistic fares between Banani and Mohakhali", () => {
    const banani = getDhakaArea("Banani")!;
    const mohakhali = getDhakaArea("Mohakhali")!;

    const result = FareService.calculateFareBetweenAreas(banani, mohakhali, true, 1);

    expect(result.distanceKm).toBeGreaterThan(1.0);
    expect(result.finalFarePoisha).toBeGreaterThan(5000); // > ৳50
    expect(result.finalFarePoisha).toBeLessThan(20000); // < ৳200
  });
});
