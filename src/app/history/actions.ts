"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { songPlayHistory } from "@/db/schema/song";
import { executeAction } from "@/db/utils";

const removeUserSongPlayHistory = ({
  id,
  revalidate = true,
  path = "/history",
}: {
  id: string;
  revalidate?: boolean;
  path?: string;
}) => {
  return executeAction({
    actionFn: async ({ sessionUser }) => {
      const result = await db
        .delete(songPlayHistory)
        .where(
          and(
            eq(songPlayHistory.id, id),
            eq(songPlayHistory.userId, sessionUser?.id as string),
          ),
        );

      if (revalidate) {
        revalidatePath(path);
      }

      return result;
    },
    isProtected: true,
    clientSuccessMessage: "Song play history removed successfully.",
    serverErrorMessage: "removeUserSongPlayHistory",
  });
};

export { removeUserSongPlayHistory };
