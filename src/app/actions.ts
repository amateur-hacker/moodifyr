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

export {
  signOutUser,
  trackUserSongSearchHistory,
  removeUserSongSearchHistory,
  saveUserPreference,
};
