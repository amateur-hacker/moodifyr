"use server";

import { desc, eq, type SQL, sql } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod";
import type {
  FavouriteSongSchema,
  Prettify,
  SongPlayerMode,
  SongSchema,
  SongWithUniqueIdSchema,
} from "@/app/(app)/_types";
import { db } from "@/db";
import { songSearchHistory } from "@/db/schema";
import { users } from "@/db/schema/auth";
import { favouriteSongs, songs } from "@/db/schema/song";
import {
  type UserPreferenceSchema,
  userPreferenceSchema,
} from "@/db/schema/user";
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
  page?: number;
  limit?: number;
} = {}) => {
  const getUserSongSearchHistorySchema = z.object({
    page: z.number().int().min(1),
    limit: z.number().int().min(1).max(10),
  });
  const { page: parsedPage, limit: parsedLimit } =
    getUserSongSearchHistorySchema.parse({ page, limit });

  return executeQuery({
    queryFn: async ({ sessionUser }) => {
      const offset = (parsedPage - 1) * parsedLimit;

      const history = await db.query.songSearchHistory.findMany({
        where: eq(songSearchHistory.userId, sessionUser?.id as string),
        limit: parsedLimit,
        offset,
        orderBy: [desc(songSearchHistory.searchedAt)],
      });

      return history;
    },
    isProtected: true,
    serverErrorMessage: "getUserSongSearchHistory",
  });
};

const getSongSearchSuggestions = async ({
  query,
  page = 1,
  limit = 10,
  userId,
}: {
  query: string;
  page?: number;
  limit?: number;
  userId: string | null;
}) => {
  const getUserSongSearchHistorySchema = z.object({
    query: z.string().min(1),
    page: z.number().int().min(1),
    limit: z.number().int().min(1).max(10),
    userId: z.string().nullable(),
  });
  const {
    query: parsedQuery,
    page: parsedPage,
    limit: parsedLimit,
    userId: parsedUserId,
  } = getUserSongSearchHistorySchema.parse({ query, page, limit, userId });

  return executeQuery({
    queryFn: async () => {
      const offset = (parsedPage - 1) * parsedLimit;
      const words = parsedQuery.toLowerCase().split(" ").filter(Boolean);

      const { conditions, rankConditions } = words.reduce(
        (acc, word, index) => {
          acc.conditions.push(sql`(
      ${songSearchHistory.query} ILIKE ${word} || '%' OR
      ${songSearchHistory.query} ILIKE '% ' || ${word} || '%'
    )`);

          acc.rankConditions.push(sql`
      WHEN split_part(${songSearchHistory.query}, ' ', 1) ILIKE ${word} || '%' THEN ${index} - 0.5
      WHEN ${songSearchHistory.query} ILIKE ${word} || '%' THEN ${index}
      WHEN ${songSearchHistory.query} ILIKE '% ' || ${word} || '%' THEN ${index} + 0.5
    `);

          return acc;
        },
        {
          conditions: [] as SQL<unknown>[],
          rankConditions: [] as SQL<unknown>[],
        },
      );

      const whereClause = sql.join(conditions, sql` AND `);
      const orderByRank = sql`CASE ${sql.join(rankConditions, sql` `)} ELSE ${words.length} END ASC`;

      const suggestions = await db.query.songSearchHistory.findMany({
        // where: sql`LOWER(query) LIKE ${parsedQuery.toLowerCase()} || '%'`,
        // where: sql`LOWER(query) LIKE '%' || ${parsedQuery.toLowerCase()} || '%'`,
        // where: sql`${songSearchHistory.query} ILIKE ${parsedQuery.toLowerCase()} || '%'`,
        // where: sql`to_tsvector('english', ${songSearchHistory.query}) @@ plainto_tsquery('english', ${parsedQuery.toLowerCase()})`,
        where: whereClause,
        limit: parsedLimit,
        offset,
        // orderBy: [desc(songSearchHistory.searchedAt)],
        orderBy: [orderByRank],
      });

      const uniqueSuggestionsMap = new Map<
        string,
        (typeof suggestions)[number] & { isOwnQuery: boolean }
      >();

      for (const item of suggestions) {
        const q = item.query.toLowerCase();
        const isOwn = item.userId === parsedUserId;

        const existing = uniqueSuggestionsMap.get(q);

        if (!existing || isOwn) {
          uniqueSuggestionsMap.set(q, { ...item, isOwnQuery: isOwn });
        }
      }

      const updatedSuggestions = Array.from(uniqueSuggestionsMap.values()).sort(
        (a, b) => Number(b.isOwnQuery) - Number(a.isOwnQuery),
      );

      return updatedSuggestions;
    },
    isProtected: false,
    serverErrorMessage: "getSongSearchSuggestions",
  });
};

