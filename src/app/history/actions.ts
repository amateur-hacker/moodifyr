"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  type SongPlayHistorySchema,
  songPlayHistory,
  songPlayHistorySchema,
} from "@/db/schema/song";
import { executeAction } from "@/db/utils";

const removeUserSongPlayHistory = ({
  id,
}: Pick<SongPlayHistorySchema, "id">) => {
  return executeAction({
    actionFn: async ({ sessionUser }) => {
      const removeUserSongPlayHistorySchema = songPlayHistorySchema.pick({
        id: true,
      });
      const { id: parsedId } = removeUserSongPlayHistorySchema.parse({ id });

      const result = await db
        .delete(songPlayHistory)
        .where(
          and(
            eq(songPlayHistory.id, parsedId),
            eq(songPlayHistory.userId, sessionUser.id),
          ),
        );

      revalidatePath("/history");

      return result;
    },
    isProtected: true,
    clientSuccessMessage: "Song play history removed successfully.",
    serverErrorMessage: "removeUserSongPlayHistory",
  });
};

export { removeUserSongPlayHistory };
