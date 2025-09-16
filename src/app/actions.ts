"use server";

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { songSearchHistory } from "@/db/schema/song";
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

const trackUserSongSearchHistory = ({ query }: { query: string }) => {
  return executeAction({
    actionFn: async ({ sessionUser }) => {
      if (!sessionUser?.id) return;

      await db
        .delete(songSearchHistory)
        .where(
          and(
            eq(songSearchHistory.userId, sessionUser.id),
            eq(songSearchHistory.query, query),
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

const removeUserSongSearchHistory = ({ id }: { id: string }) => {
  return executeAction({
    actionFn: async ({ sessionUser }) => {
      await db
        .delete(songSearchHistory)
        .where(
          and(
            eq(songSearchHistory.id, id),
            eq(songSearchHistory.userId, sessionUser?.id as string),
          ),
        );
    },
    isProtected: true,
    clientSuccessMessage: "Search history removed successfully.",
    serverErrorMessage: "removeUserSongSearchHistory",
  });
};

export { signOutUser, trackUserSongSearchHistory, removeUserSongSearchHistory };
