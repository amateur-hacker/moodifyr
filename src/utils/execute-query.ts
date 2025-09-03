import type { User as SessionUser } from "better-auth";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

type ExecuteQueryArgs<T> = {
  queryFn: ({ sessionUser }: { sessionUser?: SessionUser }) => Promise<T>;
  serverErrorMessage?: string;
  isProtected?: boolean;
};
const executeQuery = async <T>({
  queryFn,
  serverErrorMessage = "Error executing query",
  isProtected = true,
}: ExecuteQueryArgs<T>): Promise<T | null> => {
  try {
    let sessionUser: SessionUser | undefined;

    if (isProtected) {
      const session = await auth.api.getSession({ headers: await headers() });
      if (!session) throw new Error("User not authorized!");

      sessionUser = session.user as SessionUser;
    }

    return await queryFn({ sessionUser });
  } catch (error) {
    console.error(serverErrorMessage, error);
    return null;
  }
};

export { executeQuery };
