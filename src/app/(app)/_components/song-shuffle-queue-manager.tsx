"use client";

// import { useEffect, useRef } from "react";
import { useEffect } from "react";
import { useSongPlayer } from "@/app/(app)/_context/song-player-context";
import { generateShuffleQueue } from "@/app/(app)/utils";

const SongShuffleQueueManager = () => {
  const {
    mode,
    songs,
    currentSong,
    recentSongIds,
    setShuffleQueue,
    setShuffleIndex,
  } = useSongPlayer();

  // const isFirstRender = useRef(true);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <_>
  useEffect(() => {
    // if (isFirstRender.current) {
    //   isFirstRender.current = false;
    //   return;
    // }
    //
    if (mode === "shuffle") {
      const queue = generateShuffleQueue(songs, currentSong, recentSongIds);
      setShuffleQueue(queue);
      setShuffleIndex(0);
    }
  }, [mode]);

  return null;
};

export { SongShuffleQueueManager };
