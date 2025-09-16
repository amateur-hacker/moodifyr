"use server";

import { and, eq } from "drizzle-orm";
import type { Song } from "@/app/search/_types";
import { classifySongCategory } from "@/app/search/fn";
import { db } from "@/db";
import { songPlayHistory, songs } from "@/db/schema/song";
import { executeAction } from "@/db/utils";

const trackUserSongPlayHistory = async ({ song }: { song: Song }) => {
  if (!song) return null;

  return executeAction({
    actionFn: async ({ sessionUser }) => {
      const existingSong = await db.query.songs.findFirst({
        where: eq(songs.id, song.id),
      });

      let category = existingSong?.category;

      if (!category) {
        const categoryResult = await classifySongCategory({
          title: song.title,
        });
        category = categoryResult;
      }

      await db.transaction(async (tx) => {
        if (!existingSong) {
          await tx.insert(songs).values({
            id: song.id,
            title: song.title,
            url: song.url,
            thumbnail: song.thumbnail,
            seconds: song.duration.seconds,
            category,
          });
        } else if (!existingSong.category) {
          await tx.update(songs).set({ category }).where(eq(songs.id, song.id));
        }

        await tx.insert(songPlayHistory).values({
          userId: sessionUser?.id as string,
          songId: song.id,
        });
      });
    },
    isProtected: true,
    clientSuccessMessage: "Song play history tracked successfully.",
    serverErrorMessage: "trackUserSongPlayHistory",
  });
};

const removeUserSongPlayHistory = ({ id }: { id: string }) => {
  return executeAction({
    actionFn: async ({ sessionUser }) => {
      await db
        .delete(songPlayHistory)
        .where(
          and(
            eq(songPlayHistory.id, id),
            eq(songPlayHistory.userId, sessionUser?.id as string),
          ),
        );
    },
    isProtected: true,
    clientSuccessMessage: "Song play history removed successfully.",
    serverErrorMessage: "removeUserSongPlayHistory",
  });
};

export { trackUserSongPlayHistory, removeUserSongPlayHistory };
