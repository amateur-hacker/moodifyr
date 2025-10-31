"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useSongPlayer } from "@/app/_context/song-player-context";

const SongQueueCleaner = () => {
  const { setSongs, setShuffleQueue, setShuffleIndex } = useSongPlayer();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <_>
  useEffect(() => {
    const hasValidSearchParam = searchParams.has("q") || searchParams.has("id");
    const isSearchAllowed = pathname === "/search" && hasValidSearchParam;
    const isFavouritesAllowed = pathname === "/favourites";
    const isMoodlistAllowed =
      /^\/moodlists(\/[0-9a-fA-F-]{36}|\/user\/[^/]+\/[0-9a-fA-F-]{36})$/.test(
        pathname,
      );

    const isAllowed =
      isSearchAllowed || isFavouritesAllowed || isMoodlistAllowed;

    if (!isAllowed) {
      setSongs([]);
      setShuffleQueue([]);
      setShuffleIndex(-1);
    }
  }, [pathname, searchParams]);

  return null;
};

export { SongQueueCleaner };
