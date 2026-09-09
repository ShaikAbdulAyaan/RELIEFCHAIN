
import { prisma } from "./database";

async function testDatabase() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    console.log("✅ Database connection successful!");
    console.log("✅ RELIEFCHAIN PostgreSQL is connected.");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();