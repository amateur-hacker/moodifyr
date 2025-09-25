"use server";

import { endOfDay, startOfDay } from "date-fns";
import { and, eq, gte, lte } from "drizzle-orm";
import type { SongWithUniqueId } from "@/app/_types";
import { classifySongCategory } from "@/app/search/fn";
import { db } from "@/db";
import {
  songAnalyticsPlayHistory,
  songPlayHistory,
  songs,
} from "@/db/schema/song";
import { executeAction } from "@/db/utils";
import { convertToLocalTZ } from "@/lib/utils";

const trackUserSongPlayHistory = async ({
  song,
}: {
  song: SongWithUniqueId;
}) => {
  if (!song) return null;

  return executeAction({
    actionFn: async ({ sessionUser }) => {
      const existingSong = await db.query.songs.findFirst({
        where: eq(songs.id, song.id),
      });

      await db.transaction(async (tx) => {
        if (!existingSong) {
          await tx.insert(songs).values({
            id: song.id,
            title: song.title,
            thumbnail: song.thumbnail,
            duration: {
              timestamp: song.duration.timestamp,
              seconds: song.duration.seconds,
            },
          });
        }

        const now = new Date();
        const localNow = convertToLocalTZ(now);

        const dayStart = startOfDay(localNow);
        const dayEnd = endOfDay(localNow);

        const existingPlay = await tx.query.songPlayHistory.findFirst({
          where: and(
            eq(songPlayHistory.userId, sessionUser?.id as string),
            eq(songPlayHistory.songId, song.id),
            gte(songPlayHistory.playedAt, dayStart),
            lte(songPlayHistory.playedAt, dayEnd),
          ),
        });

        if (existingPlay) {
          await tx
            .delete(songPlayHistory)
            .where(eq(songPlayHistory.id, existingPlay.id));
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
const trackUserSongAnalyticsPlayHistory = async ({
  song,
}: {
  song: SongWithUniqueId;
}) => {
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
            thumbnail: song.thumbnail,
            duration: {
              timestamp: song.duration.timestamp,
              seconds: song.duration.seconds,
            },
            category,
          });
        } else if (!existingSong.category) {
          await tx.update(songs).set({ category }).where(eq(songs.id, song.id));
        }

        await tx.insert(songAnalyticsPlayHistory).values({
          userId: sessionUser?.id as string,
          songId: song.id,
        });
      });
    },
    isProtected: true,
    clientSuccessMessage: "Analytics song play history tracked successfully.",
    serverErrorMessage: "trackUserSongAnalyticsPlayHistory",
  });
};

export { trackUserSongPlayHistory, trackUserSongAnalyticsPlayHistory };
