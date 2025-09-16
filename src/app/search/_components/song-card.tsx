"use client";

import { EllipsisVertical, Heart, Pause, Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useSongPlayer } from "@/app/search/_context/song-player-context";
import type { FavouriteSong, Song } from "@/app/search/_types";
import { toggleUserFavouriteSong } from "@/app/search/fn";
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

type SongCardProps = { song: Song; favouriteSongs: FavouriteSong[] | null };

const SongCard = ({ song, favouriteSongs }: SongCardProps) => {
  const {
    currentSong,
    isPlaying,
    setSong,
    togglePlay,
    isLoading,
    setIsPlayerFullScreen,
  } = useSongPlayer();

  const isCurrent = currentSong?.id === song.id;

  const initialFavourite = favouriteSongs?.some((fav) => fav.id === song.id);
  const [isFavourite, setIsFavourite] = useState(initialFavourite);

  const handleClick = (e: React.MouseEvent) => {
    if (isCurrent) {
      togglePlay(e);

      if (!isPlaying) {
        setIsPlayerFullScreen(true);
      }
    } else {
      setSong(song, song.id);
      setIsPlayerFullScreen(true);
    }
  };

  const handleToggleFavourite = async (e: React.MouseEvent) => {
    e.stopPropagation();

    setIsFavourite((prev) => !prev);

    const result = await toggleUserFavouriteSong({ song });

    if (!result) {
      setIsFavourite(initialFavourite);
    } else {
      setIsFavourite(result.status === "added");
    }
  };

  return (
    <Card className="flex flex-row items-center gap-2.5 sm:gap-5 p-0 border-0 shadow-none rounded-none group">
      <button
        type="button"
        className="relative w-[120px] h-[60px] sm:w-[150px] sm:h-[75px] aspect-[2/1.2] cursor-pointer"
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
              : "opacity-0 group-hover:opacity-100 bg-black/40",
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
        {isFavourite && (
          <>
            <Heart
              size={18}
              className="absolute -top-2 -left-2 text-red-500 fill-red-500 rotate-[-40deg] drop-shadow"
            />
            <Heart
              size={18}
              className="absolute -top-2 -right-2 text-red-500 fill-red-500 rotate-[40deg] drop-shadow"
            />
            <Heart
              size={18}
              className="absolute -bottom-2 -left-2 text-red-500 fill-red-500 rotate-[220deg] drop-shadow"
            />
            <Heart
              size={18}
              className="absolute -bottom-2 -right-2 text-red-500 fill-red-500 rotate-[-220deg] drop-shadow"
            />
          </>
        )}{" "}
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
            onClick={handleToggleFavourite}
            className="cursor-pointer"
          >
            {isFavourite ? "Remove from fav." : "Add to fav."}
            <Heart className="text-red-500 fill-red-500" />
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            Option 2
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Card>
  );
};

export { SongCard };
