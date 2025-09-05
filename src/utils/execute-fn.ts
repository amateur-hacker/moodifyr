import type { User as SessionUser } from "better-auth";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

type ExecuteFnArgs<T> = {
  fn: ({ sessionUser }: { sessionUser?: SessionUser }) => Promise<T>;
  serverErrorMessage?: string;
  isProtected?: boolean;
};

const executeFn = async <T>({
  fn,
  serverErrorMessage = "Error executing function",
  isProtected = true,
}: ExecuteFnArgs<T>): Promise<T | null> => {
  try {
    let sessionUser: SessionUser | undefined;

    if (isProtected) {
      const session = await auth.api.getSession({ headers: await headers() });
      if (!session) throw new Error("User not authorized!");
      sessionUser = session.user as SessionUser;
    }

    return await fn({ sessionUser });
  } catch (error) {
    console.error(serverErrorMessage, error);
    return null;
  }
};

export { executeFn };
