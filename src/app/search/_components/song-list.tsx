import type { FavouriteSongSchema, SearchSongSchema } from "@/app/_types";
import { SongCard } from "@/app/search/_components/song-card";
// import type { SelectMoodlistModel } from "@/db/schema/moodlists";

// import { TypingAnimation } from "@/components/ui/typing-animation";

type SongListProps = {
  songs: SearchSongSchema[] | null;
  favouriteSongs: FavouriteSongSchema[] | null;
  revalidate?: boolean;
  path?: string;
  showFavHearts?: boolean;
  // moodlists: SelectMoodlistModel[] | null;
  moodlists:
    | (
        | {
            type: "owned";
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
          }
        | {
            type: "followed";
            id: string;
            name: string;
            ownerName: string;
            ownerImage: string;
            ownerId: string;
            followedAt: Date;
          }
      )[]
    | null;
};
const SongList = async ({
  songs,
  favouriteSongs,
  revalidate = false,
  path = "/fav-songs",
  moodlists,
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
            moodlists={moodlists}
          />
          {i < songs.length - 1 && <div className="my-5 h-px bg-border" />}
        </div>
      ))}
    </div>
  );
};

export { SongList };
