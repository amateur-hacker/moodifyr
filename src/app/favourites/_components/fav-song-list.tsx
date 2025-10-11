import type { FavouriteSongSchema } from "@/app/_types";
import { FavouriteSongCard } from "@/app/favourites/_components/fav-song-card";
import { getUserMoodlists } from "@/app/moodlists/queries";
import { GlitchText } from "@/components/ui/shadcn-io/glitch-text";
// import { Typography } from "@/components/ui/typography";

type FavouriteSongListProps = {
  songs: FavouriteSongSchema[] | null;
  moodlists: Awaited<ReturnType<typeof getUserMoodlists>>;
};
const FavouriteSongList = async ({
  songs,
  moodlists,
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
          <FavouriteSongCard song={song} moodlists={moodlists} />
          {i < songs.length - 1 && <div className="my-5 h-px bg-border" />}
        </div>
      ))}
    </div>
  );
};

export { FavouriteSongList };
