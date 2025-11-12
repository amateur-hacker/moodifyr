"use client";

import { useEffect } from "react";
import type { SongWithUniqueIdSchema } from "@/app/(app)/_types";
import { getSongInstanceId } from "@/app/(app)/utils";
import { useSongPlayerStore } from "@/store/song-player-store";

type SongsSetterProps = { songs: SongWithUniqueIdSchema[] | null };

const SongsSetter = ({ songs }: SongsSetterProps) => {
  // const { setSongs, currentSong } = useSongPlayer();

  const setSongs = useSongPlayerStore((s) => s.setSongs);
  const currentSong = useSongPlayerStore((s) => s.currentSong);

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
