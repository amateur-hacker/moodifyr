"use client";

import { useEffect } from "react";
import { useSongPlayer } from "@/app/_context/song-player-context";
import type { SongWithUniqueIdSchema } from "@/app/_types";

type SongsSetterProps = { songs: SongWithUniqueIdSchema[] | null };

const SongsSetter = ({ songs }: SongsSetterProps) => {
  const { setSongs } = useSongPlayer();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <_>
  useEffect(() => {
    if (!songs?.length) return;

    setSongs(songs);
  }, [songs]);

  return null;
};

export { SongsSetter };
