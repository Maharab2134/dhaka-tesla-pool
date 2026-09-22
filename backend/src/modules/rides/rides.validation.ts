import { z } from "zod";
import { isValidDhakaArea } from "../../config/dhaka-geography.js";

export const estimateFareSchema = z
  .object({
    pickupArea: z
      .string()
      .refine(isValidDhakaArea, { message: "Invalid pickup area in Dhaka" }),
    destinationArea: z
      .string()
      .refine(isValidDhakaArea, { message: "Invalid destination area in Dhaka" }),
    seatsRequested: z.number().int().min(1).max(3).default(1),
  })
  .refine((data) => data.pickupArea !== data.destinationArea, {
    message: "Pickup and destination areas cannot be the same",
    path: ["destinationArea"],
  });

export const createRideRequestSchema = z
  .object({
    pickupArea: z
      .string()
      .refine(isValidDhakaArea, { message: "Invalid pickup area in Dhaka" }),
    destinationArea: z
      .string()
      .refine(isValidDhakaArea, { message: "Invalid destination area in Dhaka" }),
    seatsRequested: z.number().int().min(1).max(3).default(1),
  })
  .refine((data) => data.pickupArea !== data.destinationArea, {
    message: "Pickup and destination areas cannot be the same",
    path: ["destinationArea"],
  });

export type EstimateFareInput = z.infer<typeof estimateFareSchema>;
export type CreateRideRequestInput = z.infer<typeof createRideRequestSchema>;
