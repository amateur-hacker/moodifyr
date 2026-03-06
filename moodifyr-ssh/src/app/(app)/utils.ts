import type { SongWithUniqueIdSchema } from "@/app/(app)/_types";

const getUniqueSongId = (song: SongWithUniqueIdSchema) => {
  if (song.favouriteId) return `favourite-${song.favouriteId}`;
  else if (song.historyId) return `history-${song.historyId}`;
  else if (song.searchId) return `search-${song.searchId}`;
  else if (song.moodlistSongId) return `moodlist-${song.moodlistSongId}`;
  return `song-${song.id}`;
};

const getSongInstanceId = (song: SongWithUniqueIdSchema) =>
  song.dashboardSongId ||
  song.moodlistSongId ||
  song.historyId ||
  song.favouriteId ||
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

  return queue;
};

// const generateShuffleQueue = (
//   songs: SongWithUniqueIdSchema[],
//   current: SongWithUniqueIdSchema | null = null,
//   recentSongIds: string[] = [],
// ) => {
//   if (!songs.length) return [];
//
//   const lastPlayedId = recentSongIds[0];
//
//   const weights = songs.map((s) => {
//     const idx = recentSongIds.indexOf(s.id);
//     if (idx === -1) return 1;
//     const recencyPenalty = Math.max(0.1, 1 - idx / (recentSongIds.length + 1));
//     return recencyPenalty;
//   });
//
//   const filtered = songs.filter(
//     (s) => s.id !== current?.id && s.id !== lastPlayedId,
//   );
//   const filteredWeights = filtered.map((s) => weights[songs.indexOf(s)]);
//
//   const pool = [];
//   const available = [...filtered];
//   const availableWeights = [...filteredWeights];
//
//   while (available.length) {
//     const total = availableWeights.reduce((a, b) => a + b, 0);
//     const rand = Math.random() * total;
//
//     let acc = 0;
//     let chosenIndex = 0;
//     for (let i = 0; i < availableWeights.length; i++) {
//       acc += availableWeights[i];
//       if (acc >= rand) {
//         chosenIndex = i;
//         break;
//       }
//     }
//
//     pool.push(available[chosenIndex]);
//     available.splice(chosenIndex, 1);
//     availableWeights.splice(chosenIndex, 1);
//   }
//
//   const queue = !recentSongIds.length && current ? [current, ...pool] : pool;
//   return queue;
// };

export { getUniqueSongId, getSongInstanceId, generateShuffleQueue };
