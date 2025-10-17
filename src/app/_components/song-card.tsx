"use client";

import { CirclePlus, EllipsisIcon, Heart, Share2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useSongPlayer } from "@/app/_context/song-player-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconButton } from "@/components/ui/shadcn-io/icon-button";
import { cn } from "@/lib/utils";
import type { Prettify, SongWithUniqueIdSchema } from "../_types";
import { BaseSongCard } from "./base-song-card";

type Variant = "search" | "history" | "moodlist" | "favourite";

type BaseProps = {
  song: SongWithUniqueIdSchema;
};

type VariantSpecificProps = {
  search: {
    onToggleFavourite: () => Promise<void>;
    onAddToMoodlist: () => void;
    onShare: () => void;
    shouldHeartButtonActive: boolean;
    shouldHeartButtonAnimate: boolean;
    shouldHeartButtonDisabled: boolean;
  };
  history: {
    onAddToMoodlist: () => void;
    onRemoveFromHistory: () => Promise<void>;
    onShare: () => void;
    shouldRemoveFromHistoryItemDisabled: boolean;
  };
  moodlist: {
    moodlistType: "owned" | "followed";
    onRemove: () => void;
  };
  favourite: {
    onRemoveFromFavourites: () => Promise<void>;
    onAddToMoodlist: () => void;
    onShare: () => void;
    shouldHeartButtonActive: boolean;
    shouldHeartButtonAnimate: boolean;
    shouldHeartButtonDisabled: boolean;
  };
};

type SongCardProps = Prettify<
  {
    [K in Variant]: BaseProps & { variant: K } & VariantSpecificProps[K];
  }[Variant]
>;

export function SongCard(props: SongCardProps) {
  const { song, variant } = props;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { currentSong, isCurrentSong } = useSongPlayer();
  const [isCurrent, setIsCurrent] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <_>
  useEffect(() => {
    setIsCurrent(isCurrentSong(song));
  }, [song, currentSong]);

  const dropdownItems: React.ReactNode = (() => {
    switch (variant) {
      case "search":
      case "favourite":
        return (
          <>
            <DropdownMenuItem onClick={props.onAddToMoodlist}>
              <CirclePlus size={16} /> Add to Moodlist
            </DropdownMenuItem>
            <DropdownMenuItem onClick={props.onShare}>
              <Share2 size={16} /> Share
            </DropdownMenuItem>
          </>
        );

      case "history":
        return (
          <>
            <DropdownMenuItem onClick={props.onAddToMoodlist}>
              <CirclePlus size={16} /> Add to Moodlist
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={props.onRemoveFromHistory}
              disabled={props.shouldRemoveFromHistoryItemDisabled}
            >
              <Trash2 size={16} /> Remove from history
            </DropdownMenuItem>
          </>
        );

      case "moodlist":
        if (props.moodlistType === "owned") {
          return (
            <DropdownMenuItem onClick={props.onRemove}>
              <Trash2 size={16} /> Remove
            </DropdownMenuItem>
          );
        }
        return null;

      default:
        return null;
    }
  })();

  const rightContent =
    variant === "search" || variant === "favourite" ? (
      <div className="ml-auto flex flex-col justify-between gap-5">
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "transition",
                isDropdownOpen || isCurrent
                  ? "opacity-100"
                  : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100",
              )}
              title="Open Menu"
            >
              <EllipsisIcon size={16} aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          {dropdownItems && (
            <DropdownMenuContent align="end">
              {dropdownItems}
            </DropdownMenuContent>
          )}
        </DropdownMenu>

        {(variant === "search" || variant === "favourite") && (
          <IconButton
            icon={Heart}
            active={props.shouldHeartButtonActive}
            color={[239, 68, 68]}
            onClick={
              variant === "search"
                ? props.onToggleFavourite
                : props.onRemoveFromFavourites
            }
            size="default"
            animate={props.shouldHeartButtonAnimate}
            disabled={props.shouldHeartButtonDisabled}
            // className="disabled:pointer-events-none disabled:opacity-50"
            className="disabled:pointer-events-none"
            title={
              !props.shouldHeartButtonActive
                ? "Add to favourite"
                : "Remove from favourite"
            }
          />
        )}
      </div>
    ) : (
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "transition",
              isDropdownOpen || isCurrent
                ? "opacity-100"
                : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100",
            )}
          >
            <EllipsisIcon size={16} />
          </Button>
        </DropdownMenuTrigger>
        {dropdownItems && (
          <DropdownMenuContent align="end">{dropdownItems}</DropdownMenuContent>
        )}
      </DropdownMenu>
    );

  return <BaseSongCard song={song} rightContent={rightContent} />;
}
