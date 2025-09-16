type Song = {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  duration: { timestamp: string; seconds: number };
};

type FavouriteSong = Omit<Song, "duration"> & {
  seconds: number;
};

type SongPlayerMode = "normal" | "shuffle" | "repeat";

export type { Song, FavouriteSong, SongPlayerMode };
