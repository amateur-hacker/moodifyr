"use client";

import { Dot, EllipsisIcon, ListMusic, Shuffle } from "lucide-react";
import { useState } from "react";
import { useSongPlayer } from "@/app/(app)/_context/song-player-context";
import type { SongWithUniqueIdSchema } from "@/app/(app)/_types";
import { generateShuffleQueue } from "@/app/(app)/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

type PlayHeaderProps = {
  className?: string;
  songs: SongWithUniqueIdSchema[];
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
    recentSongIds,
    setMode,
    setLastAction,
    setShuffleQueue,
    setShuffleIndex,
  } = useSongPlayer();

  const handlePlay = (mode: "shuffle" | "normal") => {
    setMode(mode);
    setIsLoading(true);
    setOpen(false);
    setLastAction("auto");

    if (mode === "normal") {
      setSongs(songs);
      setSong(songs[0]);
      setIsPlayerFullScreen(true);
    } else {
      if (mode === "shuffle") {
        const queue = generateShuffleQueue(songs, null, recentSongIds);
        setSong(queue[0]);
        setShuffleQueue(queue);
        setShuffleIndex(0);
        setIsPlayerFullScreen(true);
      }
    }

    setIsLoading(false);
  };

  return (
    <div className={cn("flex gap-2 justify-center items-center", className)}>
      <div className="flex items-center gap-0.5 text-muted-foreground">
        <Typography variant="body">{totalSongs} songs</Typography>
        <Dot />
        <Typography variant="body">{totalTime}</Typography>
      </div>

      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <EllipsisIcon size={16} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="center" className="w-40">
          <DropdownMenuItem
            onClick={() => handlePlay("normal")}
            disabled={isLoading}
            className="cursor-pointer flex items-center gap-2"
          >
            <ListMusic className="size-4" />
            Normal Play
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handlePlay("shuffle")}
            disabled={isLoading}
            className="cursor-pointer flex items-center gap-2"
          >
            <Shuffle className="size-4" />
            Shuffle Play
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export { PlayHeader };
