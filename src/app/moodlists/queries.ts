"use server";

import { asc, eq, and } from "drizzle-orm";
import { db } from "@/db";
import {
  type MoodlistFollowerSchema,
  type MoodlistSchema,
  type MoodlistSongSchema,
  moodlistFollowers,
  moodlistSongSchema,
  moodlistSongs,
  moodlists,
} from "@/db/schema/moodlists";
import { songs } from "@/db/schema/song";
import { executeQuery } from "@/db/utils";
import { users } from "@/db/schema";
import { type UserSchema, userSchema } from "@/db/schema/auth";
import z from "zod";

const getMoodlistById = async ({ id }: Pick<MoodlistSchema, "id">) =>
  executeQuery({
    queryFn: async () => {
      return db.query.moodlists.findFirst({
        where: eq(moodlists.id, id),
        with: {
          songs: {
            with: {
              song: true,
            },
          },
        },
      });
    },
    isProtected: false,
    serverErrorMessage: "getMoodlistById",
  });

// const getUserMoodlists = async () =>
//   executeQuery({
//     queryFn: async ({ sessionUser }) => {
//       return db.query.moodlists.findMany({
//         where: eq(moodlists.userId, sessionUser?.id as string),
//         orderBy: (m, { asc }) => [asc(m.createdAt)],
//       });
//     },
//     isProtected: true,
//     serverErrorMessage: "getUserMoodlists",
//   });

const getUserMoodlists = async () =>
  executeQuery({
    queryFn: async ({ sessionUser }) => {
      // const owned = await db.query.moodlists.findMany({
      //   where: eq(moodlists.userId, sessionUser.id),
      //   orderBy: (m, { asc }) => [asc(m.createdAt)],
      // });
      const owned = await db
        .select({
          id: moodlists.id,
          name: moodlists.name,
          userId: moodlists.userId,
        })
        .from(moodlists)
        .where(eq(moodlists.userId, sessionUser.id))
        .orderBy(asc(moodlists.createdAt));

      const followed = await db
        .select({
          id: moodlists.id,
          name: moodlists.name,
          ownerId: moodlists.userId,
          ownerName: users.name,
          ownerImage: users.image,
        })
        .from(moodlistFollowers)
        .innerJoin(moodlists, eq(moodlistFollowers.moodlistId, moodlists.id))
        .innerJoin(users, eq(moodlists.userId, users.id))
        .where(eq(moodlistFollowers.userId, sessionUser.id));

      const merged = [
        ...owned.map((m) => ({ ...m, type: "owned" as const })),
        ...followed.map((f) => ({
          ...f,
          type: "followed" as const,
        })),
      ];

      return merged;
    },
    isProtected: true,
    serverErrorMessage: "getUserMoodlists",
  });

const getMoodlistsByUserId = async ({
  userId,
}: {
  userId: UserSchema["id"];
}) => {
  return executeQuery({
    queryFn: async () => {
      return db.query.moodlists.findMany({
        where: eq(moodlists.userId, userId),
        orderBy: (m, { asc }) => [asc(m.createdAt)],
      });
    },
    isProtected: false,
    serverErrorMessage: "getMoodlistsByUserId",
  });
};

// const getMoodlistsByUsername = async ({
//   username,
// }: {
//   username: UserSchema["name"];
// }) => {
//   const getMoodlistsByUsernameSchema = z.object({
//     username: userSchema.shape.name,
//   });
//
//   const { username: parsedUsername } = getMoodlistsByUsernameSchema.parse({
//     username,
//   });
//
//   return executeQuery({
//     queryFn: async () => {
//       return db
//         .select({
//           id: moodlists.id,
//           name: moodlists.name,
//           createdAt: moodlists.createdAt,
//         })
//         .from(moodlists)
//         .leftJoin(users, eq(moodlists.userId, users.id))
//         .where(eq(users.name, parsedUsername))
//         .orderBy(asc(moodlists.createdAt));
//     },
//     isProtected: false,
//     serverErrorMessage: "getMoodlistsByUsername",
//   });
// };

// const getMoodlistSongs = async ({
//   moodlistId,
// }: Pick<MoodlistSongSchema, "moodlistId">) =>
//   executeQuery({
//     queryFn: async () => {
//       return db
//         .select()
//         .from(moodlistSongs)
//         .leftJoin(songs, eq(moodlistSongs.songId, songs.id))
//         .where(eq(moodlistSongs.moodlistId, moodlistId));
//     },
//     isProtected: false,
//     serverErrorMessage: "getMoodlistSongs",
//   });

// const getUserMoodlistSongs = async ({
//   moodlistId,
// }: Pick<MoodlistSongSchema, "moodlistId">) => {
//   const getUserMoodlistSongsSchema = z.object({
//     moodlistId: moodlistSongSchema.shape.id,
//   });
//   const { moodlistId: parsedMoodlistId } = getUserMoodlistSongsSchema.parse({
//     moodlistId,
//   });
//
//   return executeQuery({
//     queryFn: async ({ sessionUser }) => {
//       const moodlist = await db.query.moodlists.findFirst({
//         where: and(
//           eq(moodlists.id, parsedMoodlistId),
//           eq(moodlists.userId, sessionUser.id),
//         ),
//         columns: {
//           id: true,
//           name: true,
//         },
//       });
//
//       if (!moodlist) return null;
//
//       const rows = await db
//         .select({
//           moodlistSongId: moodlistSongs.id,
//           id: songs.id,
//           title: songs.title,
//           thumbnail: songs.thumbnail,
//           duration: songs.duration,
//         })
//         .from(moodlistSongs)
//         .innerJoin(songs, eq(moodlistSongs.songId, songs.id))
//         .where(eq(moodlistSongs.moodlistId, parsedMoodlistId));
//
//       return {
//         id: moodlist.id,
//         name: moodlist.name,
//         songs: rows.map((r) => ({
//           id: r.id,
//           moodlistSongId: r.moodlistSongId,
//           title: r.title,
//           thumbnail: r.thumbnail,
//           duration: r.duration,
//         })),
//       };
//     },
//     isProtected: true,
//     serverErrorMessage: "getUserMoodlistSongs",
//   });
// };

