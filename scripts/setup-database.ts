#!/usr/bin/env tsx

import { execSync } from "child_process";

async function setupDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("DATABASE_URL environment variable is required");
    process.exit(1);
  }

  console.log("Setting up database...");
  console.log("Database URL:", databaseUrl.replace(/\/\/.*@/, "//***:***@")); // Hide credentials

  try {
    // Generate Prisma client
    console.log("Generating Prisma client...");
    execSync("npx prisma generate", { stdio: "inherit" });

    // Run migrations
    console.log("Running migrations...");
    execSync("npx prisma migrate deploy", { stdio: "inherit" });

    // Optional: Run seed if it exists
    try {
      console.log("Running seed...");
      execSync("npx prisma db seed", { stdio: "inherit" });
    } catch (error) {
      console.log("No seed script found or seed failed, continuing...");
    }

    console.log("Database setup completed successfully!");
  } catch (error) {
    console.error("Database setup failed:", error);
    process.exit(1);
  }
}

setupDatabase();
