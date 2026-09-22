import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Dhaka Tesla Pool database...");

  // Hash demo password
  const defaultPassword = "Password123!";
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  // 1. Clean existing records in dependency order
  await prisma.payment.deleteMany();
  await prisma.fare.deleteMany();
  await prisma.rideStatusHistory.deleteMany();
  await prisma.poolMember.deleteMany();
  await prisma.pool.deleteMany();
  await prisma.rideRequest.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleaned existing records");

  // 2. Seed Driver: Jashim with vehicle "Bullet"
  const driverJashim = await prisma.user.create({
    data: {
      name: "Jashim",
      email: "jashim@tesla.dhaka",
      passwordHash,
      role: UserRole.DRIVER,
      vehicle: {
        create: {
          name: "Bullet",
          capacity: 3,
          isOnline: true,
        },
      },
    },
    include: {
      vehicle: true,
    },
  });

  console.log(
    `🚗 Created Driver: ${driverJashim.name} (${driverJashim.email}) with Vehicle: ${driverJashim.vehicle?.name} (Capacity: ${driverJashim.vehicle?.capacity})`
  );

  // 3. Seed Passengers: Nusrat, Rafiq, Shirin
  const passengersData = [
    { name: "Nusrat", email: "nusrat@tesla.dhaka" },
    { name: "Rafiq", email: "rafiq@tesla.dhaka" },
    { name: "Shirin", email: "shirin@tesla.dhaka" },
  ];

  for (const p of passengersData) {
    const passenger = await prisma.user.create({
      data: {
        name: p.name,
        email: p.email,
        passwordHash,
        role: UserRole.PASSENGER,
      },
    });
    console.log(`👤 Created Passenger: ${passenger.name} (${passenger.email})`);
  }

  console.log("✅ Database seeding completed successfully!");
  console.log("-----------------------------------------------------------------");
  console.log("Demo Credentials:");
  console.log("  Password for all accounts: Password123!");
  console.log("  Driver:    jashim@tesla.dhaka  (Vehicle: Bullet, Capacity: 3)");
  console.log("  Passenger: nusrat@tesla.dhaka");
  console.log("  Passenger: rafiq@tesla.dhaka");
  console.log("  Passenger: shirin@tesla.dhaka");
  console.log("-----------------------------------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
