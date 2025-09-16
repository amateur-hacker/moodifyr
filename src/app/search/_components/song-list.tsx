import { SongCard } from "@/app/search/_components/song-card";
import type { FavouriteSong, Song } from "@/app/search/_types";

type SongListProps = {
  songs: Song[];
  favouriteSongs: FavouriteSong[] | null;
};
const SongList = async ({ songs, favouriteSongs }: SongListProps) => {
  return (
    <div className="pb-[var(--player-height,80px)]">
      {songs?.map((song, i) => (
        <div key={song.id} className="flex flex-col">
          <SongCard song={song} favouriteSongs={favouriteSongs} />
          {i < songs.length - 1 && <div className="my-5 h-px bg-border" />}
        </div>
      ))}
    </div>
  );
};

export { SongList };
