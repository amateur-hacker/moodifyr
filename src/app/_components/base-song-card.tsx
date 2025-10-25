"use client";

import { Pause, Play } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useEffect, useState } from "react";
import { isMobile, isTablet } from "react-device-detect";
import { useSongPlayer } from "@/app/_context/song-player-context";
import type { SongWithUniqueIdSchema } from "@/app/_types";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { generateShuffleQueue } from "../utils";

type BaseSongCardProps = {
  song: SongWithUniqueIdSchema;
  rightContent?: React.ReactNode;
  onClickExtraAction?: (e: React.MouseEvent) => void;
};
export function BaseSongCard({
  song,
  rightContent,
  onClickExtraAction: onClickExtra,
}: BaseSongCardProps) {
  const {
    currentSong,
    isPlaying,
    setSong,
    togglePlay,
    isLoading,
    setIsPlayerFullScreen,
    isCurrentSong,
    lastActionRef,
    mode,
    addRecentSong,
    recentSongIdsRef,
    playerRef,
    songs,
  } = useSongPlayer();

  const [isClient, setIsClient] = useState(false);
  const [isCurrent, setIsCurrent] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <_>
  useEffect(() => {
    setIsCurrent(isCurrentSong(song));
  }, [song, currentSong]);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    onClickExtra?.(e);

    if (!song.id) return;

    lastActionRef.current = "manual";

    const shouldStartNewSong = !isCurrent;
    const shouldOpenFullscreen = shouldStartNewSong || !isPlaying;

    if (shouldOpenFullscreen) {
      setIsPlayerFullScreen(true);

      const state = window.history.state;
      if (!state?.fullscreen) {
        window.history.pushState({ fullscreen: true }, "");
      }
    }

    if (shouldStartNewSong) {
      setSong(song, true);
      if (mode === "shuffle") {
        addRecentSong(song.id);
        const newQueue = generateShuffleQueue(
          songs,
          song,
          recentSongIdsRef.current,
        );
        if (
          playerRef.current?.shuffleQueueRef &&
          playerRef.current?.shuffleIndexRef
        ) {
          playerRef.current.shuffleQueueRef.current = newQueue;
          playerRef.current.shuffleIndexRef.current = 0;
        }
      }

      // if (
      //   mode === "shuffle" &&
      //   playerRef.current?.shuffleQueueRef &&
      //   playerRef.current?.shuffleIndexRef
      // ) {
      //   const queue = playerRef.current.shuffleQueueRef.current;
      //   const newIndex = queue.findIndex((s) => s.id === song.id);
      //
      //   if (newIndex !== -1) {
      //     playerRef.current.shuffleIndexRef.current = newIndex;
      //   } else {
      //     const newQueue = generateShuffleQueue(
      //       songs,
      //       song,
      //       recentSongIdsRef.current,
      //     );
      //     playerRef.current.shuffleQueueRef.current = newQueue;
      //     playerRef.current.shuffleIndexRef.current = 0;
      //   }
      // }
    } else {
      // setSong(song, true);
      togglePlay(e);
    }
  };

  return (
    <Card className="flex flex-row items-center gap-3 sm:gap-5 p-0 border-0 shadow-none rounded-none group bg-transparent">
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "relative w-[120px] h-[60px] sm:w-[150px] sm:h-[75px] aspect-[2/1.2] cursor-pointer rounded-md",
          isCurrent &&
            "[--shadow-2xl:0px_1px_4px_0px_oklch(0.8109_0_0)] shadow-2xl",
        )}
        title={!isPlaying ? "Play" : "Pause"}
      >
        <Image
          src={song.thumbnail}
          alt={song.title}
          fill
          className="rounded-md object-cover transition-all duration-200 ease-out group-hover-always:group-hover:brightness-[0.8]"
        />
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-md transition-all duration-200",
            isCurrent
              ? "bg-black/40 group-hover-always:group-hover:bg-black/50 opacity-100"
              : `${
                  isClient && (isMobile || isTablet)
                    ? "opacity-100"
                    : "opacity-0 group-hover-always:group-hover:opacity-100"
                } bg-black/40`,
          )}
        >
          {isCurrent ? (
            isLoading ? (
              <div className="h-6 w-6 animate-spin rounded-full border-white border-b-2" />
            ) : isPlaying ? (
              <Pause size={36} aria-hidden />
            ) : (
              <Play size={36} aria-hidden />
            )
          ) : (
            <Play size={36} aria-hidden />
          )}
        </div>
      </button>

      <div className="flex flex-col justify-center gap-1 overflow-hidden">
        <Typography variant="body-small" className="line-clamp-1">
          {song.title.normalize("NFC")}
        </Typography>
        <Typography variant="small" className="text-muted-foreground">
          {song.duration.timestamp}
        </Typography>
      </div>

      {rightContent && (
        <div className="ml-auto flex items-center gap-2">{rightContent}</div>
      )}
    </Card>
  );
}
