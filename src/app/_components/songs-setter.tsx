"use client";

import { useEffect } from "react";
import { useSongPlayer } from "@/app/_context/song-player-context";
import type { SongWithUniqueIdSchema } from "@/app/_types";
import { getSongInstanceId } from "@/app/utils";

type SongsSetterProps = { songs: SongWithUniqueIdSchema[] | null };

export function SongsSetter({ songs }: SongsSetterProps) {
  const { setSongs, currentSong } = useSongPlayer();

  useEffect(() => {
    if (!songs?.length) return;

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
  }, [songs, setSongs, currentSong]);

  return null;
}
