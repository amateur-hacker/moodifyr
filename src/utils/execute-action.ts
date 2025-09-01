import { isRedirectError } from "next/dist/client/components/redirect-error";

import { auth } from "@/lib/auth";
import { getErrorMessage } from "@/utils/get-error-message";
import type { User as SessionUser } from "better-auth";
import { headers } from "next/headers";

type ExecuteActionArgs<T> = {
  actionFn: ({ sessionUser }: { sessionUser?: SessionUser }) => Promise<T>;
  isProtected?: boolean;
  clientSuccessMessage?: string;
  serverErrorMessage?: string;
};
const executeAction = async <T>({
  actionFn,
  isProtected = true,
  clientSuccessMessage = "Operation was successful",
  serverErrorMessage = "Error executing action",
}: ExecuteActionArgs<T>): Promise<{ success: boolean; message: string }> => {
  try {
    let sessionUser: SessionUser | undefined;

    if (isProtected) {
      const session = await auth.api.getSession({ headers: await headers() });
      if (!session) throw new Error("User not authorized!");

      sessionUser = session.user as SessionUser;
    }

    await actionFn({ sessionUser });

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
