import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import { prisma } from "../../config/database.js";
import { env } from "../../config/env.js";
import { AppError } from "../../middleware/errorHandler.js";
import { RegisterInput, LoginInput } from "./auth.validation.js";

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
}

export class AuthService {
  static generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: "7d",
    });
  }

  static verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    } catch {
      throw new AppError("Invalid or expired token", 401, "UNAUTHORIZED");
    }
  }

  static async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existing) {
      throw new AppError("Email already registered", 409, "EMAIL_EXISTS");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash,
        role: input.role,
        ...(input.role === UserRole.DRIVER
          ? {
              vehicle: {
                create: {
                  name: input.vehicleName || "Bullet",
                  capacity: input.vehicleCapacity || 3,
                  isOnline: true,
                },
              },
            }
          : {}),
      },
      include: {
        vehicle: true,
      },
    });

    const token = this.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        vehicle: user.vehicle,
      },
      token,
    };
  }

  static async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
      include: { vehicle: true },
    });

    if (!user) {
      throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
    }

    const token = this.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        vehicle: user.vehicle,
      },
      token,
    };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { vehicle: true },
    });

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      vehicle: user.vehicle,
    };
  }
}
