"use client";

import { Dot, ListMusic, Pause, Play, Shuffle } from "lucide-react";
import { useState } from "react";
import { useSongPlayer } from "@/app/_context/song-player-context";
import type { SongWithUniqueIdSchema } from "@/app/_types";
import { generateShuffleQueue } from "@/app/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

type PlayHeaderProps = {
  className?: string;
  songs: SongWithUniqueIdSchema[] | null;
  totalSongs: number;
  totalTime: string;
};

const PlayHeader = ({
  className,
  songs,
  totalSongs,
  totalTime,
}: PlayHeaderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const {
    setSongs,
    setSong,
    setIsPlayerFullScreen,
    recentSongIdsRef,
    playerRef,
    isPlaying,
    setIsPlaying,
    setMode,
    mode,
    lastActionRef,
  } = useSongPlayer();

  const handlePlay = (mode: "shuffle" | "normal") => {
    if (!songs?.length) return;

    setMode(mode);
    setIsLoading(true);
    setOpen(false);
    lastActionRef.current = "auto";

    if (mode === "normal") {
      setSongs(songs);
      setSong(songs[0]);
      setIsPlayerFullScreen(true);
    } else {
      if (
        mode === "shuffle" &&
        playerRef.current?.shuffleQueueRef &&
        playerRef.current?.shuffleIndexRef
      ) {
        const queue = generateShuffleQueue(
          songs,
          null,
          recentSongIdsRef.current,
        );
        setSong(queue[0]);
        setIsPlayerFullScreen(true);
        playerRef.current.shuffleQueueRef.current = queue;
        playerRef.current.shuffleIndexRef.current = 0;
      }
    }

    setIsLoading(false);
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-2 justify-center items-center",
        className,
      )}
    >
      <div className="flex items-center gap-0.5 text-muted-foreground">
        <Typography variant="body">{totalSongs} songs</Typography>
        <Dot />
        <Typography variant="body">{totalTime}</Typography>
      </div>

      {isPlaying ? (
        <div className="relative">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full size-14 cursor-pointer"
            disabled={isLoading}
            title="Pause"
            onClick={handlePause}
          >
            {isLoading ? (
              <Spinner className="size-7" />
            ) : (
              <Pause className="size-7" aria-hidden />
            )}
          </Button>

          {mode && (
            <div className="absolute bottom-1 right-1 bg-background rounded-full p-1 shadow-sm">
              {mode === "shuffle" ? (
                <Shuffle className="size-3 text-muted-foreground" />
              ) : (
                <ListMusic className="size-3 text-muted-foreground" />
              )}
            </div>
          )}
        </div>
      ) : (
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <div className="relative">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full size-14 cursor-pointer"
                disabled={isLoading}
                title="Open play options menu"
              >
                {isLoading ? (
                  <Spinner className="size-7" />
                ) : (
                  <Play className="size-7" aria-hidden />
                )}
              </Button>

              {mode && (
                <div className="absolute bottom-1 right-1 bg-background rounded-full p-1 shadow-sm">
                  {mode === "shuffle" ? (
                    <Shuffle className="size-3 text-muted-foreground" />
                  ) : (
                    <ListMusic className="size-3 text-muted-foreground" />
                  )}
                </div>
              )}
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="center" className="w-40">
            <DropdownMenuItem
              onClick={() => handlePlay("normal")}
              className="cursor-pointer flex items-center gap-2"
            >
              <ListMusic className="size-4" />
              Normal Play
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handlePlay("shuffle")}
              className="cursor-pointer flex items-center gap-2"
            >
              <Shuffle className="size-4" />
              Shuffle Play
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export { PlayHeader };
