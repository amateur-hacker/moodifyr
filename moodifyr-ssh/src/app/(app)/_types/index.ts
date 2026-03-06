import type { SongSchema as OrigSongSchema } from "@/db/schema/song";

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

type SongSchema = Prettify<Omit<OrigSongSchema, "category">>;

type SearchSongSchema = Prettify<
  SongSchema & {
    searchId: string;
  }
>;

type HistorySongSchema = Prettify<
  SongSchema & {
    historyId: string;
  }
>;

type FavouriteSongSchema = Prettify<
  SongSchema & {
    favouriteId: string;
  }
>;

type MoodlistSongSchema = Prettify<
  SongSchema & {
    moodlistSongId: string;
  }
>;

type DashboardSongSchema = Prettify<
  SongSchema & {
    dashboardSongId: string;
  }
>;

type SongWithUniqueIdSchema = Prettify<
  SongSchema &
    Partial<{
      searchId: string;
      favouriteId: string;
      historyId: string;
      moodlistSongId: string;
      dashboardSongId: string;
    }>
>;

type SongPlayerMode = "normal" | "shuffle" | "repeat-all" | "repeat-one";

export type {
  Prettify,
  SongSchema,
  SearchSongSchema,
  HistorySongSchema,
  FavouriteSongSchema,
  MoodlistSongSchema,
  DashboardSongSchema,
  SongWithUniqueIdSchema,
  SongPlayerMode,
};
