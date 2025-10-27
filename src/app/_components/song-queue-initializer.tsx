"use client";

import { useEffect } from "react";
import { useSongPlayer } from "@/app/_context/song-player-context";
import { generateShuffleQueue } from "@/app/utils";

const SongQueueInitializer = () => {
  const { playerRef, mode, songs, currentSong, recentSongIdsRef } =
    useSongPlayer();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <_>
  useEffect(() => {
    if (!playerRef.current) return;

    if (!playerRef.current.shuffleQueueRef) {
      playerRef.current.shuffleQueueRef = { current: [] };
    }
    if (!playerRef.current.shuffleIndexRef) {
      playerRef.current.shuffleIndexRef = { current: -1 };
    }
    if (
      mode === "shuffle" &&
      playerRef.current?.shuffleQueueRef &&
      playerRef.current?.shuffleIndexRef
    ) {
      const queue = generateShuffleQueue(
        songs,
        currentSong,
        recentSongIdsRef.current,
      );
      playerRef.current.shuffleQueueRef.current = queue;
      playerRef.current.shuffleIndexRef.current = 0;
    }
  }, [mode, songs]);

  return null;
};

export { SongQueueInitializer };
