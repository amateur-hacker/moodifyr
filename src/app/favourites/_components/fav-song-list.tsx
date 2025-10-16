"use client";

import { useInViewport } from "@mantine/hooks";
import { useEffect, useState, useRef } from "react";
import { useFavourites } from "@/app/_context/favourite-context";
import { useSongPlayer } from "@/app/_context/song-player-context";
import type { FavouriteSongSchema } from "@/app/_types";
import { FavouriteSongCard } from "@/app/favourites/_components/fav-song-card";
import type { getUserMoodlists } from "@/app/moodlists/queries";
import { getUserFavouriteSongs } from "@/app/queries";
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";
import { SongsSetter } from "@/app/_components/songs-setter";

type FavouriteSongListProps = {
  initialSongs: FavouriteSongSchema[] | null;
  moodlists: Awaited<ReturnType<typeof getUserMoodlists>>;
};
const FavouriteSongList = ({
  initialSongs,
  moodlists,
}: FavouriteSongListProps) => {
  const { ref: bottomRef, inViewport } = useInViewport();
  const [songs, setSongs] = useState(initialSongs ?? []);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { favouriteSongs } = useFavourites();
  const { currentSong } = useSongPlayer();
  const firstRender = useRef(true);

  useEffect(() => {
    if (!currentSong || firstRender.current) {
      firstRender.current = false;
      return;
    }

    setSongs((prev) => {
      const exists = prev.find((s) => s.id === currentSong.id);

      if (favouriteSongs[currentSong.id] && !exists) {
        const normalizedSong: FavouriteSongSchema = {
          ...currentSong,
          favouriteId: currentSong.favouriteId || "",
        };
        return [normalizedSong, ...prev];
      }

      if (!favouriteSongs[currentSong.id] && exists) {
        return prev.filter((s) => s.id !== currentSong.id);
      }

      return prev;
    });
  }, [currentSong, favouriteSongs]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <_>
  useEffect(() => {
    if (inViewport && hasMore && !loadingMore) {
      setLoadingMore(true);

      getUserFavouriteSongs({
        page: page + 1,
        limit: 10,
        pagination: true,
      })
        .then((res) => {
          console.log(res);
          if (res?.length) {
            setSongs((prev) => [...prev, ...res]);
            setPage((p) => p + 1);
          }
          if (!res?.length || res.length < 10) setHasMore(false);
        })
        .finally(() => setLoadingMore(false));
    }
  }, [inViewport, hasMore, loadingMore]);

  return (
    <div className="pb-[var(--player-height,80px)]">
      <SongsSetter songs={songs} />
      {songs?.length ? (
        songs?.map((song, i) => (
          <div key={song.id} className="flex flex-col">
            <FavouriteSongCard
              song={song}
              moodlists={moodlists}
              onRemove={(id) =>
                setSongs((prev) => prev.filter((s) => s.favouriteId !== id))
              }
            />
            {i < songs.length - 1 && <div className="my-5 h-px bg-border" />}
          </div>
        ))
      ) : (
        <Typography variant="lead" className="text-center">
          No Favourite Songs
        </Typography>
      )}

      {(hasMore || loadingMore) && (
        <div
          ref={bottomRef}
          className="flex items-center justify-center py-2 mt-3 text-sm text-muted-foreground gap-2"
        >
          <Spinner />
          Loading...
        </div>
      )}
    </div>
  );
};

export { FavouriteSongList };
