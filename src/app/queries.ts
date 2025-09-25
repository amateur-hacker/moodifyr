"use server";

import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import type { SearchSong, SongWithUniqueId } from "@/app/_types";
import { db } from "@/db";
import { songSearchHistory } from "@/db/schema";
import { favouriteSongs, songPlayHistory, songs } from "@/db/schema/song";
import { executeQuery } from "@/db/utils";
import { auth } from "@/lib/auth";
import { v4 as uuid } from "uuid";

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

const getUserLastPlayedSong = async (): Promise<SongWithUniqueId | null> => {
  const song = await getUserPreference<SongWithUniqueId>({
    key: "lastPlayedSong",
  });
  if (!song) return null;

  return song as SongWithUniqueId;
};

// const getUserLastPlayedSong = () => {
//   const formatTimestamp = (seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, "0")}`;
//   };
//
//   return executeQuery({
//     queryFn: async ({ sessionUser }) => {
//       const results = await db
//         .select({
//           id: songs.id,
//           title: songs.title,
//           thumbnail: songs.thumbnail,
//           duration: songs.duration,
//           playedAt: songPlayHistory.playedAt,
//         })
//         .from(songPlayHistory)
//         .innerJoin(songs, eq(songPlayHistory.songId, songs.id))
//         .where(eq(songPlayHistory.userId, sessionUser?.id as string))
//         .orderBy(desc(songPlayHistory.playedAt))
//         .limit(1);
//
//       const latestPlay = results[0];
//       if (!latestPlay) return null;
//
//       const lastPlayedSong: SearchSong = {
//         id: latestPlay.id,
//         searchId: uuid(),
//         title: latestPlay.title,
//         thumbnail: latestPlay.thumbnail,
//         duration: {
//           timestamp: latestPlay.duration.timestamp,
//           seconds: latestPlay.duration.seconds,
//         },
//       };
//
//       return lastPlayedSong;
//     },
//     isProtected: true,
//     serverErrorMessage: "getUserLastPlayedSong",
//   });
// };

const getUserFavouriteSongs = () => {
  // const formatTimestamp = (seconds: number) => {
  //   const mins = Math.floor(seconds / 60);
  //   const secs = seconds % 60;
  //   return `${mins}:${secs.toString().padStart(2, "0")}`;
  // };

  return executeQuery({
    queryFn: async ({ sessionUser }) => {
      const favourites = await db
        .select({
          id: favouriteSongs.id,
          songId: favouriteSongs.songId,
          title: favouriteSongs.title,
          thumbnail: favouriteSongs.thumbnail,
          duration: favouriteSongs.duration,
        })
        .from(favouriteSongs)
        .where(eq(favouriteSongs.userId, sessionUser?.id as string));

      return favourites.map((fav) => ({
        id: fav.songId,
        favouriteId: fav.id,
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
}: {
  key: string;
}): Promise<T | string | null> => {
  return executeQuery({
    queryFn: async ({ sessionUser }) => {
      if (!sessionUser?.id) return null;

      const pref = await db.query.userPreferences.findFirst({
        where: (prefs, { eq, and }) =>
          and(eq(prefs.userId, sessionUser.id), eq(prefs.key, key)),
      });

      // return pref ? JSON.parse(pref.value) : null;
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

const getSongStatus = async ({ youtubeId }: { youtubeId: string }) => {
  return executeQuery({
    queryFn: async () => {
      const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${youtubeId}`;
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

export {
  getUserSession,
  getUserSongSearchHistory,
  getUserLastPlayedSong,
  getUserFavouriteSongs,
  getUserPreference,
  getUserAllPreferences,
  getSongStatus,
};
