"use server";

import { headers } from "next/headers";
import z from "zod";
import { executeFn } from "@/db/utils";
import { auth } from "@/lib/auth";

const googleSignInUser = async ({
  callbackURL,
  newUserCallbackURL,
}: {
  callbackURL?: string;
  newUserCallbackURL?: string;
} = {}) => {
  const googleSignInUserSchema = z.object({
    callbackURL: z.string().default("/"),
    newUserCallbackURL: z.string().default("/"),
  });
  const {
    callbackURL: parsedCallbackURL,
    newUserCallbackURL: parsedNewUserCallbackURL,
  } = googleSignInUserSchema.parse({ callbackURL, newUserCallbackURL });

  return executeFn({
    fn: async () => {
      const response = await auth.api.signInSocial({
        body: {
          provider: "google",
          callbackURL: parsedCallbackURL,
          newUserCallbackURL: parsedNewUserCallbackURL,
        },
        headers: await headers(),
      });

      return response;
    },
    isProtected: false,
    serverErrorMessage: "googleSignInUser",
  });
};

export { googleSignInUser };
