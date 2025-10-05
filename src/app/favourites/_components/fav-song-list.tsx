import type { FavouriteSongSchema } from "@/app/_types";
import { FavouriteSongCard } from "@/app/favourites/_components/fav-song-card";
import { GlitchText } from "@/components/ui/shadcn-io/glitch-text";
// import { Typography } from "@/components/ui/typography";

type FavouriteSongListProps = {
  songs: FavouriteSongSchema[] | null;
  favouriteSongs: FavouriteSongSchema[] | null;
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
      {/* <Typography variant="h2" className="mb-4 text-center font-retro"> */}
      {/*   Favourites */}
      {/* </Typography> */}
      {/* <GlitchText */}
      {/*   speed={1} */}
      {/*   enableShadows={true} */}
      {/*   enableOnHover={false} */}
      {/*   className="mb-4 text-center after:left-0 after:right-0 after:m-auto after:translate-x-[10px] before:left-0 before:right-0 before:m-auto before:-translate-x-[10px]" */}
      {/* > */}
      {/*   Favourites */}
      {/* </GlitchText> */}
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
