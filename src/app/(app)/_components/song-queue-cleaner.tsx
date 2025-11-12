"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useSongPlayerStore } from "@/store/song-player-store";

const SongQueueCleaner = () => {
  const setSongs = useSongPlayerStore((s) => s.setSongs);
  const pathname = usePathname();

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
  }, [pathname]);

  return null;
};

export { SongQueueCleaner };
