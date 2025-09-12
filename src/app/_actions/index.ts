"use server";

import { endOfDay, format, startOfDay } from "date-fns";
import { Groq } from "groq-sdk";
import { headers } from "next/headers";
import {
  getMostPlayedSongByDateRange,
  getSongPlayHistoryByDateRange,
} from "@/app/search/_actions";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { redis } from "@/lib/redis";
import { convertToLocalTZ } from "@/utils/date";
import { executeFn } from "@/utils/execute-fn";
import { db } from "@/db";
import { songPlayHistory, songs } from "@/db/schema";
import { and, eq, sql, gte, lte, desc } from "drizzle-orm";

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

const getServerSession = async () => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    return session;
  } catch (err) {
    console.error("Failed to fetch server session:", err);
    return null;
  }
};

// type MoodResult = {
//   mood: string;
//   message: string;
// };
// const getUserMoodBySongHistory = async ({
//   songHistory,
//   startDate,
//   endDate,
// }: {
//   songHistory: string[];
//   startDate: Date;
//   endDate: Date;
// }) => {
//   if (!songHistory?.length) return null;
//
//   const songHistoryInput = songHistory.join(", ");
//
//   const startDateStr = format(
//     convertToLocalTZ(startOfDay(startDate)),
//     "yyyy-MM-dd'T'HH:mm:ss",
//   );
//   const endDateStr = format(
//     convertToLocalTZ(endOfDay(endDate)),
//     "yyyy-MM-dd'T'HH:mm:ss",
//   );
//
//   const today = convertToLocalTZ(new Date());
//   const isTodayIncluded =
//     (startDate.getFullYear() === today.getFullYear() &&
//       startDate.getMonth() === today.getMonth() &&
//       startDate.getDate() === today.getDate()) ||
//     (endDate.getFullYear() === today.getFullYear() &&
//       endDate.getMonth() === today.getMonth() &&
//       endDate.getDate() === today.getDate());
//
//   return executeFn({
//     fn: async () => {
//       const chatCompletion = await groq.chat.completions.create({
//         messages: [
//           {
//             role: "system",
//             content: `You are a mood-describer for a music app dashboard.
// The user will send you a compressedHistoryString that contains song names and the date range they were played (e.g., "[YYYY-MM-DD to YYYY-MM-DD]").
// If the end date of the range is today, describe the mood using present tense.
// Otherwise, use past tense.
// Use both the song names, their frequencies, and the date range to infer the user's mood for that period.
//
// Respond ONLY in valid JSON format:
//
// {
//   "mood": "😔 Sad",
//   "message": "Maybe you are missing someone very deeply during that period."
// }
//
// {
//   "mood": "⚡ Energy",
//   "message": "You’re super charged during this time, maybe something exciting was happening!"
// }
//
// Rules:
// - mood = emoji + 1–2 word mood tag (no markdown or bolding)
// - message = short, friendly, conversational sentence
// - Keep your words simple and easy to understand
// - Make the user smile or nod
// - Output must be a single JSON object with keys: mood, message
// - Do not include any extra text outside JSON
// - Date range: ${startDateStr} to ${endDateStr}
// - Present tense: ${isTodayIncluded}`,
//           },
//           {
//             role: "user",
//             content: songHistoryInput,
//           },
//         ],
//         model: "openai/gpt-oss-20b",
//         temperature: 1,
//         max_completion_tokens: 8192,
//         top_p: 1,
//         stream: false,
//         reasoning_effort: "high",
//         stop: null,
//       });
//
//       const response = chatCompletion?.choices?.[0]?.message?.content?.trim();
//       if (!response) return null;
//
//       try {
//         const result = JSON.parse(response) as MoodResult;
//         return result;
//       } catch (err) {
//         console.error("Failed to parse mood JSON:", err);
//         return null;
//       }
//     },
//     isProtected: true,
//     serverErrorMessage: "getUserMoodBySongHistory",
//   });
// };

