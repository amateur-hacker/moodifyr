"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { Song } from "@/app/_types";
import { db } from "@/db";
import { favouriteSongs } from "@/db/schema";
import { executeFn } from "@/db/utils";
import { groq } from "@/lib/groq";

const classifySongCategory = async ({ title }: { title: string }) => {
  if (!title?.length) return null;

  return executeFn({
    fn: async () => {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `
You are a music category classifier.
Given the song details (title and description), return ONLY one category
from this fixed set: ["Happy", "Sad", "Romantic", "Energetic", "Calm", "Motivational", "Emotional", "Unknown"].

Answer with only the category word, nothing else.
            `,
          },
          { role: "user", content: `Song title: ${title}` },
        ],
        model: "openai/gpt-oss-20b",
        temperature: 1,
        max_completion_tokens: 8192,
        top_p: 1,
        stream: false,
        reasoning_effort: "high",
      });

      const response = chatCompletion?.choices?.[0]?.message?.content?.trim();
      return response ?? null;
    },
    isProtected: true,
    serverErrorMessage: "classifySongCategory",
  });
};

const toggleUserFavouriteSong = ({
  song,
  revalidate = false,
  path = "/fav-songs",
}: {
  song: Song;
  revalidate?: boolean;
  path?: string;
}) => {
  return executeFn({
    fn: async ({ sessionUser }) => {
      const userId = sessionUser?.id as string;

      const [alreadyFavourite] = await db
        .select()
        .from(favouriteSongs)
        .where(
          and(
            eq(favouriteSongs.userId, userId),
            eq(favouriteSongs.songId, song.id),
          ),
        )
        .limit(1);

      let result: { status: "removed" | "added" };

      if (alreadyFavourite) {
        await db
          .delete(favouriteSongs)
          .where(
            and(
              eq(favouriteSongs.userId, userId),
              eq(favouriteSongs.songId, song.id),
            ),
          );
        result = { status: "removed" };
      } else {
        await db.insert(favouriteSongs).values({
          songId: song.id,
          userId,
          title: song.title,
          thumbnail: song.thumbnail,
          duration: {
            timestamp: song.duration.timestamp,
            seconds: song.duration.seconds,
          },
        });
        result = { status: "added" };
      }

      if (revalidate) revalidatePath(path);

      return result;
    },
    isProtected: true,
    serverErrorMessage: "toggleUserFavouriteSong",
  });
};

export { classifySongCategory, toggleUserFavouriteSong };
