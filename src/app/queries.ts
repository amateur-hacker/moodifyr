"use server";

import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { headers } from "next/headers";
import type { Song } from "@/app/search/_types";
import { db } from "@/db";
import { songSearchHistory } from "@/db/schema";
import { favouriteSongs, songPlayHistory, songs } from "@/db/schema/song";
import { executeQuery } from "@/db/utils";
import { auth } from "@/lib/auth";

const getUserSession = async () => {
  return executeQuery({
    queryFn: async () => {
      const session = await auth.api.getSession({ headers: await headers() });
      return session;
    },
    isProtected: true,
    serverErrorMessage: "getUserSession",
  });
};

const getUserSongSearchHistory = ({
  page = 1,
  limit = 10,
}: {
  page: number;
  limit: number;
}) => {
  return executeQuery({
    queryFn: async ({ sessionUser }) => {
      const offset = (page - 1) * limit;

      const history = await db.query.songSearchHistory.findMany({
        where: eq(songSearchHistory.userId, sessionUser?.id as string),
        orderBy: [desc(songSearchHistory.searchedAt)],
        limit,
        offset,
      });

      return history;
    },
    isProtected: true,
    serverErrorMessage: "getSongSearchHistory",
  });
};

const getUserSongPlayHistory = ({
  page = 1,
  limit = 10,
}: {
  page: number;
  limit: number;
}) => {
  return executeQuery({
    queryFn: async ({ sessionUser }) => {
      const offset = (page - 1) * limit;

      const history = await db.query.songPlayHistory.findMany({
        where: eq(songPlayHistory.userId, sessionUser?.id as string),
        orderBy: [desc(songPlayHistory.playedAt)],
        limit,
        offset,
      });

      return history;
    },
    isProtected: true,
    serverErrorMessage: "getUserSongPlayHistory",
  });
};

const getUserLastPlayedSong = () => {
  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return executeQuery({
    queryFn: async ({ sessionUser }) => {
      const last = await db
        .select({
          id: songs.id,
          title: songs.title,
          url: songs.url,
          thumbnail: songs.thumbnail,
          seconds: songs.seconds,
          playedAt: songPlayHistory.playedAt,
        })
        .from(songPlayHistory)
        .innerJoin(songs, eq(songPlayHistory.songId, songs.id))
        .where(eq(songPlayHistory.userId, sessionUser?.id as string))
        .orderBy(desc(songPlayHistory.playedAt))
        .limit(1);

      if (!last[0]) return null;

      const row = last[0];
      const song: Song = {
        id: row.id,
        title: row.title,
        url: row.url,
        thumbnail: row.thumbnail,
        duration: {
          seconds: row.seconds,
          timestamp: formatTimestamp(row.seconds),
        },
      };

      return song;
    },
    isProtected: true,
    serverErrorMessage: "getUserLastPlayedSong",
  });
};

const getUserSongPlayHistoryByDateRange = ({
  startDate,
  endDate,
}: {
  startDate: Date;
  endDate: Date;
  count?: number;
}) => {
  return executeQuery({
    queryFn: async ({ sessionUser }) => {
      const history = await db
        .select({
          title: songs.title,
          mood: songs.category,
          count: sql<number>`COUNT(*)`,
        })
        .from(songPlayHistory)
        .leftJoin(songs, eq(songs.id, songPlayHistory.songId))
        .where(
          and(
            eq(songPlayHistory.userId, sessionUser?.id as string),
            gte(songPlayHistory.playedAt, startDate),
            lte(songPlayHistory.playedAt, endDate),
          ),
        )
        .groupBy(songs.title, songs.category)
        .orderBy(desc(sql`COUNT(*)`));

      const formatLocalDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const startStr = formatLocalDate(startDate);
      const endStr = formatLocalDate(endDate);

      return history.map(
        (h) => `${h.title} (${h.count}) [${h.mood}] [${startStr} to ${endStr}]`,
      );
    },
    isProtected: true,
    serverErrorMessage: "getUserSongPlayHistoryByDateRange",
  });
};

const getUserMostPlayedSongByDateRange = ({
  startDate,
  endDate,
  count,
}: {
  startDate: Date;
  endDate: Date;
  count?: number;
}) => {
  return executeQuery({
    queryFn: async ({ sessionUser }) => {
      const query = db
        .select({
          title: songs.title,
          thumbnail: songs.thumbnail,
          mood: songs.category,
          times: sql<number>`COUNT(*)`,
        })
        .from(songPlayHistory)
        .leftJoin(songs, eq(songs.id, songPlayHistory.songId))
        .where(
          and(
            eq(songPlayHistory.userId, sessionUser?.id as string),
            gte(songPlayHistory.playedAt, startDate),
            lte(songPlayHistory.playedAt, endDate),
          ),
        )
        .groupBy(songs.id)
        .orderBy(desc(sql`COUNT(*)`));

      const songsList = count ? await query.limit(count) : await query;

      return songsList.map((s) => ({
        title: s.title,
        thumbnail: s.thumbnail,
        mood: s.mood,
        times: s.times,
      }));
    },
    isProtected: true,
    serverErrorMessage: "getUserMostPlayedSongByDateRange",
  });
};

const getUserFavouriteSongs = () => {
  return executeQuery({
    queryFn: async ({ sessionUser }) =>
      await db
        .select({
          id: favouriteSongs.id,
          title: favouriteSongs.title,
          url: favouriteSongs.url,
          thumbnail: favouriteSongs.thumbnail,
          seconds: favouriteSongs.seconds,
        })
        .from(favouriteSongs)
        .where(eq(favouriteSongs.userId, sessionUser?.id as string)),
    isProtected: true,
    serverErrorMessage: "getUserFavouriteSongs",
  });
};

const getUserPreference = async ({ key }: { key: string }) => {
  return executeQuery({
    queryFn: async ({ sessionUser }) => {
      if (!sessionUser?.id) return null;

      const pref = await db.query.userPreferences.findFirst({
        where: (prefs, { eq, and }) =>
          and(eq(prefs.userId, sessionUser.id), eq(prefs.key, key)),
      });

      return pref ? JSON.parse(pref.value) : null;
    },
    isProtected: true,
    serverErrorMessage: "getUserPreference",
  });
};

const getUserAllPreferences = async () => {
  return executeQuery({
    queryFn: async ({ sessionUser }) => {
      if (!sessionUser?.id) return {};

      const prefs = await db.query.userPreferences.findMany({
        where: (prefs, { eq }) => eq(prefs.userId, sessionUser.id),
      });

      return prefs.reduce<Record<string, unknown>>((acc, p) => {
        acc[p.key] = JSON.parse(p.value);
        return acc;
      }, {});
    },
    isProtected: true,
    serverErrorMessage: "getUserAllPreferences",
  });
};

export {
  getUserSession,
  getUserSongSearchHistory,
  getUserSongPlayHistory,
  getUserLastPlayedSong,
  getUserSongPlayHistoryByDateRange,
  getUserMostPlayedSongByDateRange,
  getUserFavouriteSongs,
  getUserPreference,
  getUserAllPreferences,
};
