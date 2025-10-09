"use server";

import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod";
import type { SongWithUniqueIdSchema } from "@/app/_types";
import { db } from "@/db";
import { songSearchHistory } from "@/db/schema";
import { favouriteSongs, songs } from "@/db/schema/song";
import {
  type UserPreferenceSchema,
  userPreferenceSchema,
} from "@/db/schema/user";
import { executeQuery } from "@/db/utils";
import { auth } from "@/lib/auth";
import { users } from "@/db/schema/auth";

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
  const getUserSongSearchHistorySchema = z.object({
    page: z.number().int().min(1),
    limit: z.number().int().min(10).max(20),
  });
  const { page: parsedPage, limit: parsedLimit } =
    getUserSongSearchHistorySchema.parse({ page, limit });

  return executeQuery({
    queryFn: async ({ sessionUser }) => {
      const offset = (parsedPage - 1) * parsedLimit;

      const history = await db.query.songSearchHistory.findMany({
        where: eq(songSearchHistory.userId, sessionUser?.id as string),
        orderBy: [desc(songSearchHistory.searchedAt)],
        limit: parsedLimit,
        offset,
      });

      return history;
    },
    isProtected: true,
    serverErrorMessage: "getSongSearchHistory",
  });
};

const getUserLastPlayedSong =
  async (): Promise<SongWithUniqueIdSchema | null> => {
    const song = await getUserPreference<SongWithUniqueIdSchema>({
      key: "lastPlayedSong",
    });
    if (!song) return null;

    return song as SongWithUniqueIdSchema;
  };

const getUserFavouriteSongs = () => {
  return executeQuery({
    queryFn: async ({ sessionUser }) => {
      const favourites = await db
        .select({
          favouriteId: favouriteSongs.id,
          songId: songs.id,
          title: songs.title,
          thumbnail: songs.thumbnail,
          duration: songs.duration,
        })
        .from(favouriteSongs)
        .innerJoin(songs, eq(favouriteSongs.songId, songs.id))
        .where(eq(favouriteSongs.userId, sessionUser.id));

      return favourites.map((fav) => ({
        id: fav.songId,
        favouriteId: fav.favouriteId,
        title: fav.title,
        thumbnail: fav.thumbnail,
        duration: {
          timestamp: fav.duration.timestamp,
          seconds: fav.duration.seconds,
        },
      }));
    },
    isProtected: true,
    serverErrorMessage: "getUserFavouriteSongs",
  });
};

const getUserPreference = async <T = unknown>({
  key,
}: Pick<UserPreferenceSchema, "key">): Promise<T | string | null> => {
  const getUserPreferenceSchema = userPreferenceSchema.pick({ key: true });
  const { key: parsedKey } = getUserPreferenceSchema.parse({ key });

  return executeQuery({
    queryFn: async ({ sessionUser }) => {
      const pref = await db.query.userPreferences.findFirst({
        where: (prefs, { eq, and }) =>
          and(eq(prefs.userId, sessionUser.id), eq(prefs.key, parsedKey)),
      });

      if (!pref) return null;

      try {
        return JSON.parse(pref.value) as T;
      } catch {
        return pref.value;
      }
    },
    isProtected: true,
    serverErrorMessage: "getUserPreference",
  });
};

const getUserAllPreferences = async () => {
  return executeQuery({
    queryFn: async ({ sessionUser }) => {
      const prefs = await db.query.userPreferences.findMany({
        where: (prefs, { eq }) => eq(prefs.userId, sessionUser.id),
      });
      return prefs.reduce<Record<string, unknown>>((acc, p) => {
        acc[p.key] =
          typeof p.value === "string" &&
          (p.value.startsWith("{") || p.value.startsWith("["))
            ? JSON.parse(p.value)
            : p.value;
        return acc;
      }, {});
    },
    isProtected: true,
    serverErrorMessage: "getUserAllPreferences",
  });
};

const getSongStatus = async ({ youtubeId }: { youtubeId: string }) => {
  const getSongStatusSchema = z.object({
    youtubeId: z.string().min(1),
    // .length(11)
    // .regex(/^[A-Za-z0-9_-]{11}$/, "Invalid YouTube video ID format"),
  });
  const { youtubeId: parsedYoutubeId } = getSongStatusSchema.parse({
    youtubeId,
  });

  return executeQuery({
    queryFn: async () => {
      const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${parsedYoutubeId}`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "text/html",
        },
        cache: "force-cache",
        next: { revalidate: 24 * 60 * 60 },
      });

      if (!res.ok) {
        return false;
      }

      return true;
    },
    isProtected: false,
    serverErrorMessage: "getSongStatus",
  });
};

const getUserById = async ({ userId }: { userId: string }) => {
  return executeQuery({
    queryFn: async () => {
      // const user = await db.query.users.findFirst({
      //   where: (user, { eq }) => eq(user.userId, sessionUser.id),
      // });
      const user = await db
        .select({
          name: users.name,
          email: users.email,
          image: users.image,
        })
        .from(users)
        .where(eq(users.id, userId));
      return user[0] ?? null;
    },
    isProtected: true,
    serverErrorMessage: "getUserById",
  });
};

export {
  getUserSession,
  getUserSongSearchHistory,
  getUserLastPlayedSong,
  getUserFavouriteSongs,
  getUserPreference,
  getUserAllPreferences,
  getSongStatus,
  getUserById,
};
