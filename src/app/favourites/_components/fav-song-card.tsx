"use client";

import {
  EllipsisIcon,
  EllipsisVertical,
  Heart,
  Pause,
  Play,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { isMobile, isTablet } from "react-device-detect";
import { toast } from "sonner";
import { useSongPlayer } from "@/app/_context/song-player-context";
import type { FavouriteSong } from "@/app/_types";
import { getSongStatus } from "@/app/queries";
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
import { IconButton } from "@/components/ui/shadcn-io/icon-button";

type FavouriteSongCardProps = {
  song: FavouriteSong;
  favouriteSongs: FavouriteSong[] | null;
  revalidate?: boolean;
  path?: string;
  isAlreadyFavourite?: boolean;
};
const FavouriteSongCard = ({
  song,
  favouriteSongs,
  revalidate = false,
  path = "/fav-songs",
}: FavouriteSongCardProps) => {
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
  // const isCurrent = currentSong?.id === song.id;
  // // biome-ignore lint/correctness/useExhaustiveDependencies: <_>
  // const isCurrent = useMemo(() => isCurrentSong(song), [currentSong, song]);

  const [isClient, setIsClient] = useState(false);
  const [isFavourite, setIsFavourite] = useState(true);
  const [isCurrent, setIsCurrent] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // useEffect(() => {
  //   if (favouriteSongs) {
  //     setIsFavourite(favouriteSongs.some((fav) => fav.id === song.id));
  //   }
  // }, [favouriteSongs, song.id]);

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

  const handleToggleFavourite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setHasInteracted(true);

    setIsFavourite((prev) => !prev);

    try {
      const result = await toggleUserFavouriteSong({ song, revalidate, path });

      if (result) {
        setIsFavourite(result.status === "added");
      }
    } catch (error) {
      console.error("Error toggling favourite:", error);
      setIsFavourite((prev) => !prev);
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

      <div className="ml-auto flex flex-col justify-between gap-5">
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
              <EllipsisIcon size={16} aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuItem className="cursor-pointer">
              Option 1
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <IconButton
          icon={Heart}
          active={isFavourite}
          color={[239, 68, 68]}
          onClick={handleToggleFavourite}
          size="default"
          animate={hasInteracted}
        />
      </div>
    </Card>
  );
};

export { FavouriteSongCard };
