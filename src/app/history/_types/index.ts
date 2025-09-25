type HistorySong = {
  id: string;
  historyId: string;
  title: string;
  thumbnail: string;
  duration: {
    seconds: number;
    timestamp: string;
  };
};

type SongHistory = Record<string, HistorySong[]>;

export type { HistorySong, SongHistory };
