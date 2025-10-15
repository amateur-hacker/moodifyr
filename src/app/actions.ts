"use server";

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { userPreferences } from "@/db/schema";
import {
  type SongSearchHistorySchema,
  songSearchHistory,
  songSearchHistorySchema,
} from "@/db/schema/song";
import {
  type UserPreferenceSchema,
  userPreferenceSchema,
} from "@/db/schema/user";
import { executeAction } from "@/db/utils";
import { auth } from "@/lib/auth";
import type { SongSchema } from "@/app/_types";
import { favouriteSongs, songSchema, songs } from "@/db/schema/song";
import z from "zod";
import { revalidatePath } from "next/cache";

const signOutUser = async () => {
  return executeAction({
    actionFn: async () => {
      await auth.api.signOut({ headers: await headers() });
    },
    isProtected: false,
    clientSuccessMessage: "Signed out successfully",
    serverErrorMessage: "signOutUser",
  });
};

const trackUserSongSearchHistory = ({
  query,
}: Pick<SongSearchHistorySchema, "query">) => {
  const trackUserSongSearchHistorySchema = songSearchHistorySchema.pick({
    query: true,
  });
  const { query: parsedQuery } = trackUserSongSearchHistorySchema.parse({
    query,
  });

  return executeAction({
    actionFn: async ({ sessionUser }) => {
      await db
        .delete(songSearchHistory)
        .where(
          and(
            eq(songSearchHistory.userId, sessionUser.id),
            eq(songSearchHistory.query, parsedQuery),
          ),
        );

      await db.insert(songSearchHistory).values({
        userId: sessionUser.id,
        query,
      });
    },
    isProtected: true,
    clientSuccessMessage: "Search history tracked successfully.",
    serverErrorMessage: "trackUserSongSearchHistory",
  });
};

const removeUserSongSearchHistory = ({
  id,
}: Pick<SongSearchHistorySchema, "id">) => {
  const removeUserSongSearchHistorySchema = songSearchHistorySchema.pick({
    id: true,
  });
  const { id: parsedId } = removeUserSongSearchHistorySchema.parse({ id });

  return executeAction({
    actionFn: async ({ sessionUser }) => {
      await db
        .delete(songSearchHistory)
        .where(
          and(
            eq(songSearchHistory.id, parsedId),
            eq(songSearchHistory.userId, sessionUser.id),
          ),
        );
    },
    isProtected: true,
    clientSuccessMessage: "Search history removed successfully.",
    serverErrorMessage: "removeUserSongSearchHistory",
  });
};

const saveUserPreference = async ({
  key,
  value,
}: Pick<UserPreferenceSchema, "key" | "value">) => {
  const saveUserPreferenceSchema = userPreferenceSchema.pick({
    key: true,
    value: true,
  });
  const { key: parsedKey, value: parsedValue } = saveUserPreferenceSchema.parse(
    { key, value },
  );

  return executeAction({
    actionFn: async ({ sessionUser }) => {
      await db
        .insert(userPreferences)
        .values({
          userId: sessionUser.id,
          key: parsedKey,
          value: parsedValue,
        })
        .onConflictDoUpdate({
          target: [userPreferences.userId, userPreferences.key],
          set: {
            value: parsedValue,
          },
        });
    },
    isProtected: true,
    clientSuccessMessage: "Preference saved.",
    serverErrorMessage: "saveUserPreference",
  });
};

const toggleUserFavouriteSong = async ({ song }: { song: SongSchema }) => {
  const toggleUserFavouriteSongSchema = z.object({
    song: songSchema.omit({ category: true }),
  });
  const { song: parsedSong } = toggleUserFavouriteSongSchema.parse({
    song,
  });

  return executeAction({
    actionFn: async ({ sessionUser }) => {
      const userId = sessionUser.id;

      const existingSong = await db
        .select()
        .from(songs)
        .where(eq(songs.id, parsedSong.id))
        .limit(1)
        .then((rows) => rows[0]);

      if (!existingSong) {
        await db.insert(songs).values({
          id: parsedSong.id,
          title: parsedSong.title,
          thumbnail: parsedSong.thumbnail,
          duration: parsedSong.duration,
        });
      }

      const [alreadyFavourite] = await db
        .select()
        .from(favouriteSongs)
        .where(
          and(
            eq(favouriteSongs.userId, userId),
            eq(favouriteSongs.songId, parsedSong.id),
          ),
        )
        .limit(1);

      if (alreadyFavourite) {
        await db
          .delete(favouriteSongs)
          .where(
            and(
              eq(favouriteSongs.userId, userId),
              eq(favouriteSongs.songId, parsedSong.id),
            ),
          );
      } else {
        await db.insert(favouriteSongs).values({
          songId: song.id,
          userId,
        });
      }
    },
    isProtected: true,
    serverErrorMessage: "toggleUserFavouriteSong",
  });
};

export {
  signOutUser,
  trackUserSongSearchHistory,
  removeUserSongSearchHistory,
  saveUserPreference,
  toggleUserFavouriteSong,
};
