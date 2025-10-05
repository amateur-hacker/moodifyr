import { headers } from "next/headers";
import { auth } from "@/lib/auth";

type ExecuteApiArgs<T> = {
  apiFn: () => Promise<T>;
  serverErrorMessage?: string;
  isProtected?: boolean;
};
const executeApi = async <T>({
  apiFn,
  serverErrorMessage = "Error executing API request",
  isProtected = true,
}: ExecuteApiArgs<T>): Promise<T | null> => {
  try {
    if (isProtected) {
      const session = await auth.api.getSession({ headers: await headers() });
      if (!session) throw new Error("User not authorized!");
    }
    return await apiFn();
  } catch (error) {
    console.error(serverErrorMessage, error);
    return null;
  }
};

export { executeApi };
