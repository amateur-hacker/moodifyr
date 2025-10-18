"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import z from "zod";
import type { Prettify, SongSchema } from "@/app/_types";
import { db } from "@/db";
import { songs } from "@/db/schema";
import {
  type MoodlistFollowerSchema,
  type MoodlistSchema,
  type MoodlistSongSchema,
  moodlistFollowers,
  moodlistSchema,
  moodlistSongSchema,
  moodlistSongs,
  moodlists,
} from "@/db/schema/moodlists";
import { songSchema } from "@/db/schema/song";
import { executeAction } from "@/db/utils";

const createUserMoodlist = async ({ name }: Pick<MoodlistSchema, "name">) => {
  const createUserMoodlistSchema = moodlistSchema.pick({ name: true });
  const { name: parsedName } = createUserMoodlistSchema.parse({ name });

  return executeAction({
    actionFn: async ({ sessionUser }) => {
      const existing = await db.query.moodlists.findFirst({
        where: (m, { eq, and }) =>
          and(eq(m.userId, sessionUser.id), eq(m.name, parsedName)),
      });

      if (existing) {
        throw new Error("You already have a moodlist with this name");
      }

      await db.insert(moodlists).values({
        userId: sessionUser.id,
        name: parsedName,
      });

      revalidatePath("/moodlists");
    },
    isProtected: true,
    clientSuccessMessage: "Moodlist created successfully",
    serverErrorMessage: "createUserMoodlist",
  });
};

const updateUserMoodlistName = async ({
  id,
  name,
}: Pick<MoodlistSchema, "id" | "name">) => {
  const updateUserMoodlistSchema = moodlistSchema.pick({
    id: true,
    name: true,
  });
  const { name: parsedName, id: parsedId } = updateUserMoodlistSchema.parse({
    name,
    id,
  });

  return executeAction({
    actionFn: async ({ sessionUser }) => {
      await db
        .update(moodlists)
        .set({ name: parsedName })
        .where(
          and(eq(moodlists.id, parsedId), eq(moodlists.userId, sessionUser.id)),
        );

      revalidatePath("/moodlists");
    },
    isProtected: true,
    clientSuccessMessage: "Moodlist name updated successfully",
    serverErrorMessage: "updateUserMoodlistName",
  });
};

const deleteUserMoodlist = async ({ id }: Pick<MoodlistSchema, "id">) => {
  const deleteUserMoodlistSchema = moodlistSchema.pick({
    id: true,
  });
  const { id: parsedId } = deleteUserMoodlistSchema.parse({ id });

  return executeAction({
    actionFn: async ({ sessionUser }) => {
      await db
        .delete(moodlists)
        .where(
          and(eq(moodlists.id, parsedId), eq(moodlists.userId, sessionUser.id)),
        );
      revalidatePath("/moodlists");
    },
    isProtected: true,
    clientSuccessMessage: "Moodlist deleted successfully",
    serverErrorMessage: "deleteUserMoodlist",
  });
};

const addUserSongToMoodlist = async ({
  moodlistId,
  songId,
  song,
}: Prettify<
  Pick<MoodlistSongSchema, "moodlistId" | "songId"> & { song: SongSchema }
>) => {
  const addUserSongToMoodlistSchema = moodlistSongSchema.pick({
    moodlistId: true,
    songId: true,
  });
  const {
    moodlistId: parsedMoodlistId,
    songId: parsedSongId,
    song: parsedSong,
  } = addUserSongToMoodlistSchema
    .extend({ song: songSchema })
    .parse({ moodlistId, songId, song });

  return executeAction({
    actionFn: async ({ sessionUser }) => {
      const existingSong = await db.query.songs.findFirst({
        where: (s, { eq }) => eq(s.id, parsedSongId),
      });

      if (!existingSong) {
        await db.insert(songs).values({
          id: parsedSong.id,
          title: parsedSong.title,
          thumbnail: parsedSong.thumbnail,
          duration: parsedSong.duration,
        });
      }

      const existingEntry = await db.query.moodlistSongs.findFirst({
        where: and(
          eq(moodlistSongs.moodlistId, parsedMoodlistId),
          eq(moodlistSongs.songId, parsedSongId),
          eq(moodlistSongs.userId, sessionUser.id),
        ),
      });

      if (existingEntry) {
        throw new Error("You have already added this song");
      }

      await db.insert(moodlistSongs).values({
        moodlistId: parsedMoodlistId,
        songId: parsedSongId,
        userId: sessionUser.id,
      });
    },
    isProtected: true,
    clientSuccessMessage: "Song added to moodlist",
    serverErrorMessage: "addUserSongToMoodlist",
  });
};

