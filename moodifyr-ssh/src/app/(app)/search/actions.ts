"use server";

import { endOfDay, startOfDay } from "date-fns";
import { and, eq, gte, lte } from "drizzle-orm";
import z from "zod";
import { classifySongCategory } from "@/app/(app)/search/fn";
import { db } from "@/db";
import {
  type SongSchema,
  songAnalyticsPlayHistory,
  songPlayHistory,
  songSchema,
  songs,
} from "@/db/schema/song";
import { executeAction } from "@/db/utils";
import { convertToLocalTZ } from "@/lib/utils";

const trackUserSongPlayHistory = async ({
  song,
}: {
  song: Omit<SongSchema, "category">;
}) => {
  const trackUserSongPlayHistorySchema = z.object({
    song: songSchema.omit({ category: true }),
  });
  const { song: parsedSong } = trackUserSongPlayHistorySchema.parse({ song });

  return executeAction({
    actionFn: async ({ sessionUser }) => {
      const existingSong = await db.query.songs.findFirst({
        where: eq(songs.id, parsedSong.id),
      });

      await db.transaction(async (tx) => {
        if (!existingSong) {
          await tx.insert(songs).values({
            id: parsedSong.id,
            title: parsedSong.title,
            thumbnail: parsedSong.thumbnail,
            duration: {
              timestamp: parsedSong.duration.timestamp,
              seconds: parsedSong.duration.seconds,
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
            eq(songPlayHistory.songId, parsedSong.id),
            gte(songPlayHistory.playedAt, dayStart),
            lte(songPlayHistory.playedAt, dayEnd),
          ),
        });

        if (existingPlay) {
          await tx
            .update(songPlayHistory)
            .set({
              playedAt: new Date(),
            })
            .where(eq(songPlayHistory.id, existingPlay.id));
        } else {
          await tx.insert(songPlayHistory).values({
            userId: sessionUser.id,
            songId: parsedSong.id,
          });
        }
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
  song: SongSchema;
}) => {
  const trackUserSongAnalayticsPlayHistorySchema = songSchema;
  const parsedSong = trackUserSongAnalayticsPlayHistorySchema.parse({
    ...song,
  });

  return executeAction({
    actionFn: async ({ sessionUser }) => {
      const existingSong = await db.query.songs.findFirst({
        where: eq(songs.id, parsedSong.id),
      });

      let category = existingSong?.category;

      if (!category) {
        const categoryResult = await classifySongCategory({
          title: parsedSong.title,
        });
        category = categoryResult;
      }

      await db.transaction(async (tx) => {
        if (!existingSong) {
          await tx.insert(songs).values({
            id: parsedSong.id,
            title: parsedSong.title,
            thumbnail: parsedSong.thumbnail,
            duration: {
              timestamp: parsedSong.duration.timestamp,
              seconds: parsedSong.duration.seconds,
            },
            category,
          });
        } else if (!existingSong.category) {
          await tx.update(songs).set({ category }).where(eq(songs.id, song.id));
        }

        await tx.insert(songAnalyticsPlayHistory).values({
          userId: sessionUser.id,
          songId: parsedSong.id,
        });
      });
    },
    isProtected: true,
    clientSuccessMessage: "Analytics song play history tracked successfully.",
    serverErrorMessage: "trackUserSongAnalyticsPlayHistory",
  });
};

export { trackUserSongPlayHistory, trackUserSongAnalyticsPlayHistory };
