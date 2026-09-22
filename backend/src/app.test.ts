import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "./app.js";

describe("GET /api/health", () => {
  it("should return 200 with service info and healthy status", async () => {
    const app = createApp();
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: expect.objectContaining({
        status: "healthy",
        service: "dhaka-tesla-pool-api",
        tagline: "Share a seat. Split the fare. Survive Dhaka traffic.",
      }),
    });
  });
});