const removeUserSongFromMoodlist = async ({
  songId,
  moodlistId,
}: Pick<MoodlistSongSchema, "songId"> & { moodlistId: string }) => {
  const removeUserSongFromMoodlistSchema = z.object({
    songId: moodlistSongSchema.shape.songId,
    moodlistId: z.uuid(),
  });
  const { songId: parsedSongId, moodlistId: parsedMoodlistId } =
    removeUserSongFromMoodlistSchema.parse({
      songId,
      moodlistId,
    });

  return executeAction({
    actionFn: async ({ sessionUser }) => {
      await db
        .delete(moodlistSongs)
        .where(
          and(
            eq(moodlistSongs.id, parsedSongId),
            eq(moodlistSongs.userId, sessionUser.id),
          ),
        );
      revalidatePath(`/moodlists/${parsedMoodlistId}`);
    },
    isProtected: true,
    clientSuccessMessage: "Song removed from moodlist",
    serverErrorMessage: "removeUserSongFromMoodlist",
  });
};

const followUserMoodlist = async ({
  moodlistId,
}: Pick<MoodlistFollowerSchema, "moodlistId">) => {
  const followUserMoodlistSchema = z.object({
    moodlistId: moodlistSchema.shape.id,
  });
  const { moodlistId: parsedMoodlistId } = followUserMoodlistSchema.parse({
    moodlistId,
  });

  return executeAction({
    actionFn: async ({ sessionUser }) => {
      const alreadyFollowing = await db.query.moodlistFollowers.findFirst({
        where: (mf, { eq, and }) =>
          and(
            eq(mf.userId, sessionUser.id),
            eq(mf.moodlistId, parsedMoodlistId),
          ),
      });

      if (alreadyFollowing) {
        throw new Error("You are already following this moodlist.");
      }

      await db.insert(moodlistFollowers).values({
        moodlistId: parsedMoodlistId,
        userId: sessionUser.id,
      });
    },
    isProtected: true,
    clientSuccessMessage: "Moodlist followed",
    serverErrorMessage: "followUserMoodlist",
  });
};

const unfollowUserMoodlist = async ({
  moodlistId,
}: Pick<MoodlistFollowerSchema, "moodlistId">) => {
  const unfollowUserMoodlistSchema = z.object({
    moodlistId: moodlistSchema.shape.id,
  });
  const { moodlistId: parsedMoodlistId } = unfollowUserMoodlistSchema.parse({
    moodlistId,
  });

  return executeAction({
    actionFn: async ({ sessionUser }) => {
      await db
        .delete(moodlistFollowers)
        .where(
          and(
            eq(moodlistFollowers.moodlistId, parsedMoodlistId),
            eq(moodlistFollowers.userId, sessionUser.id),
          ),
        );
    },
    isProtected: true,
    clientSuccessMessage: "Moodlist unfollowed",
    serverErrorMessage: "unfollowUserMoodlist",
  });
};

export {
  createUserMoodlist,
  updateUserMoodlistName,
  deleteUserMoodlist,
  addUserSongToMoodlist,
  removeUserSongFromMoodlist,
  followUserMoodlist,
  unfollowUserMoodlist,
};
