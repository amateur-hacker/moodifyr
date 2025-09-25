"use server";

import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { getMoodMessage } from "@/app/dashboard/utils";
import { db } from "@/db";
import { songAnalyticsPlayHistory, songs } from "@/db/schema";
import { executeQuery } from "@/db/utils";
import { convertToLocalTZ } from "@/lib/utils";

const getUserSongAnalyticsPlayHistoryByDateRange = async ({
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
        .from(songAnalyticsPlayHistory)
        .leftJoin(songs, eq(songs.id, songAnalyticsPlayHistory.songId))
        .where(
          and(
            eq(songAnalyticsPlayHistory.userId, sessionUser?.id as string),
            gte(songAnalyticsPlayHistory.playedAt, startDate),
            lte(songAnalyticsPlayHistory.playedAt, endDate),
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
    serverErrorMessage: "getUserSongAnalyticsPlayHistoryByDateRange",
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
        .from(songAnalyticsPlayHistory)
        .leftJoin(songs, eq(songs.id, songAnalyticsPlayHistory.songId))
        .where(
          and(
            eq(songAnalyticsPlayHistory.userId, sessionUser?.id as string),
            gte(songAnalyticsPlayHistory.playedAt, startDate),
            lte(songAnalyticsPlayHistory.playedAt, endDate),
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

type MoodResult = {
  mood: string;
  message: string;
};
type MoodCategory =
  | "Happy"
  | "Sad"
  | "Romantic"
  | "Energetic"
  | "Calm"
  | "Motivational"
  | "Emotional"
  | "Unknown"
  | "Neutral";

const CATEGORY_EMOJI: Record<MoodCategory, string> = {
  Happy: "😄",
  Sad: "😔",
  Romantic: "💖",
  Energetic: "⚡",
  Calm: "😌",
  Motivational: "💪",
  Emotional: "😢",
  Unknown: "🤔",
  Neutral: "⚖",
};
const getUserMoodBySongHistory = async ({
  startDate,
  endDate,
}: {
  startDate: Date;
  endDate: Date;
}) => {
  return executeQuery({
    queryFn: async ({ sessionUser }) => {
      if (!sessionUser?.id) return null;

      const rows = await db
        .select({
          category: songs.category,
          times: sql<number>`COUNT(*)`,
        })
        .from(songAnalyticsPlayHistory)
        .leftJoin(songs, eq(songs.id, songAnalyticsPlayHistory.songId))
        .where(
          and(
            eq(songAnalyticsPlayHistory.userId, sessionUser.id),
            gte(songAnalyticsPlayHistory.playedAt, startDate),
            lte(songAnalyticsPlayHistory.playedAt, endDate),
          ),
        )
        .groupBy(songs.category)
        .orderBy(desc(sql`COUNT(*)`));

      if (!rows?.length) return null;

      const counts: Record<string, number> = {};
      let totalPlays = 0;
      for (const r of rows) {
        const cat = (r.category as string) ?? "Unknown";
        const n = Number(r.times || 0);
        counts[cat] = (counts[cat] || 0) + n;
        totalPlays += n;
      }

      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      const [topCategory, topCount] = sorted[0];

      const today = convertToLocalTZ(new Date());
      const isTodayIncluded =
        (startDate.getFullYear() === today.getFullYear() &&
          startDate.getMonth() === today.getMonth() &&
          startDate.getDate() === today.getDate()) ||
        (endDate.getFullYear() === today.getFullYear() &&
          endDate.getMonth() === today.getMonth() &&
          endDate.getDate() === today.getDate());

      if (totalPlays > 0 && topCount / totalPlays >= 0.7) {
        if (topCategory in CATEGORY_EMOJI) {
          const emoji = CATEGORY_EMOJI[topCategory as MoodCategory];
          const mood = `${emoji} ${topCategory}`;
          const message = getMoodMessage(
            topCategory as MoodCategory,
            isTodayIncluded,
          );

          return { mood, message } as MoodResult;
        }
      }

      return {
        mood: `${CATEGORY_EMOJI.Neutral} Neutral`,
        message: getMoodMessage("Neutral", isTodayIncluded),
      };
    },
    isProtected: true,
    serverErrorMessage: "getUserMoodBySongHistory",
  });
};

const getUserDashboardData = async ({
  startDate,
  endDate,
}: {
  startDate: Date;
  endDate: Date;
}) => {
  return executeQuery({
    queryFn: async ({ sessionUser }) => {
      if (!sessionUser?.id) return null;

      const songHistory = await getUserSongAnalyticsPlayHistoryByDateRange({
        startDate,
        endDate,
      });

      const moodResult = songHistory?.length
        ? await getUserMoodBySongHistory({ startDate, endDate })
        : null;

      const top5 = await getUserMostPlayedSongByDateRange({
        startDate,
        endDate,
        count: 5,
      });

      const result = {
        mood: moodResult,
        topSongs: top5 ?? [],
      };
      return result;
    },
    isProtected: true,
    serverErrorMessage: "getUserDashboardData",
  });
};

export {
  getUserSongAnalyticsPlayHistoryByDateRange,
  getUserMostPlayedSongByDateRange,
  getUserMoodBySongHistory,
  getUserDashboardData,
};
