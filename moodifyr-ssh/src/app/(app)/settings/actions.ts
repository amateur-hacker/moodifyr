"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  favouriteSongs,
  moodlistFollowers,
  moodlistSongs,
  moodlists,
  songAnalyticsPlayHistory,
  songPlayHistory,
  songSearchHistory,
  userPreferences,
  users,
} from "@/db/schema";
import { executeAction } from "@/db/utils";

const resetUserData = async () => {
  const userDataTables = [
    userPreferences,
    songPlayHistory,
    songAnalyticsPlayHistory,
    songSearchHistory,
    favouriteSongs,
    moodlistFollowers,
    moodlistSongs,
    moodlists,
  ];

  return executeAction({
    actionFn: async ({ sessionUser }) => {
      db.transaction(async (tx) => {
        for (const table of userDataTables) {
          await tx.delete(table).where(eq(table.userId, sessionUser.id));
        }
      });
    },
    isProtected: true,
    clientSuccessMessage: "Reset data successfully",
    serverErrorMessage: "resetUserData",
  });
};

const deleteUserAccount = async () =>
  executeAction({
    actionFn: async ({ sessionUser }) =>
      db.delete(users).where(eq(users.id, sessionUser.id)),
    isProtected: true,
    clientSuccessMessage: "Account deleted successfully",
    serverErrorMessage: "deleteUserAccount",
  });

export { resetUserData, deleteUserAccount };
