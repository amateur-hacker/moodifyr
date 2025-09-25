import { SongCard } from "@/app/_components/song-card";
import type { FavouriteSong, SearchSong } from "@/app/_types";
// import { TypingAnimation } from "@/components/ui/typing-animation";

type SongListProps = {
  songs: SearchSong[] | null;
  favouriteSongs: FavouriteSong[] | null;
  revalidate?: boolean;
  path?: string;
  showFavHearts?: boolean;
};
const SongList = async ({
  songs,
  favouriteSongs,
  revalidate = false,
  path = "/fav-songs",
}: SongListProps) => {
  return (
    <div className="pb-[var(--player-height,80px)]">
      {/* {songs?.length && ( */}
      {/*   <TypingAnimation startOnView={true} className="text-lg font-semibold"> */}
      {/*     {`${songs.length} Search Results...`} */}
      {/*   </TypingAnimation> */}
      {/* )} */}
      {songs?.map((song, i) => (
        <div key={song.id} className="flex flex-col">
          <SongCard
            song={song}
            favouriteSongs={favouriteSongs}
            revalidate={revalidate}
            path={path}
            isAlreadyFavourite={
              favouriteSongs?.some((fav) => fav.id === song.id) ?? false
            }
          />
          {i < songs.length - 1 && <div className="my-5 h-px bg-border" />}
        </div>
      ))}
    </div>
  );
};

export { SongList };
