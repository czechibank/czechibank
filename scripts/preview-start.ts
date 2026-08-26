#!/usr/bin/env tsx
/**
 * Start command for Coolify PR previews.
 *
 * Every preview container gets the same DATABASE_URL from Coolify, so all PRs
 * would share one database that nobody creates or migrates. This script
 * derives a database name from the PR number (Coolify names the container
 * `<app-uuid>-pr-<n>`), creates the database if it is missing, runs
 * `prisma migrate deploy`, seeds, and then starts Next.js.
 *
 * Outside a preview (no `-pr-<n>` in COOLIFY_CONTAINER_NAME) it keeps the
 * DATABASE_URL untouched and only migrates and starts.
 */
import { PrismaClient } from "@prisma/client";
import { execSync, spawn } from "child_process";

function redact(url: string) {
  return url.replace(/\/\/.*@/, "//***:***@");
}

function previewDatabaseUrl(baseUrl: string): { url: string; dbName: string } | null {
  const match = /-pr-(\d+)$/.exec(process.env.COOLIFY_CONTAINER_NAME ?? "");
  if (!match) return null;
  const dbName = `pr_${match[1]}`;
  const url = new URL(baseUrl);
  url.pathname = `/${dbName}`;
  return { url: url.toString(), dbName };
}

async function ensureDatabase(baseUrl: string, dbName: string) {
  const maintenance = new URL(baseUrl);
  maintenance.pathname = "/postgres";
  const prisma = new PrismaClient({ datasources: { db: { url: maintenance.toString() } } });
  try {
    const rows = await prisma.$queryRaw<
      { datname: string }[]
    >`SELECT datname FROM pg_database WHERE datname = ${dbName}`;
    if (rows.length === 0) {
      console.log(`[preview] creating database ${dbName}`);
      await prisma.$executeRawUnsafe(`CREATE DATABASE "${dbName}"`);
    } else {
      console.log(`[preview] database ${dbName} already exists`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const baseUrl = process.env.DATABASE_URL;
  if (!baseUrl) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const preview = previewDatabaseUrl(baseUrl);
  if (preview) {
    await ensureDatabase(baseUrl, preview.dbName);
    process.env.DATABASE_URL = preview.url;
  }
  console.log("[preview] DATABASE_URL:", redact(process.env.DATABASE_URL!));

  execSync("npx prisma migrate deploy", { stdio: "inherit", env: process.env });
  execSync("pnpm db:seed:features && pnpm db:seed:users", { stdio: "inherit", env: process.env });

  const server = spawn("pnpm", ["start"], { stdio: "inherit", env: process.env });
  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.on(signal, () => server.kill(signal));
  }
  server.on("exit", (code) => process.exit(code ?? 0));
}

main().catch((error) => {
  console.error("[preview] start failed:", error);
  process.exit(1);
});
