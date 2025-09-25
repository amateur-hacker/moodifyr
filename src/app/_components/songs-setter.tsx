"use client";

import { useEffect } from "react";
import { useSongPlayer } from "@/app/_context/song-player-context";
import type { SongWithUniqueId } from "@/app/_types";

type SongsSetterProps = { songs: SongWithUniqueId[] | null };

export function SongsSetter({ songs }: SongsSetterProps) {
  const { setSongs, currentSong } = useSongPlayer();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <_>
  useEffect(() => {
    if (!songs?.length) return;

    if (!currentSong) {
      setSongs(songs);
      return;
    }

    const exists = songs.some((s) => s.id === currentSong.id);

    if (exists) {
      setSongs(songs);
    } else {
      setSongs([currentSong, ...songs]);
    }
  }, [songs, setSongs]);

  return null;
}
