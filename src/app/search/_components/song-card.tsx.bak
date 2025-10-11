"use client";

import {
  CirclePlus,
  EllipsisIcon,
  Heart,
  Pause,
  Play,
  Plus,
  Share2,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { isMobile, isTablet } from "react-device-detect";
import { toast } from "sonner";
import { useSongPlayer } from "@/app/_context/song-player-context";
import type {
  SongSchema,
  FavouriteSongSchema,
  SearchSongSchema,
} from "@/app/_types";
import { googleSignInUser, toggleUserFavouriteSong } from "@/app/fn";
import { getSongStatus } from "@/app/queries";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/ui/shadcn-io/copy-button";
import { IconButton } from "@/components/ui/shadcn-io/icon-button";
import { Typography } from "@/components/ui/typography";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { AddToMoodlistDialog } from "./add-to-moodlist-dialog";
import type { SelectMoodlistModel } from "@/db/schema/moodlists";
import { ShareLinkDialog } from "./share-link-dialog";

type SongCardProps = {
  song: SongSchema | SearchSongSchema;
  favouriteSongs: FavouriteSongSchema[] | null;
  revalidate?: boolean;
  path?: string;
  isAlreadyFavourite?: boolean;
  // moodlists: SelectMoodlistModel[] | null;
  moodlists:
    | (
        | {
            type: "owned";
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
          }
        | {
            type: "followed";
            id: string;
            name: string;
            ownerName: string;
            ownerImage: string;
            ownerId: string;
            followedAt: Date;
          }
      )[]
    | null;
};
const SongCard = ({
  song,
  revalidate = false,
  path = "/fav-songs",
  isAlreadyFavourite = false,
  moodlists,
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

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // // biome-ignore lint/correctness/useExhaustiveDependencies: <_>
  // const isCurrent = useMemo(() => isCurrentSong(song), [currentSong, song]);

  const [isClient, setIsClient] = useState(false);
  const [isFavourite, setIsFavourite] = useState(isAlreadyFavourite);
  const [isCurrent, setIsCurrent] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [origin, setOrigin] = useState("");
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isAddToMoodlistDialogOpen, setIsAddToMoodlistDialogOpen] =
    useState(false);

  const { useSession } = authClient;
  const { data: session } = useSession();

  useEffect(() => {
    setIsClient(true);
    setOrigin(window.location.origin);
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
    if (!session?.user) {
      toast("Sign in to save your favourite songs", {
        action: {
          label: "Sign in",
          onClick: async () => {
            const queryString = searchParams?.toString();
            const url = queryString
              ? `${origin}${pathname}?${queryString}`
              : `${origin}${pathname}`;
            const response = await googleSignInUser({
              callbackURL: url,
              newUserCallbackURL: url,
            });
            if (response?.url) {
              router.push(response?.url);
            }
          },
        },
        description: "You need an account to favourite songs",
        duration: 5000,
      });
      return;
    }

    setIsFavourite((prev) => !prev);

    try {
      const result = await toggleUserFavouriteSong({ song, revalidate, path });

      if (result) {
        setIsFavourite(result.status === "added");
      } else {
        setIsFavourite(false);
      }
    } catch (error) {
      console.error("Error toggling favourite:", error);
      toast.error("Failed to update favourite. Try again.");
      setIsFavourite(false);
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
          className="rounded-md object-cover transition-all duration-200 ease-out group-hover-always:group-hover:brightness-[0.8]"
        />
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-md transition-all duration-200",
            isCurrent
              ? "bg-black/40 group-hover-always:group-hover:bg-black/50 opacity-100"
              : `${isClient && (isMobile || isTablet) ? "opacity-100" : "opacity-0 group-hover-always:group-hover:opacity-100"} bg-black/40`,
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
                "cursor-pointer ml-auto transition-all duration-200 group-hover-always:group-hover:opacity-100 data-[state=open]:opacity-100 ",
                isCurrent
                  ? "opacity-100"
                  : "opacity-100 sm:has-hover:opacity-0",
              )}
              aria-label="Open dropdown menu"
            >
              <EllipsisIcon size={16} aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setIsAddToMoodlistDialogOpen(true)}
            >
              <CirclePlus size={16} />
              Add to
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setIsShareDialogOpen(true)}
            >
              <Share2 size={16} />
              Share
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
        <ShareLinkDialog
          open={isShareDialogOpen}
          onOpenChange={setIsShareDialogOpen}
          link={`${origin}/search?id=${song.id}`}
        />
        <AddToMoodlistDialog
          open={isAddToMoodlistDialogOpen}
          onOpenChange={setIsAddToMoodlistDialogOpen}
          moodlists={moodlists}
          songId={song.id}
          song={song as SongSchema}
        />
      </div>
    </Card>
  );
};

export { SongCard };
