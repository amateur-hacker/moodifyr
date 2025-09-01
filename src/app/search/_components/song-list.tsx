import { SongCard } from "@/app/search/_components/song-card";

type Song = {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  duration: { timestamp: string; seconds: number };
};
type SongListProps = {
  songs: Song[];
};
const SongList = async ({ songs }: SongListProps) => {
  return (
    <div className="space-y-3 pb-[var(--player-height,80px)]">
      {songs?.map((song) => (
        <SongCard key={song.id} song={song} />
      ))}
    </div>
  );
};

export { SongList };
