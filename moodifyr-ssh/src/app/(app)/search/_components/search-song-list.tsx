"use client";

import { VirtualizedSongList } from "@/app/(app)/_components/virtualized-song-list";
import type { FavouriteSongSchema, SearchSongSchema } from "@/app/(app)/_types";
import type { getUserMoodlists } from "@/app/(app)/moodlists/queries";
import { SearchSongCard } from "@/app/(app)/search/_components/search-song-card";

type SearchSongListProps = {
  songs: SearchSongSchema[];
  favouriteSongs: FavouriteSongSchema[] | null;
  moodlists: Awaited<ReturnType<typeof getUserMoodlists>>;
};

const SearchSongList = ({
  songs,
  moodlists,
  favouriteSongs,
}: SearchSongListProps) => {
  const isSongFavourite = (song: SearchSongSchema) =>
    favouriteSongs?.some((fav) => fav.id === song.id) ?? false;

  return (
    <VirtualizedSongList
      songs={songs}
      renderItem={(song) => (
        <SearchSongCard
          key={song.id}
          song={song}
          isAlreadyFavourite={isSongFavourite(song)}
          moodlists={moodlists}
        />
      )}
    />
  );
};

export { SearchSongList };
