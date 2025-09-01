"use client";

import Image from "next/image";
import { EllipsisIcon, Play, Pause } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSongPlayer } from "@/app/search/_context/song-player-context";

type Song = {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  duration: { timestamp: string; seconds: number };
};

type SongCardProps = { song: Song };

const SongCard = ({ song }: SongCardProps) => {
  const { currentSong, isPlaying, setSong, togglePlay, isLoading } =
    useSongPlayer();

  const isCurrent = currentSong?.id === song.id;

  const handleClick = (e: React.MouseEvent) => {
    if (isCurrent) {
      togglePlay(e);
    } else {
      const youtubeId = song.id;
      setSong(song, youtubeId);
    }
  };

  return (
    <Card className="shadow-ctp-mantle hover:shadow-lg transition flex flex-col gap-2.5 sm:flex-row p-2 sm:items-center sm:gap-5">
      <div className="flex w-full items-center gap-2.5">
        <button
          type="button"
          className="relative w-[120px] h-[60px] sm:w-[150px] sm:h-[75px] aspect-[2/1.2] cursor-pointer"
          onClick={handleClick}
        >
          <Image
            src={song.thumbnail}
            alt={song.title}
            fill
            className="rounded-md border object-cover shadow-lg transition-all duration-200 ease-out group-hover:brightness-[0.8]"
          />
          {/* overlay play/pause button */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 rounded-md">
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
        <Typography variant="body-small">{song.title}</Typography>
      </div>

      <div className="flex flex-row-reverse items-center justify-between gap-5 sm:ml-auto sm:flex-col">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="cursor-pointer"
              aria-label="Open dropdown menu"
              // onClick={(e) => e.stopPropagation()}
            >
              <EllipsisIcon size={16} aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Option 1</DropdownMenuItem>
            <DropdownMenuItem>Option 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Typography variant="small" className="text-muted-foreground">
          {song.duration.timestamp}
        </Typography>
      </div>
    </Card>
  );
};

export { SongCard };