const getUserMoodlistSongs = async ({
  moodlistId,
}: Pick<MoodlistSongSchema, "moodlistId">) => {
  const getUserMoodlistSongsSchema = z.object({
    moodlistId: moodlistSongSchema.shape.moodlistId,
  });
  const { moodlistId: parsedMoodlistId } = getUserMoodlistSongsSchema.parse({
    moodlistId,
  });

  return executeQuery({
    queryFn: async ({ sessionUser }) => {
      const moodlist = await db
        .select({
          id: moodlists.id,
          name: moodlists.name,
          userId: moodlists.userId,
          followedAt: moodlistFollowers.followedAt,
        })
        .from(moodlists)
        .leftJoin(
          moodlistFollowers,
          and(
            eq(moodlistFollowers.moodlistId, moodlists.id),
            eq(moodlistFollowers.userId, sessionUser.id),
          ),
        )
        .where(eq(moodlists.id, parsedMoodlistId))
        .then((res) => res[0]);

      if (!moodlist) return null;

      const isOwner = moodlist.userId === sessionUser.id;
      const isFollower = !!moodlist.followedAt;

      if (!isOwner && !isFollower) return null;

      const rows = await db
        .select({
          moodlistSongId: moodlistSongs.id,
          id: songs.id,
          title: songs.title,
          thumbnail: songs.thumbnail,
          duration: songs.duration,
        })
        .from(moodlistSongs)
        .innerJoin(songs, eq(moodlistSongs.songId, songs.id))
        .where(eq(moodlistSongs.moodlistId, parsedMoodlistId));

      return {
        id: moodlist.id,
        name: moodlist.name,
        type: (isOwner ? "owned" : "followed") as "owned" | "followed",
        songs: rows.map((r) => ({
          id: r.id,
          moodlistSongId: r.moodlistSongId,
          title: r.title,
          thumbnail: r.thumbnail,
          duration: r.duration,
        })),
      };
    },
    isProtected: true,
    serverErrorMessage: "getUserMoodlistSongs",
  });
};

const getMoodlistSongsByUserId = async ({
  moodlistId,
  userId,
}: {
  moodlistId: MoodlistSongSchema["moodlistId"];
  userId: UserSchema["id"];
}) => {
  const getMoodlistSongsByUserIdSchema = z.object({
    moodlistId: moodlistSongSchema.shape.id,
    userId: moodlistSongSchema.shape.userId,
  });
  const { moodlistId: parsedMoodlistId, userId: parsedUserId } =
    getMoodlistSongsByUserIdSchema.parse({
      moodlistId,
      userId,
    });

  return executeQuery({
    queryFn: async () => {
      const moodlist = await db.query.moodlists.findFirst({
        where: and(
          eq(moodlists.id, parsedMoodlistId),
          eq(moodlists.userId, parsedUserId),
        ),
        columns: {
          id: true,
          name: true,
        },
      });

      if (!moodlist) return null;

      const rows = await db
        .select({
          moodlistSongId: moodlistSongs.id,
          id: songs.id,
          title: songs.title,
          thumbnail: songs.thumbnail,
          duration: songs.duration,
        })
        .from(moodlistSongs)
        .innerJoin(songs, eq(moodlistSongs.songId, songs.id))
        .where(eq(moodlistSongs.moodlistId, parsedMoodlistId));

      return {
        id: moodlist.id,
        name: moodlist.name,
        songs: rows.map((r) => ({
          id: r.id,
          moodlistSongId: r.moodlistSongId,
          title: r.title,
          thumbnail: r.thumbnail,
          duration: r.duration,
        })),
      };
    },
    isProtected: false,
    serverErrorMessage: "getMoodlistSongsByUserId",
  });
};

const getMoodlistFollowers = async ({
  moodlistId,
}: Pick<MoodlistFollowerSchema, "moodlistId">) =>
  executeQuery({
    queryFn: async () => {
      return db
        .select()
        .from(moodlistFollowers)
        .where(eq(moodlistFollowers.moodlistId, moodlistId));
    },
    isProtected: false,
    serverErrorMessage: "getMoodlistFollowers",
  });

const getUserFollowedMoodlists = async () =>
  executeQuery({
    queryFn: async ({ sessionUser }) => {
      const rows = await db
        .select({
          id: moodlists.id,
          name: moodlists.name,
          ownerId: moodlists.userId,
          followedAt: moodlistFollowers.followedAt,
        })
        .from(moodlistFollowers)
        .innerJoin(moodlists, eq(moodlistFollowers.moodlistId, moodlists.id))
        .where(eq(moodlistFollowers.userId, sessionUser.id));

      return rows;
    },
    isProtected: true,
    serverErrorMessage: "getUserFollowedMoodlists",
  });

export {
  getMoodlistById,
  getUserMoodlists,
  getMoodlistsByUserId,
  getUserMoodlistSongs,
  getMoodlistSongsByUserId,
  getMoodlistFollowers,
  getUserFollowedMoodlists,
};
