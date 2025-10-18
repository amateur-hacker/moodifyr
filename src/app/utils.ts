import type { SongWithUniqueIdSchema } from "@/app/_types";

const getSongInstanceId = (song: SongWithUniqueIdSchema) =>
  song.historyId ||
  song.favouriteId ||
  song.moodlistSongId ||
  song.searchId ||
  song.id;

export { getSongInstanceId };