const getUserLastPlayedSong = async () => {
  return executeQuery({
    queryFn: async () => {
      const song = await getUserPreference<SongWithUniqueIdSchema | null>({
        key: "lastPlayedSong",
      });

      if (!song) return null;

      return song;
    },
    isProtected: true,
    serverErrorMessage: "getUserLastPlayedSong",
  });
};

const getUserSongPlayerMode = async () => {
  return executeQuery({
    queryFn: async () => {
      const mode = await getUserPreference<SongPlayerMode>({
        key: "songPlayerMode",
      });

      if (!mode) return null;

      return mode as SongPlayerMode;
    },
    isProtected: true,
    serverErrorMessage: "getUserSongPlayerMode",
  });
};

const getUserFavouriteSongs = ({
  page,
  limit,
  pagination,
}: {
  page?: number;
  limit?: number;
  pagination?: boolean;
} = {}) => {
  const getUserFavouriteSongsSchema = z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(20).default(20),
    pagination: z.boolean().default(false),
  });

  const {
    page: parsedPage,
    limit: parsedLimit,
    pagination: parsedPagination,
  } = getUserFavouriteSongsSchema.parse({ page, limit, pagination });

  return executeQuery({
    queryFn: async ({ sessionUser }) => {
      let favourites: Prettify<
        Omit<FavouriteSongSchema, "id"> & { songId: string }
      >[] = [];
      if (!parsedPagination) {
        favourites = await db
          .select({
            favouriteId: favouriteSongs.id,
            songId: songs.id,
            title: songs.title,
            thumbnail: songs.thumbnail,
            duration: songs.duration,
          })
          .from(favouriteSongs)
          .innerJoin(songs, eq(favouriteSongs.songId, songs.id))
          .where(eq(favouriteSongs.userId, sessionUser.id))
          .orderBy(desc(favouriteSongs.favouritedAt));
      } else {
        const offset = (parsedPage - 1) * parsedLimit;
        favourites = await db
          .select({
            favouriteId: favouriteSongs.id,
            songId: songs.id,
            title: songs.title,
            thumbnail: songs.thumbnail,
            duration: songs.duration,
          })
          .from(favouriteSongs)
          .innerJoin(songs, eq(favouriteSongs.songId, songs.id))
          .where(eq(favouriteSongs.userId, sessionUser.id))
          .orderBy(desc(favouriteSongs.favouritedAt))
          .limit(parsedLimit)
          .offset(offset);
      }

      const updatedFavourites = favourites.map((fav) => ({
        id: fav.songId,
        favouriteId: fav.favouriteId,
        title: fav.title,
        thumbnail: fav.thumbnail,
        duration: {
          timestamp: fav.duration.timestamp,
          seconds: fav.duration.seconds,
        },
      }));

      return updatedFavourites;
    },
    isProtected: true,
    serverErrorMessage: "getUserFavouriteSongs",
  });
};

const getUserFavouriteSongsStats = () => {
  return executeQuery({
    queryFn: async ({ sessionUser }) => {
      const favourites = await db
        .select({
          duration: songs.duration,
        })
        .from(favouriteSongs)
        .innerJoin(songs, eq(favouriteSongs.songId, songs.id))
        .where(eq(favouriteSongs.userId, sessionUser.id));

      const totalSongs = favourites.length;
      const totalSeconds = favourites.reduce(
        (acc, curr) => acc + (curr.duration?.seconds ?? 0),
        0,
      );

      const totalHours = totalSeconds / 3600;

      let totalTime: string;
      if (totalHours >= 1) {
        const hours = Math.floor(totalHours);
        totalTime = `${hours}+ ${hours === 1 ? "hour" : "hours"}`;
      } else {
        const minutes = Math.ceil(totalHours * 60);
        totalTime = `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
      }

      return {
        totalSongs,
        totalTime,
      };
    },
    isProtected: true,
    serverErrorMessage: "getUserFavouriteSongsStats",
  });
};

type InferPreferenceType<T> = unknown extends T ? string : T;
const getUserPreference = async <T = unknown>({
  key,
}: Pick<
  UserPreferenceSchema,
  "key"
>): Promise<InferPreferenceType<T> | null> => {
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
        return JSON.parse(pref.value) as InferPreferenceType<T>;
      } catch {
        return pref.value as InferPreferenceType<T>;
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
  getSongSearchSuggestions,
  getUserLastPlayedSong,
  getUserSongPlayerMode,
  getUserFavouriteSongs,
  getUserFavouriteSongsStats,
  getUserPreference,
  getUserAllPreferences,
  getSongStatus,
  getUserById,
};
