"use client";

// import { useEffect, useRef } from "react";
import { useEffect } from "react";
import { generateShuffleQueue } from "@/app/(app)/utils";
import { useSongPlayerStore } from "@/store/song-player-store";

const SongShuffleQueueManager = () => {
  const mode = useSongPlayerStore((s) => s.mode);
  const songs = useSongPlayerStore((s) => s.songs);
  const currentSong = useSongPlayerStore((s) => s.currentSong);
  const recentSongIds = useSongPlayerStore((s) => s.recentSongIds);
  const setShuffleQueue = useSongPlayerStore((s) => s.setShuffleQueue);
  const setShuffleIndex = useSongPlayerStore((s) => s.setShuffleIndex);

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
