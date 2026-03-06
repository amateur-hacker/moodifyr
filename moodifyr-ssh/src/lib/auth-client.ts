import { createAuthClient } from "better-auth/react";
import { env } from "@/lib/env";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BASE_URL,
  user: {
    additionalFields: {
      role: {
        type: "string",
        input: true,
        defaultValue: "user",
      },
    },
  },
});
