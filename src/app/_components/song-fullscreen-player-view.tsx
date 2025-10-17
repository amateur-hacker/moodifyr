"use client";

import {
  ChevronDown,
  CirclePlus,
  EllipsisVertical,
  Heart,
  Pause,
  Play,
  Repeat,
  Share2,
  Shuffle,
  SkipBack,
  SkipForward,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AddToMoodlistDialog } from "@/app/_components/add-to-moodlist-dialog";
import { ShareLinkDialog } from "@/app/_components/share-link-dialog";
import type { SongSchema } from "@/app/_types";
import { toggleUserFavouriteSong } from "@/app/actions";
import { googleSignInUser } from "@/app/fn";
import type { getUserMoodlists } from "@/app/moodlists/queries";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { useUser } from "@/app/_context/user-context";
import { useFavourites } from "../_context/favourite-context";

type SongPlayerMode = "normal" | "shuffle" | "repeat-all" | "repeat-one";

type SongFullscreenPlayerViewProps = {
  currentSong: SongSchema;
  isPlaying: boolean;
  isLoading: boolean;
  handlePlay: (e: React.MouseEvent) => void;
  handlePrevious: (e: React.MouseEvent) => void;
  handleNext: (e: React.MouseEvent) => void;
  currentIndex: number;
  songs: SongSchema[];
  progress: number;
  duration: number;
  toggleFullScreen: (e: React.MouseEvent) => void;
  handleSeek: (val: number[]) => void;
  mode: SongPlayerMode;
  toggleMode: (e: React.MouseEvent, newMode: SongPlayerMode) => void;
  isFullScreen: boolean;
  volume: number;
  getVolumeIcon: (volume: number) => React.ReactElement;
  handleVolumeChange: (val: number[]) => void;
  toggleVolumeMute: (e: React.MouseEvent) => void;
  isAlreadyFavourite: boolean;
  moodlists: Awaited<ReturnType<typeof getUserMoodlists>>;
};

