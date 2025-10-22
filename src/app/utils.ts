import type { SongWithUniqueIdSchema } from "@/app/_types";

const getUniqueSongId = (song: SongWithUniqueIdSchema) => {
  if (song.favouriteId) return `favourite-${song.favouriteId}`;
  else if (song.historyId) return `history-${song.historyId}`;
  else if (song.searchId) return `search-${song.searchId}`;
  else if (song.moodlistSongId) return `moodlist-${song.moodlistSongId}`;
  return `song-${song.id}`;
};

const getSongInstanceId = (song: SongWithUniqueIdSchema) =>
  song.historyId ||
  song.favouriteId ||
  song.moodlistSongId ||
  song.searchId ||
  song.id;

const generateShuffleQueue = (
  songs: SongWithUniqueIdSchema[],
  current?: SongWithUniqueIdSchema | null,
  recentSongIds: string[] = [],
  recentLimit = 10,
) => {
  if (!songs.length) return [];

  const recent = recentSongIds.slice(0, recentLimit);

  const remaining = songs.filter(
    (s) => s.id !== current?.id && !recent.includes(s.id),
  );

  const pool =
    remaining.length > 2
      ? remaining
      : songs.filter((s) => s.id !== current?.id);

  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const queue = current ? [current, ...shuffled] : shuffled;

  if (queue.length > 1 && recent[0] === queue[1].id) {
    const [first, second, ...rest] = queue;
    return [first, ...rest, second];
  }

  return queue;
};

export { getUniqueSongId, getSongInstanceId, generateShuffleQueue };
