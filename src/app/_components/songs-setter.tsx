"use client";

import { useEffect } from "react";
import { useSongPlayer } from "@/app/_context/song-player-context";
import type { SongWithUniqueIdSchema } from "@/app/_types";
import { getSongInstanceId } from "@/app/utils";

type SongsSetterProps = { songs: SongWithUniqueIdSchema[] | null };

const SongsSetter = ({ songs }: SongsSetterProps) => {
  const { setSongs, currentSong } = useSongPlayer();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <_>
  useEffect(() => {
    if (!songs?.length) return;

    setSongs(songs);
    if (!currentSong) {
      setSongs(songs);
      return;
    }

    const exists = songs.some(
      (s) => getSongInstanceId(s) === getSongInstanceId(currentSong),
    );

    if (exists) {
      setSongs(songs);
    } else {
      setSongs([currentSong, ...songs]);
    }
  }, [songs, currentSong]);

  return null;
};

export { SongsSetter };
