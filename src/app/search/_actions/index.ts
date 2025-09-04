"use server";

import { and, desc, eq } from "drizzle-orm";
import type { Song } from "@/app/search/_types";
import { db } from "@/db";
import { songPlayHistory, songSearchHistory } from "@/db/schema";
import { env } from "@/lib/env";
import { executeAction } from "@/utils/execute-action";
import { executeApi } from "@/utils/execute-api";
import { executeQuery } from "@/utils/execute-query";
import { encodeQueryParam } from "@/utils/url";

type SearchSongArgs = {
  query?: string;
  id?: string;
};
const searchSong = async ({ query, id }: SearchSongArgs) => {
  if ((!query && !id) || (query && id)) {
    return null;
  }

  const url = query
    ? `${env.API_BASE_URL}/search?q=${encodeQueryParam(query)}`
    : `${env.API_BASE_URL}/search?id=${id}`;

  return executeApi({
    apiFn: async (): Promise<
      { success: true; songs: Song[] } | { success: false; message: string }
    > =>
      (
        await fetch(url, {
          cache: "force-cache",
          next: { revalidate: 10 * 60 },
        })
      ).json(),
    isProtected: false,
    serverErrorMessage: "searchSong",
  });
};

const trackSongPlayHistory = ({ song }: { song: Song }) => {
  return executeAction({
    actionFn: async ({ sessionUser }) =>
      await db.insert(songPlayHistory).values({
        userId: sessionUser?.id as string,
        songId: song.id,
        title: song.title,
        url: song.url,
        thumbnail: song.thumbnail,
        duration: song.duration.timestamp,
        seconds: song.duration.seconds,
      }),
    isProtected: true,
    clientSuccessMessage: "Song play history tracked successfully.",
    serverErrorMessage: "trackSongPlayHistory",
  });
};

const trackSongSearchHistory = ({ query }: { query: string }) => {
  return executeAction({
    actionFn: async ({ sessionUser }) =>
      await db.insert(songSearchHistory).values({
        userId: sessionUser?.id as string,
        query,
      }),
    isProtected: true,
    clientSuccessMessage: "Search history tracked successfully.",
    serverErrorMessage: "trackSearchHistory",
  });
};

const getSongPlayHistory = ({
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
    serverErrorMessage: "getSongPlayHistory",
  });
};

const getSongSearchHistory = ({
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
    serverErrorMessage: "getSearchHistory",
  });
};

const getLastPlayedSong = () => {
  return executeQuery({
    queryFn: async ({ sessionUser }) => {
      const last = await db.query.songPlayHistory.findFirst({
        where: eq(songPlayHistory.userId, sessionUser?.id as string),
        orderBy: [desc(songPlayHistory.playedAt)],
      });

      return last;
    },
    isProtected: true,
    serverErrorMessage: "getLastPlayedSong",
  });
};

const removeSongPlayHistory = ({ id }: { id: string }) => {
  return executeAction({
    actionFn: async ({ sessionUser }) => {
      await db
        .delete(songPlayHistory)
        .where(
          and(
            eq(songPlayHistory.id, id),
            eq(songPlayHistory.userId, sessionUser?.id as string),
          ),
        );
    },
    isProtected: true,
    clientSuccessMessage: "Song play history removed successfully.",
    serverErrorMessage: "removeSongPlayHistory",
  });
};

const removeSongSearchHistory = ({ id }: { id: string }) => {
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
    serverErrorMessage: "removeSongSearchHistory",
  });
};

export {
  searchSong,
  trackSongPlayHistory,
  trackSongSearchHistory,
  getSongPlayHistory,
  getSongSearchHistory,
  getLastPlayedSong,
  removeSongPlayHistory,
  removeSongSearchHistory,
};
