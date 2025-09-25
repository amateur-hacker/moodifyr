type Song = {
  id: string;
  title: string;
  thumbnail: string;
  duration: { timestamp: string; seconds: number };
};

type SearchSong = Song & {
  searchId: string;
};

type HistorySong = Song & {
  historyId: string;
};

type FavouriteSong = Song & {
  favouriteId: string;
};

type SongWithUniqueId = {
  id: string;
  title: string;
  thumbnail: string;
  duration: { seconds: number; timestamp: string };
  searchId?: string;
  favouriteId?: string;
  historyId?: string;
};

type SongPlayerMode = "normal" | "shuffle" | "repeat-all" | "repeat-one";

export type {
  Song,
  SearchSong,
  HistorySong,
  FavouriteSong,
  SongWithUniqueId,
  SongPlayerMode,
};