const SongFullscreenPlayerView = ({
  currentSong,
  isPlaying,
  isLoading,
  handlePlay,
  handlePrevious,
  handleNext,
  currentIndex,
  songs,
  progress,
  duration,
  handleSeek,
  mode,
  toggleMode,
  toggleFullScreen,
  isFullScreen,
  isAlreadyFavourite,
  moodlists,
}: SongFullscreenPlayerViewProps) => {
  const {
    favouriteSongs,
    setFavourite,
    isFavouritePending,
    setFavouritePending,
  } = useFavourites();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isAddToMoodlistDialogOpen, setIsAddToMoodlistDialogOpen] =
    useState(false);
  const [baseUrl, setBaseUrl] = useState("");

  const isFav = favouriteSongs[currentSong.id] ?? isAlreadyFavourite;
  const isPending = isFavouritePending[currentSong.id] ?? false;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useUser();

  const handleToggleFavourite = async () => {
    if (!user) {
      toast("Sign in to save your favourite songs", {
        action: {
          label: "Sign in",
          onClick: async () => {
            const queryString = searchParams?.toString();
            const url = queryString
              ? `${baseUrl}${pathname}?${queryString}`
              : `${baseUrl}${pathname}`;
            const response = await googleSignInUser({
              callbackURL: url,
              newUserCallbackURL: url,
            });
            if (response?.url) {
              router.push(response.url);
            }
          },
        },
        description: "You need an account to favourite songs",
        duration: 5000,
      });
      return;
    }

    setFavouritePending(currentSong.id, true);
    setFavourite(currentSong.id, !isFav);

    const message = !isFav ? "Added to favourites" : "Removed from favourites";
    toast.success(message, { id: currentSong.id });

    try {
      const result = await toggleUserFavouriteSong({
        song: currentSong,
      });

      if (!result) {
        setFavourite(currentSong.id, isFav);
        toast.error("Failed to update favourite. Try again.", {
          id: currentSong.id,
        });
      }
    } catch (error) {
      setFavourite(currentSong.id, isFav);
      console.error("Error toggling favourite:", error);
      toast.error("Failed to update favourite. Try again.", {
        id: currentSong.id,
      });
    } finally {
      setFavouritePending(currentSong.id, false);
    }
  };

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const formatTime = (seconds: number) => {
    if (!seconds || Number.isNaN(seconds)) return "0:00";

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    } else {
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    }
  };

  const handleRepeatClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    const nextMode: SongPlayerMode =
      mode === "normal"
        ? "repeat-all"
        : mode === "repeat-all"
          ? "repeat-one"
          : "normal";

    toggleMode(e, nextMode);
  };

  const getRepeatButtonVariant = () => {
    return mode === "repeat-all" || mode === "repeat-one" ? "default" : "ghost";
  };

  // useEffect(() => {
  //   const handlePopState = () => {
  //     if (isFullScreen) {
  //       toggleFullScreen(); // close the fullscreen player
  //       window.removeEventListener("popstate", handlePopState); // remove after first use
  //     }
  //   };
  //
  //   window.addEventListener("popstate", handlePopState);
  //
  //   return () => {
  //     window.removeEventListener("popstate", handlePopState);
  //   };
  // }, [isFullScreen, toggleFullScreen]);

  return (
    <Card
      className={`p-4 bg-background/90 backdrop-blur-md border-0 border-t h-full rounded-none justify-center ${isFullScreen ? "rounded-none border-0" : "rounded-b-none"}`}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleFullScreen}
        className="cursor-pointer absolute top-4 left-4"
        title="Close Fullscreen View"
      >
        <ChevronDown className="size-5" aria-hidden />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="cursor-pointer absolute top-4 right-4"
            title="Open Menu"
          >
            <EllipsisVertical size={16} aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="bottom"
          align="end"
          sideOffset={4}
          alignOffset={-4}
        >
          <DropdownMenuItem onClick={() => setIsAddToMoodlistDialogOpen(true)}>
            <CirclePlus />
            Add to Moodlist
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleToggleFavourite}
            disabled={isPending}
          >
            <Heart />
            {!isFav ? "Add to Favourite" : "Remove from Favourite"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsShareDialogOpen(true)}>
            <Share2 />
            Share
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex flex-col items-center gap-6 max-w-sm w-full mx-auto">
        <div className="flex flex-col items-center gap-3">
          <Image
            src={currentSong.thumbnail}
            alt={currentSong.title}
            width={250}
            height={250}
            className="rounded-md object-cover"
          />
          <p className="font-medium text-center max-w-xs mx-auto w-full line-clamp-1">
            {currentSong.title}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant={mode === "shuffle" ? "default" : "ghost"}
            size="icon"
            onClick={(e) => toggleMode(e, "shuffle")}
            className="size-10 cursor-pointer"
            title={mode !== "shuffle" ? "Shuffle On" : "Shuffle Off"}
          >
            <Shuffle className="size-5" aria-hidden />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            // disabled={currentIndex <= 0}
            className="cursor-pointer size-10"
            title="Play Backward"
          >
            <SkipBack className="size-5" aria-hidden />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handlePlay}
            className="rounded-full size-14 cursor-pointer"
            disabled={isLoading}
            title={!isPlaying ? "Play" : "Pause"}
          >
            {isLoading ? (
              <div className="size-7 animate-spin rounded-full border-2 border-white border-b-transparent" />
            ) : isPlaying ? (
              <Pause className="size-7" aria-hidden />
            ) : (
              <Play className="size-7" aria-hidden />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            disabled={mode === "normal" && currentIndex >= songs.length - 1}
            className="cursor-pointer size-10"
            title="Play Forward"
          >
            <SkipForward className="size-5" aria-hidden />
          </Button>

          <Button
            variant={getRepeatButtonVariant()}
            size="icon"
            onClick={handleRepeatClick}
            className="cursor-pointer size-10 relative"
            title={
              mode === "normal"
                ? "Repeat"
                : mode === "repeat-all"
                  ? "Repeat One"
                  : "Normal"
            }
          >
            <Repeat className="size-5" aria-hidden />
            {mode === "repeat-one" && (
              <span
                className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-xs rounded-full size-4 flex items-center justify-center font-medium"
                aria-hidden
              >
                1
              </span>
            )}
          </Button>
        </div>

        <div className="w-full">
          <Slider
            value={[progress]}
            max={duration}
            step={5}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-1">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      <ShareLinkDialog
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        link={`${baseUrl}/search?id=${currentSong.id}`}
      />
      <AddToMoodlistDialog
        open={isAddToMoodlistDialogOpen}
        onOpenChange={setIsAddToMoodlistDialogOpen}
        moodlists={moodlists}
        songId={currentSong.id}
        song={currentSong as SongSchema}
      />
    </Card>
  );
};

export { SongFullscreenPlayerView };
