import { Fragment } from "react";
import type { FavouriteSongSchema, SearchSongSchema } from "@/app/_types";
import type { getUserMoodlists } from "@/app/moodlists/queries";
import { SearchSongCard } from "@/app/search/_components/search-song-card";

type SearchSongListProps = {
  songs: SearchSongSchema[] | null;
  favouriteSongs: FavouriteSongSchema[] | null;
  moodlists: Awaited<ReturnType<typeof getUserMoodlists>>;
};
const SearchSongList = ({
  songs,
  moodlists,
  favouriteSongs,
}: SearchSongListProps) => {
  const isSongFavourite = (song: SearchSongSchema) => {
    return favouriteSongs?.some((fav) => fav.id === song.id) ?? false;
  };

  return (
    <div className="pb-[var(--player-height,80px)]">
      {songs?.map((song, i) => (
        <Fragment key={song.id}>
          <div className="flex flex-col">
            <SearchSongCard
              song={song}
              isAlreadyFavourite={isSongFavourite(song)}
              moodlists={moodlists}
            />
          </div>
          {i < songs.length - 1 && <div className="my-5 h-px bg-border" />}
        </Fragment>
      ))}
    </div>
  );
};

export { SearchSongList };
