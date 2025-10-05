"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import z from "zod";
import type { SongSchema } from "@/app/_types";
import { db } from "@/db";
import { favouriteSongs, songSchema, songs } from "@/db/schema/song";
import { executeFn } from "@/db/utils";
import { auth } from "@/lib/auth";

const googleSignInUser = async ({
  callbackURL,
  newUserCallbackURL,
}: {
  callbackURL?: string;
  newUserCallbackURL?: string;
} = {}) => {
  const googleSignInUserSchema = z.object({
    callbackURL: z.string().default("/"),
    newUserCallbackURL: z.string().default("/"),
  });
  const {
    callbackURL: parsedCallbackURL,
    newUserCallbackURL: parsedNewUserCallbackURL,
  } = googleSignInUserSchema.parse({ callbackURL, newUserCallbackURL });

  return executeFn({
    fn: async () => {
      const response = await auth.api.signInSocial({
        body: {
          provider: "google",
          callbackURL: parsedCallbackURL,
          newUserCallbackURL: parsedNewUserCallbackURL,
        },
        headers: await headers(),
      });

      return response;
    },
    isProtected: false,
    serverErrorMessage: "googleSignInUser",
  });
};

const toggleUserFavouriteSong = async ({
  song,
  revalidate,
  path,
}: {
  song: SongSchema;
  revalidate?: boolean;
  path?: string;
}) => {
  const toggleUserFavouriteSongSchema = z.object({
    song: songSchema.omit({ category: true }),
    revalidate: z.boolean().default(false),
    path: z.string().default("/fav-songs"),
  });
  const {
    song: parsedSong,
    revalidate: parsedRevalidate,
    path: parsedPath,
  } = toggleUserFavouriteSongSchema.parse({
    song,
    revalidate,
    path,
  });

  return executeFn({
    fn: async ({ sessionUser }) => {
      const userId = sessionUser.id;

      const existingSong = await db
        .select()
        .from(songs)
        .where(eq(songs.id, parsedSong.id))
        .limit(1)
        .then((rows) => rows[0]);

      if (!existingSong) {
        await db.insert(songs).values({
          id: parsedSong.id,
          title: parsedSong.title,
          thumbnail: parsedSong.thumbnail,
          duration: parsedSong.duration,
        });
      }

      const [alreadyFavourite] = await db
        .select()
        .from(favouriteSongs)
        .where(
          and(
            eq(favouriteSongs.userId, userId),
            eq(favouriteSongs.songId, parsedSong.id),
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
              eq(favouriteSongs.songId, parsedSong.id),
            ),
          );
        result = { status: "removed" };
      } else {
        await db.insert(favouriteSongs).values({
          songId: song.id,
          userId,
        });
        result = { status: "added" };
      }

      if (parsedRevalidate) revalidatePath(parsedPath);

      return result;
    },
    isProtected: true,
    serverErrorMessage: "toggleUserFavouriteSong",
  });
};

export { googleSignInUser, toggleUserFavouriteSong };
