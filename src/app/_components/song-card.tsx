"use client";

import {
  EllipsisIcon,
  EllipsisVertical,
  Heart,
  Pause,
  Play,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { isMobile, isTablet } from "react-device-detect";
import { toast } from "sonner";
import { useSongPlayer } from "@/app/_context/song-player-context";
import type { FavouriteSong, SearchSong } from "@/app/_types";
import { getSongStatus } from "@/app/queries";
import { toggleUserFavouriteSong } from "@/app/search/fn";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/shadcn-io/copy-button";
// import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ui/shadcn-io/icon-button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SongCardProps = {
  song: SearchSong;
  favouriteSongs: FavouriteSong[] | null;
  revalidate?: boolean;
  path?: string;
  isAlreadyFavourite?: boolean;
};
const SongCard = ({
  song,
  revalidate = false,
  path = "/fav-songs",
  isAlreadyFavourite = false,
}: SongCardProps) => {
  const {
    currentSong,
    isPlaying,
    setSong,
    togglePlay,
    isLoading,
    setIsPlayerFullScreen,
    isCurrentSong,
  } = useSongPlayer();

  // const router = useRouter();

  // const isCurrent = isCurrentSong(song);
  // const isCurrent = currentSong?.id === song.id;
  // // biome-ignore lint/correctness/useExhaustiveDependencies: <_>
  // const isCurrent = useMemo(() => isCurrentSong(song), [currentSong, song]);

  const [isClient, setIsClient] = useState(false);
  const [isFavourite, setIsFavourite] = useState(isAlreadyFavourite);
  const [isCurrent, setIsCurrent] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setIsClient(true);
    setOrigin(window.location.origin);
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
      // router.replace(`/song?id=${song.id}`);
      // const newUrl = `/song?id=${song.id}`; // Construct your desired URL
      // window.history.replaceState({}, "", newUrl);
      setSong(song);
      return;
    }

    if (!isPlaying) setIsPlayerFullScreen(true);
    // router.replace(`/song?id=${song.id}`);
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
    <Card
      className="flex flex-row items-center gap-2.5 sm:gap-5 p-0 border-0 shadow-none rounded-none group"
      // onClick={handleClick}
    >
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
        <Dialog>
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
              {/* <DropdownMenuItem */}
              {/*   className="cursor-pointer" */}
              {/*   onClick={(e) => e.stopPropagation()} */}
              {/* > */}
              {/*   Share */}
              {/* </DropdownMenuItem> */}
              <DropdownMenuItem className="cursor-pointer" asChild>
                <DialogTrigger className="w-full">Share</DialogTrigger>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Share link</DialogTitle>
              <DialogDescription>
                Anyone who has this link will be able to view this.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="link" className="sr-only">
                  Link
                </Label>
                <div className="flex-1 flex gap-2">
                  <Input
                    id="link"
                    defaultValue={`${origin}/search?id=${song.id}`}
                    readOnly
                  />
                  <CopyButton
                    content={`${origin}/search?id=${song.id}`}
                    size="default"
                    className="rounded-md"
                  />
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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

export { SongCard };
