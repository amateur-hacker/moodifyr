"use server";

import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { Groq } from "groq-sdk";
import type { Song } from "@/app/search/_types";
import { db } from "@/db";
import { songPlayHistory, songSearchHistory } from "@/db/schema";
import { env } from "@/lib/env";
import { executeAction } from "@/utils/execute-action";
import { executeApi } from "@/utils/execute-api";
import { executeFn } from "@/utils/execute-fn";
import { executeQuery } from "@/utils/execute-query";
import { encodeQueryParam } from "@/utils/url";

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

const searchSong = async ({ query, id }: { query?: string; id?: string }) => {
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
    serverErrorMessage: "getSongSearchHistory",
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

const getAIRecommendedSongNames = async ({ query }: { query: string }) => {
  if (!query?.length) return null;

  const parseResponse = (content: string): string[] =>
    content
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.replace(/^\d+\.\s*/, ""));
  return executeFn({
    fn: async () => {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "Based on a YouTube song title or search query, recommend at least 20 songs that closely match the style, mood, or genre. Provide the recommendations only as a numbered list of song titles, without any additional explanation or commentary.",
          },
          {
            role: "user",
            content: "Ride it song",
          },
          {
            role: "assistant",
            content:
              "1. Ride It  \n2. SICKO MODE – Travis Scott  \n3. Mask Off – Future  \n4. The Box – Roddy Ricch  \n5. Drip Too Hard – Lil Baby & Gunna  \n6. Nonstop – Drake  \n7. Goosebumps – Travis Scott feat. Kendrick Lamar  \n8. Lemonade – Internet Money feat. Don Toliver  \n9. Stir Fry – Migos  \n10. Highest in the Room – Travis Scott",
          },
          {
            role: "user",
            content: "phir kabhi song",
          },
          {
            role: "assistant",
            content:
              "1. Tum Hi Ho  \n2. Teri Meri Kahani  \n3. Ae Dil Hai Mushkil  \n4. Kabhi Kabhi Aditi  \n5. Pal Pal Dil Ke Paas  \n6. Jab Koi Baat Bigad Jaaye  \n7. Saathiya  \n8. Tum Se Hi  \n9. Humsafar  \n10. Hum Saath Saath Hain",
          },
          {
            role: "user",
            content:
              "Shayad - Love Aaj Kal | Kartik | Sara | Arushi | Pritam | Arijit Singh",
          },
          {
            role: "assistant",
            content:
              "1. Tum Hi Ho  \n2. Raabta  \n3. Janam Janam  \n4. Tera Hone Laga Hoon  \n5. Kabhie Kabhie Mere Dil Mein  \n6. Pal Pal Dil Ke Paas  \n7. Mere Haath Mein  \n8. Kabira (Encore)  \n9. Jeene De  \n10. Aashiqui 2 – Tum Hi Ho (Acoustic)",
          },
          {
            role: "user",
            content: query,
          },
        ],
        model: "openai/gpt-oss-20b",
        temperature: 1,
        max_completion_tokens: 8192,
        top_p: 1,
        stream: false,
        reasoning_effort: "high",
        stop: null,
      });

      const response = chatCompletion?.choices?.[0].message?.content;
      const parsedResponse = response?.length ? parseResponse(response) : null;
      return parsedResponse;
    },
    isProtected: true,
    serverErrorMessage: "getAIRecommendedSongs",
  });
};

const getSongPlayHistoryByDateRange = ({
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
          title: songPlayHistory.title,
          count: sql<number>`COUNT(*)`,
        })
        .from(songPlayHistory)
        .where(
          and(
            eq(songPlayHistory.userId, sessionUser?.id as string),
            gte(songPlayHistory.playedAt, startDate),
            lte(songPlayHistory.playedAt, endDate),
          ),
        )
        .groupBy(songPlayHistory.title)
        .orderBy(desc(sql`COUNT(*)`));

      return history.map((h) => `${h.title} (${h.count})`);
    },
    isProtected: true,
    serverErrorMessage: "getSongPlayHistoryByDateRange",
  });
};

const getMostPlayedSongByDateRange = ({
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
          title: songPlayHistory.title,
          thumbnail: songPlayHistory.thumbnail,
          count: sql<number>`COUNT(*)`,
        })
        .from(songPlayHistory)
        .where(
          and(
            eq(songPlayHistory.userId, sessionUser?.id as string),
            gte(songPlayHistory.playedAt, startDate),
            lte(songPlayHistory.playedAt, endDate),
          ),
        )
        .groupBy(songPlayHistory.title, songPlayHistory.thumbnail)
        .orderBy(desc(sql`COUNT(*)`));

      const songs = count ? await query.limit(count) : await query;

      return songs.map((s) => ({
        title: s.title,
        thumbnail: s.thumbnail,
        times: s.count,
      }));
    },
    isProtected: true,
    serverErrorMessage: "getMostPlayedSongByDateRange",
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
  getAIRecommendedSongNames,
  getSongPlayHistoryByDateRange,
  getMostPlayedSongByDateRange,
};
