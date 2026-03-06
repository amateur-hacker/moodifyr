"use server";

import {
  format,
  isThisYear,
  isToday,
  isYesterday,
  startOfWeek,
} from "date-fns";
import { desc, eq } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import { songPlayHistory, songs } from "@/db/schema/song";
import { executeQuery } from "@/db/utils";
import { convertToLocalTZ } from "@/lib/utils";

const getUserSongPlayHistory = ({
  page,
  limit,
}: {
  page?: number;
  limit?: number;
} = {}) => {
  const getUserSongPlayHistorySchema = z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(10).max(25).default(25),
  });
  const { page: parsedPage, limit: parsedLimit } =
    getUserSongPlayHistorySchema.parse({ page, limit });

  const formatSongHistoryDate = (utcDate: Date) => {
    const localDate = convertToLocalTZ(utcDate);
    const now = new Date();

    if (isToday(localDate)) return "Today";
    if (isYesterday(localDate)) return "Yesterday";

    const weekStart = startOfWeek(now, { weekStartsOn: 0 });
    if (localDate >= weekStart) return format(localDate, "EEE");

    if (isThisYear(localDate)) return format(localDate, "MMM d");

    return format(localDate, "MMM d yyyy");
  };

  return executeQuery({
    queryFn: async ({ sessionUser }) => {
      const offset = (parsedPage - 1) * parsedLimit;

      const history = await db
        .select({
          id: songPlayHistory.id,
          songId: songs.id,
          title: songs.title,
          thumbnail: songs.thumbnail,
          duration: songs.duration,
          playedAt: songPlayHistory.playedAt,
        })
        .from(songPlayHistory)
        .innerJoin(songs, eq(songPlayHistory.songId, songs.id))
        .where(eq(songPlayHistory.userId, sessionUser.id))
        .orderBy(desc(songPlayHistory.playedAt))
        .limit(parsedLimit)
        .offset(offset);

      const mapped = history.map((item) => ({
        id: item.songId,
        historyId: item.id,
        title: item.title,
        thumbnail: item.thumbnail,
        duration: {
          timestamp: item.duration.timestamp,
          seconds: item.duration.seconds,
        },
      }));

      const grouped: Record<string, typeof mapped> = {};
      history.forEach((item, i) => {
        const dateKey = formatSongHistoryDate(item.playedAt);
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(mapped[i]);
      });

      return grouped;
    },
    isProtected: true,
    serverErrorMessage: "getUserSongPlayHistory",
  });
};

export { getUserSongPlayHistory };
