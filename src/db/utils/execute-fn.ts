import type { User as SessionUser } from "better-auth";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

type ExecuteFnArgs<T, P extends boolean> = {
  fn: (args: {
    sessionUser: P extends true ? SessionUser : SessionUser | undefined;
  }) => Promise<T>;
  serverErrorMessage?: string;
  isProtected?: P;
};

const executeFn = async <T, P extends boolean = true>({
  fn,
  serverErrorMessage = "Error executing function",
  isProtected = true as P,
}: ExecuteFnArgs<T, P>): Promise<T | null> => {
  try {
    let sessionUser: SessionUser | undefined;

    if (isProtected) {
      const session = await auth.api.getSession({ headers: await headers() });
      if (!session) throw new Error("User not authorized!");

      sessionUser = session.user as SessionUser;
    }

    return await fn({
      sessionUser: sessionUser as P extends true
        ? SessionUser
        : SessionUser | undefined,
    });
  } catch (error) {
    console.error(serverErrorMessage, error);
    return null;
  }
};

export { executeFn };