type MoodResult = {
  mood: string;
  message: string;
};
const CATEGORY_EMOJI: Record<string, string> = {
  Happy: "😄",
  Sad: "😔",
  Romantic: "💖",
  Energetic: "⚡",
  Calm: "😌",
  Motivational: "💪",
  Melancholy: "😢",
  Unknown: "🤔",
};
const getUserMoodBySongHistory = async ({
  startDate,
  endDate,
}: {
  startDate: Date;
  endDate: Date;
}) => {
  return executeFn({
    fn: async ({ sessionUser }) => {
      if (!sessionUser?.id) return null;

      const rows = await db
        .select({
          category: songs.mood,
          times: sql<number>`COUNT(*)`,
        })
        .from(songPlayHistory)
        .leftJoin(songs, eq(songs.id, songPlayHistory.songId))
        .where(
          and(
            eq(songPlayHistory.userId, sessionUser.id),
            gte(songPlayHistory.playedAt, startDate),
            lte(songPlayHistory.playedAt, endDate),
          ),
        )
        .groupBy(songs.mood)
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
      const compactLines = sorted.map(
        ([cat, n]) => `${cat}: ${n} ${n === 1 ? "play" : "plays"}`,
      );
      const songHistoryInput = compactLines.join("\n");

      const today = convertToLocalTZ(new Date());
      const isTodayIncluded =
        (startDate.getFullYear() === today.getFullYear() &&
          startDate.getMonth() === today.getMonth() &&
          startDate.getDate() === today.getDate()) ||
        (endDate.getFullYear() === today.getFullYear() &&
          endDate.getMonth() === today.getMonth() &&
          endDate.getDate() === today.getDate());

      const [topCategory, topCount] = sorted[0];
      if (totalPlays > 0 && topCount / totalPlays >= 0.7) {
        const emoji = CATEGORY_EMOJI[topCategory] || "";
        const mood = `${emoji} ${topCategory}`;

        const message = isTodayIncluded
          ? `You are mostly ${topCategory.toLowerCase()} right now.`
          : `You were mostly ${topCategory.toLowerCase()} during this period.`;

        return { mood, message } as MoodResult;
      }

      const formatLocalDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };
      const startDateStr = formatLocalDate(startDate);
      const endDateStr = formatLocalDate(endDate);

      const systemPrompt = `You are a mood-describer for a music app dashboard.
The user will send a compact list of categories and counts (one per line) in the form:
"Category: N plays"
Use the counts and categories to infer the user's overall mood for the date range.
If the end date is today, use present tense. Otherwise use past tense.

Respond ONLY with a single valid JSON object (no extra text) with keys:
{
  "mood": "😔 Sad",
  "message": "Short friendly one-liner"
}

Rules:
- mood = emoji + 1–2 word tag (no markdown)
- message = short, friendly, conversational sentence
- Keep it simple and make the user smile or nod
- Date range: ${startDateStr} to ${endDateStr}
- Present tense: ${isTodayIncluded}`;

      const userContent = songHistoryInput;

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        model: "openai/gpt-oss-20b",
        temperature: 1,
        max_completion_tokens: 8192,
        top_p: 1,
        stream: false,
        reasoning_effort: "high",
      });

      const raw = chatCompletion?.choices?.[0]?.message?.content?.trim();
      if (!raw) return null;

      const tryParse = (text: string) => {
        try {
          return JSON.parse(text) as MoodResult;
        } catch {
          const m = text.match(/\{[\s\S]*\}/);
          if (m) {
            try {
              return JSON.parse(m[0]) as MoodResult;
            } catch (e) {
              return null;
            }
          }
          return null;
        }
      };

      const parsed = tryParse(raw);
      if (!parsed) {
        console.error(
          "getUserMoodBySongHistory: failed to parse LLM output:",
          raw,
        );
        return null;
      }

      return parsed;
    },
    isProtected: true,
    serverErrorMessage: "getUserMoodBySongHistory",
  });
};

type DashboardDataCachedResult = {
  mood: {
    mood: string;
    message: string;
  } | null;
  topSongs: {
    title: string;
    thumbnail: string;
    mood: string;
    times: number;
  }[];
};
const getDashboardData = async ({
  startDate,
  endDate,
  secondsUntilMidnight,
}: {
  startDate: Date;
  endDate: Date;
  secondsUntilMidnight: number;
}) => {
  return executeFn({
    fn: async ({ sessionUser }) => {
      const rangeKey = `${sessionUser?.id as string}_${startDate.toISOString().split("T")[0]}_${
        endDate.toISOString().split("T")[0]
      }`;

      const cachedResult = await redis.get<DashboardDataCachedResult>(rangeKey);
      if (cachedResult) {
        return cachedResult;
      }

      const songHistory = await getSongPlayHistoryByDateRange({
        startDate,
        endDate,
      });

      const moodResult = songHistory?.length
        ? await getUserMoodBySongHistory({ startDate, endDate })
        : null;

      const top5 = await getMostPlayedSongByDateRange({
        startDate,
        endDate,
        count: 5,
      });

      const result = { mood: moodResult, topSongs: top5 ?? [] };

      if (moodResult || top5?.length) {
        await redis.set(rangeKey, JSON.stringify(result), {
          ex: secondsUntilMidnight,
        });
      }

      return result;
    },
    isProtected: true,
    serverErrorMessage: "getDashboardData",
  });
};

export { getServerSession, getUserMoodBySongHistory, getDashboardData };
