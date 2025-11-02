import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as authSchema from "@/db/schema/auth";
import { env } from "@/lib/env";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
    usePlural: true,
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        input: false,
        defaultValue: "user",
      },
    },
  },
  socialProviders: {
    google: {
      // prompt: "select_account",
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  session: {
    // expiresIn: 60 * 60 * 24 * 7,
    // updateAge: 60 * 60 * 24,
    // cookieCache: { enabled: false },
    expiresIn: 60 * 60 * 24 * 365,
    updateAge: 60 * 60 * 24 * 7,
  },
  rateLimit: {
    window: 60,
    max: 10,
  },
  plugins: [nextCookies()],
});
