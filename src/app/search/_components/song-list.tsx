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
    <div className="pb-[var(--player-height,80px)]">
      {songs?.map((song, i) => (
        <div key={song.id} className="flex flex-col">
          <SongCard song={song} />
          {i < songs.length - 1 && <div className="my-5 h-px bg-border" />}
        </div>
      ))}
    </div>
  );
};

export { SongList };
