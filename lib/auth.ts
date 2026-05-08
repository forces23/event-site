import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { username, admin } from "better-auth/plugins";
import { MongoClient } from "mongodb";
declare global {
  // eslint-disable-next-line no-var
  var _betterAuthClient: MongoClient | undefined;
}

function getMongoClient(): MongoClient {
  if (!global._betterAuthClient) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is not defined");
    global._betterAuthClient = new MongoClient(uri);
  }
  return global._betterAuthClient;
}

const extraOrigins = process.env.BETTER_AUTH_TRUSTED_ORIGINS
  ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(",")
  : [];

export const auth = betterAuth({
  database: mongodbAdapter(getMongoClient().db()),
  secret: process.env.BETTER_AUTH_SECRET ?? "dev-secret-quince-2026-change-in-prod",
  emailAndPassword: { enabled: true },
  trustedOrigins: [
    "http://localhost:3000",
    "http://192.168.1.114:3000",
    ...extraOrigins,
  ],
  plugins: [username(), admin()],
});
