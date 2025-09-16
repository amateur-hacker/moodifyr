"use server";

import { headers } from "next/headers";
import { executeFn } from "@/db/utils";
import { auth } from "@/lib/auth";

const googleSignInUser = async () => {
  return executeFn({
    fn: async () => {
      const response = await auth.api.signInSocial({
        body: { provider: "google", callbackURL: "/", newUserCallbackURL: "/" },
        headers: await headers(),
      });

      return response;
    },
    isProtected: false,
    serverErrorMessage: "googleSignInUser",
  });
};

export { googleSignInUser };
