"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useSongPlayer } from "@/app/(app)/_context/song-player-context";

const SongQueueCleaner = () => {
  const { setSongs } = useSongPlayer();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <_>
  useEffect(() => {
    const isFavouritesAllowed = pathname === "/favourites";
    const isMoodlistAllowed =
      /^\/moodlists(\/[0-9a-fA-F-]{36}|\/user\/[^/]+\/[0-9a-fA-F-]{36})$/.test(
        pathname,
      );

    const isAllowed = isFavouritesAllowed || isMoodlistAllowed;

    if (!isAllowed) {
      setSongs([]);
    }
  }, [pathname, searchParams]);

  return null;
};

export { SongQueueCleaner };
