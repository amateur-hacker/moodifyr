"use client";

import type {
  SongPlayerMode,
  SongWithUniqueIdSchema,
} from "@/app/(app)/_types";
import { useSongPlayerStore } from "@/store/song-player-store";
import { useRef } from "react";

type SongPlayerInitializerProps = {
  lastPlayedSong: SongWithUniqueIdSchema | null;
  lastActiveMode: SongPlayerMode | null;
};

const SongPlayerInitializer = ({
  lastPlayedSong,
  lastActiveMode,
}: SongPlayerInitializerProps) => {
  const initialized = useRef(false);

  if (!initialized.current) {
    initialized.current = true;

    useSongPlayerStore.setState({
      currentSong: lastPlayedSong,
      youtubeId: lastPlayedSong?.id ?? null,
      mode: lastActiveMode ?? "normal",
    });
  }

  return null;
};

export { SongPlayerInitializer };
