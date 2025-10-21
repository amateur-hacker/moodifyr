import type { SongWithUniqueIdSchema } from "@/app/_types";

const getSongInstanceId = (song: SongWithUniqueIdSchema) =>
  song.historyId ||
  song.favouriteId ||
  song.moodlistSongId ||
  song.searchId ||
  song.id;

function generateShuffleQueue(
  songs: SongWithUniqueIdSchema[],
  current?: SongWithUniqueIdSchema | null,
  lastPlayedSongId?: string | null,
) {
  if (!songs.length) return [];

  const remaining = songs.filter(
    (s) => s.id !== current?.id && s.id !== lastPlayedSongId,
  );

  // const remaining = songs.filter((s) => s.id !== lastPlayedSongId);

  const shuffled = [...remaining].sort(() => Math.random() - 0.5);

  return current ? [current, ...shuffled] : shuffled;
}

export { getSongInstanceId, generateShuffleQueue };
