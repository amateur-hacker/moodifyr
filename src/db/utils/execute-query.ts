import type { User as SessionUser } from "better-auth";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

type ExecuteQueryArgs<T, P extends boolean> = {
  queryFn: (args: {
    sessionUser: P extends true ? SessionUser : SessionUser | undefined;
  }) => Promise<T>;
  serverErrorMessage?: string;
  isProtected?: P;
};

const executeQuery = async <T, P extends boolean = true>({
  queryFn,
  serverErrorMessage = "Error executing query",
  isProtected = true as P,
}: ExecuteQueryArgs<T, P>): Promise<T | null> => {
  try {
    let sessionUser: SessionUser | undefined;

    if (isProtected) {
      const session = await auth.api.getSession({ headers: await headers() });
      if (!session) throw new Error("User not authorized!");

      sessionUser = session.user as SessionUser;
    }

    return await queryFn({
      sessionUser: sessionUser as P extends true
        ? SessionUser
        : SessionUser | undefined,
    });
  } catch (error) {
    console.error(serverErrorMessage, error);
    return null;
  }
};

export { executeQuery };
