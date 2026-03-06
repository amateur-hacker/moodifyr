"use client";

import { VirtualizedSongList } from "@/app/(app)/_components/virtualized-song-list";
import type { FavouriteSongSchema } from "@/app/(app)/_types";
import { FavouriteSongCard } from "@/app/(app)/favourites/_components/fav-song-card";
import type { getUserMoodlists } from "@/app/(app)/moodlists/queries";

type FavouriteSongListProps = {
  favouriteSongs: FavouriteSongSchema[];
  moodlists: Awaited<ReturnType<typeof getUserMoodlists>>;
};
const FavouriteSongList = ({
  favouriteSongs,
  moodlists,
}: FavouriteSongListProps) => {
  return (
    <VirtualizedSongList
      songs={favouriteSongs}
      renderItem={(song) => (
        <FavouriteSongCard song={song} moodlists={moodlists} />
      )}
    />
  );
};

export { FavouriteSongList };
