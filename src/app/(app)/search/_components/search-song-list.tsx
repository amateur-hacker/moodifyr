"use client";

import { Virtuoso } from "react-virtuoso";
import { Fragment } from "react";
import type { FavouriteSongSchema, SearchSongSchema } from "@/app/(app)/_types";
import type { getUserMoodlists } from "@/app/(app)/moodlists/queries";
import { SearchSongCard } from "@/app/(app)/search/_components/search-song-card";

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
  if (!songs) return null;

  const isSongFavourite = (song: SearchSongSchema) =>
    favouriteSongs?.some((fav) => fav.id === song.id) ?? false;

  return (
    <Virtuoso
      className="h-full"
      useWindowScroll
      data={songs}
      itemContent={(index, song) => (
        <Fragment key={song.id}>
          <div className="flex flex-col ">
            <SearchSongCard
              song={song}
              isAlreadyFavourite={isSongFavourite(song)}
              moodlists={moodlists}
            />
          </div>
          {index < songs.length - 1 && <div className="my-5 h-px bg-border" />}
        </Fragment>
      )}
    />
  );
};

export { SearchSongList };
