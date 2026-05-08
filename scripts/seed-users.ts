/**
 * Run: npm run seed
 * Creates 1 admin + 1 regular user in MongoDB via Better Auth.
 * Update the credentials below before running, then REMOVE them or use env vars.
 *
 * Roles: "admin" (full access) | "user" (view-only dashboard)
 */

import path from "path";
import { MongoClient, ObjectId } from "mongodb";

try { process.loadEnvFile(path.resolve(process.cwd(), ".env.local")); } catch {}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌  MONGODB_URI not found in .env.local");
  process.exit(1);
}

// ─── CHANGE THESE BEFORE RUNNING ─────────────────────────────────────────────
const USERS = [
  {
    username: process.env.ADMIN_USERNAME ,
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    name: "Admin",
    role: "admin" as const,
  },
  {
    username: process.env.VIEWER_USERNAME,
    email: process.env.VIEWER_EMAIL,
    password: process.env.VIEWER_PASSWORD,
    name: "Viewer",
    role: "user" as const,   // Better Auth admin plugin uses "user" for non-admin roles
  },
];
// ─────────────────────────────────────────────────────────────────────────────

async function seed() {
  // Dynamic import so env is loaded before auth module initializes
  const { auth } = await import("../lib/auth");

  const client = new MongoClient(MONGODB_URI!);
  await client.connect();
  const db = client.db();

  console.log("🌱 Seeding Better Auth users...");

  for (const u of USERS) {
    try {
      // Create user via Better Auth's email sign-up (works with username plugin)
      const result = await auth.api.signUpEmail({
        body: { email: u.email!, password: u.password!, name: u.name },
        headers: new Headers(),
      });

      const userId = result?.user?.id;
      if (!userId) throw new Error(`No user ID returned for ${u.username}`);

      // Set username and role directly on the user doc.
      // signIn.username looks up by this username field, then finds the
      // credential account by userId — so signUpEmail + username update works.
      await db.collection("user").updateOne(
        { _id: new ObjectId(userId) },
        { $set: { username: u.username, displayUsername: u.username, role: u.role } }
      );

      console.log(`✅ Created: ${u.username} (${u.role})`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const isConflict =
        msg.toLowerCase().includes("exist") ||
        msg.toLowerCase().includes("already") ||
        msg.includes("409");

      if (isConflict) {
        console.log(`ℹ️  Already exists: ${u.username} — skipped`);
      } else {
        console.error(`❌ Failed for ${u.username}:`, err);
        throw err;
      }
    }
  }

  await client.close();
  console.log("🎉 Done. Remove passwords from this file after seeding.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
