"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

const getServerSession = async () => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    return session;
  } catch (err) {
    console.error("Failed to fetch server session:", err);
    return null;
  }
};

export { getServerSession };
