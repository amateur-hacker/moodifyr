import type { FavouriteSong } from "@/app/_types";
import { FavouriteSongCard } from "@/app/favourites/_components/fav-song-card";

type FavouriteSongListProps = {
  songs: FavouriteSong[] | null;
  favouriteSongs: FavouriteSong[] | null;
  revalidate?: boolean;
  path?: string;
  showFavHearts?: boolean;
};
const FavouriteSongList = async ({
  songs,
  favouriteSongs,
  revalidate = false,
  path = "/fav-songs",
}: FavouriteSongListProps) => {
  return (
    <div className="pb-[var(--player-height,80px)]">
      {songs?.map((song, i) => (
        <div key={song.id} className="flex flex-col">
          <FavouriteSongCard
            song={song}
            favouriteSongs={favouriteSongs}
            revalidate={revalidate}
            path={path}
          />
          {i < songs.length - 1 && <div className="my-5 h-px bg-border" />}
        </div>
      ))}
    </div>
  );
};

export { FavouriteSongList };
