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
  current: SongWithUniqueIdSchema | null = null,
  recentSongIds: string[] = [],
  recentLimit = 10,
) => {
  if (!songs.length) return [];

  const lastPlayedId = recentSongIds[0];
  const recent = new Set(recentSongIds.slice(0, recentLimit));

  let pool = songs.filter(
    (s) => s.id !== current?.id && !recent.has(s.id) && s.id !== lastPlayedId,
  );

  if (!pool.length) {
    pool = songs.filter((s) => s.id !== current?.id && s.id !== lastPlayedId);
  }

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const queue = !recentSongIds.length && current ? [current, ...pool] : pool;
  console.log(queue);

  return queue;
};

export { getUniqueSongId, getSongInstanceId, generateShuffleQueue };
