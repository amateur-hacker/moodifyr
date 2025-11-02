import type { User as SessionUser } from "better-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getErrorMessage } from "@/lib/utils";

type ExecuteActionArgs<T, P extends boolean> = {
  actionFn: (args: {
    sessionUser: P extends true ? SessionUser : SessionUser | undefined;
  }) => Promise<T>;
  isProtected?: P;
  clientSuccessMessage?: string;
  serverErrorMessage?: string;
};
const executeAction = async <T, P extends boolean = true>({
  actionFn,
  isProtected = true as P,
  clientSuccessMessage = "Operation was successful",
  serverErrorMessage = "Error executing action",
}: ExecuteActionArgs<T, P>): Promise<{ success: boolean; message: string }> => {
  try {
    let sessionUser: SessionUser | undefined;

    if (isProtected) {
      const session = await auth.api.getSession({
        headers: await headers(),
        // query: { disableCookieCache: true },
      });
      if (!session) throw new Error("User not authorized!");

      sessionUser = session.user as SessionUser;
    }

    await actionFn({
      sessionUser: sessionUser as P extends true
        ? SessionUser
        : SessionUser | undefined,
    });

    return {
      success: true,
      message: clientSuccessMessage,
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    console.error(serverErrorMessage, error);
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

export { executeAction };
