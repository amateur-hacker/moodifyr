"use client";

import { useEffect, useState } from "react";
import { VirtualizedSongList } from "@/app/(app)/_components/virtualized-song-list";
import { useFavourites } from "@/app/(app)/_context/favourite-context";
import { useSongPlayer } from "@/app/(app)/_context/song-player-context";
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
  const [songs, setSongs] = useState(favouriteSongs ?? []);
  const { favouriteSongs: globalFavouriteSongs } = useFavourites();
  const { currentSong, isPlayerFullScreen } = useSongPlayer();

  useEffect(() => {
    if (!currentSong || !isPlayerFullScreen) {
      return;
    }

    setSongs((prev) => {
      const exists = prev.find((s) => s.id === currentSong.id);

      if (globalFavouriteSongs[currentSong.id] && !exists) {
        const normalizedSong: FavouriteSongSchema = {
          ...currentSong,
          favouriteId: currentSong.favouriteId || "",
        };
        return [normalizedSong, ...prev];
      }

      if (!globalFavouriteSongs[currentSong.id] && exists) {
        return prev.filter((s) => s.id !== currentSong.id);
      }

      return prev;
    });
  }, [currentSong, globalFavouriteSongs, isPlayerFullScreen]);

  return (
    <VirtualizedSongList
      songs={songs}
      renderItem={(song) => (
        <FavouriteSongCard
          song={song}
          moodlists={moodlists}
          onRemove={(id) =>
            setSongs((prev) => prev.filter((s) => s.favouriteId !== id))
          }
        />
      )}
    />
  );
};

export { FavouriteSongList };
