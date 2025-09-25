"use client";

import { EllipsisVertical, Pause, Play } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { isMobile, isTablet } from "react-device-detect";
import { toast } from "sonner";
import { useSongPlayer } from "@/app/_context/song-player-context";
import type { HistorySong } from "@/app/_types";
import { removeUserSongPlayHistory } from "@/app/history/actions";
import { getSongStatus } from "@/app/queries";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

type HistorySongCardProps = {
  song: HistorySong;
};
const HistorySongCard = ({ song }: HistorySongCardProps) => {
  const {
    currentSong,
    isPlaying,
    setSong,
    togglePlay,
    isLoading,
    setIsPlayerFullScreen,
    isCurrentSong,
  } = useSongPlayer();

  // const isCurrent = isCurrentSong(song);
  // // biome-ignore lint/correctness/useExhaustiveDependencies: <_>
  // const isCurrent = useMemo(() => isCurrentSong(song), [currentSong, song]);

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

    if (!song.id) return;

    const previousSong = currentSong ?? null;
    setSong(song);

    try {
      const isSongAvailable = await getSongStatus({ youtubeId: song.id });

      if (!isSongAvailable) {
        setSong(previousSong, isPlaying);
        toast.error("Song not available or removed by the user");
        return;
      }
    } catch (_err) {
      setSong(previousSong, isPlaying);
      toast.error("Error checking song status");
    }

    if (!isCurrent) {
      // setDuration(0);
      // playerRef?.current?.loadVideoById(song.id);
      setIsPlayerFullScreen(true);
      setSong(song);
      return;
    }

    if (!isPlaying) setIsPlayerFullScreen(true);
    setSong(song);
    togglePlay(e);
  };

  const handleRemoveSongPlayHistory = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await removeUserSongPlayHistory({
        id: song.historyId,
        revalidate: true,
        path: "/history",
      });
    } catch (error) {
      console.error("Error removing song play history", error);
    }
  };

  return (
    <Card className="flex flex-row items-center gap-2.5 sm:gap-5 p-0 border-0 shadow-none rounded-none group">
      <button
        type="button"
        className={`relative w-[120px] h-[60px] sm:w-[150px] sm:h-[75px] aspect-[2/1.2] cursor-pointer rounded-md ${isCurrent && "[--shadow-2xl:0px_1px_4px_0px_oklch(0.8109_0_0)] shadow-2xl"}`}
        onClick={handleClick}
      >
        <Image
          src={song.thumbnail}
          alt={song.title}
          fill
          className="rounded-md object-cover transition-all duration-200 ease-out group-hover:brightness-[0.8]"
        />
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-md transition-all duration-200",
            isCurrent
              ? "bg-black/40 group-hover:bg-black/50 opacity-100"
              : `${isClient && (isMobile || isTablet) ? "opacity-100" : "opacity-0 group-hover:opacity-100"} bg-black/40`,
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

      <div className="flex flex-col justify-center gap-2.5">
        <Typography variant="body-small" className="line-clamp-1">
          {song.title}
        </Typography>
        <Typography variant="small" className="text-muted-foreground">
          {song.duration.timestamp}
        </Typography>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "cursor-pointer ml-auto transition-all duration-200 group-hover:opacity-100 data-[state=open]:opacity-100 ",
              isCurrent ? "opacity-100" : "opacity-100 sm:opacity-0",
            )}
            aria-label="Open dropdown menu"
          >
            <EllipsisVertical size={16} aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={handleRemoveSongPlayHistory}
            className="cursor-pointer"
          >
            Remove from history
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Card>
  );
};

export { HistorySongCard };
