"use server";

import { and, eq } from "drizzle-orm";
import type { Song } from "@/app/search/_types";
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

const toggleUserFavouriteSong = ({ song }: { song: Song }) => {
  return executeFn({
    fn: async ({ sessionUser }) => {
      const userId = sessionUser?.id as string;

      const [alreadyFavourite] = await db
        .select({ id: favouriteSongs.id })
        .from(favouriteSongs)
        .where(
          and(
            eq(favouriteSongs.userId, userId),
            eq(favouriteSongs.id, song.id),
          ),
        )
        .limit(1);

      if (alreadyFavourite) {
        await db
          .delete(favouriteSongs)
          .where(
            and(
              eq(favouriteSongs.userId, userId),
              eq(favouriteSongs.id, song.id),
            ),
          );
        return { status: "removed" as const };
      } else {
        await db.insert(favouriteSongs).values({
          id: song.id,
          userId,
          title: song.title,
          url: song.url,
          thumbnail: song.thumbnail,
          seconds: song.duration.seconds,
        });
        return { status: "added" as const };
      }
    },
    isProtected: true,
    serverErrorMessage: "toggleUserFavouriteSong",
  });
};

export { classifySongCategory, toggleUserFavouriteSong };
