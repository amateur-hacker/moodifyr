"use client";

import { Pause, Play } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useEffect, useState } from "react";
import { isMobile, isTablet } from "react-device-detect";
import { toast } from "sonner";
import { useSongPlayer } from "@/app/_context/song-player-context";
import { getSongStatus } from "@/app/queries";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import type { SongWithUniqueIdSchema } from "../_types";

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
    const prevSong = currentSong ?? null;
    setSong(song);

    try {
      const available = await getSongStatus({ youtubeId: song.id });
      if (!available) {
        setSong(prevSong, isPlaying);
        toast.error("Song not available or removed by user");
        return;
      }
    } catch {
      setSong(prevSong, isPlaying);
      toast.error("Error checking song status");
      return;
    }

    if (!isCurrent) {
      setIsPlayerFullScreen(true);
      setSong(song);
      return;
    }

    if (!isPlaying) setIsPlayerFullScreen(true);
    setSong(song);
    togglePlay(e);
  };

  return (
    <Card className="flex flex-row items-center gap-3 sm:gap-5 p-0 border-0 shadow-none rounded-none group">
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "relative w-[120px] h-[60px] sm:w-[150px] sm:h-[75px] aspect-[2/1.2] cursor-pointer rounded-md",
          isCurrent &&
            "[--shadow-2xl:0px_1px_4px_0px_oklch(0.8109_0_0)] shadow-2xl",
        )}
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
              <Pause size={36} />
            ) : (
              <Play size={36} />
            )
          ) : (
            <Play size={36} />
          )}
        </div>
      </button>

      <div className="flex flex-col justify-center gap-1">
        <Typography variant="body-small" className="line-clamp-1">
          {song.title}
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
