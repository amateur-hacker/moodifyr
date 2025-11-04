"use client";

import { CirclePlus, EllipsisIcon, Heart, Share2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  BaseSongCard,
  type Variant,
} from "@/app/(app)/_components/base-song-card";
import { useSongPlayer } from "@/app/(app)/_context/song-player-context";
import type { Prettify, SongWithUniqueIdSchema } from "@/app/(app)/_types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconButton } from "@/components/ui/shadcn-io/icon-button";
import { cn } from "@/lib/utils";

type BaseProps = {
  song: SongWithUniqueIdSchema;
  onClickExtra?: () => void;
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
  moodlist:
    | {
        moodlistType: "owned";
        onRemoveSongFromMoodlist: () => Promise<void>;
        shouldRemoveSongFromMoodlistDisabled: boolean;
      }
    | {
        moodlistType: "followed";
      };
  favourite: {
    onRemoveFromFavourites: () => Promise<void>;
    onAddToMoodlist: () => void;
    onShare: () => void;
    shouldHeartButtonActive: boolean;
    shouldHeartButtonAnimate: boolean;
    shouldHeartButtonDisabled: boolean;
  };
  dashboard: {
    timesPlayed: number;
  };
};

type SongCardProps = Prettify<
  {
    [K in Variant]: BaseProps & { variant: K } & VariantSpecificProps[K];
  }[Variant]
>;

const SongCard = (props: SongCardProps) => {
  const { song, variant, onClickExtra } = props;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { currentSong, isCurrentSong } = useSongPlayer();
  const [isCurrent, setIsCurrent] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <_>
  useEffect(() => {
    setIsCurrent(isCurrentSong(song));
  }, [song, currentSong]);

  const dropdownItems = () => {
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
            <DropdownMenuItem
              onClick={props.onRemoveSongFromMoodlist}
              disabled={props.shouldRemoveSongFromMoodlistDisabled}
            >
              <Trash2 size={16} /> Remove
            </DropdownMenuItem>
          );
        }
        return null;

      default:
        return null;
    }
  };

  if (
    (variant === "moodlist" && props.moodlistType === "followed") ||
    variant === "dashboard"
  ) {
    return (
      <BaseSongCard
        song={song}
        {...(variant === "dashboard"
          ? {
              variant: "dashboard",
              timesPlayed: props.timesPlayed,
            }
          : { variant: "moodlist" })}
      />
    );
  }

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
              {dropdownItems()}
            </DropdownMenuContent>
          )}
        </DropdownMenu>

        {(variant === "search" || variant === "favourite") && (
          <IconButton
            icon={Heart}
            active={props.shouldHeartButtonActive}
            color={[239, 68, 68]}
            onClick={(e) => {
              e.stopPropagation();
              variant === "search"
                ? props.onToggleFavourite()
                : props.onRemoveFromFavourites();
            }}
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
          <DropdownMenuContent align="end">
            {dropdownItems()}
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    );

  return (
    <BaseSongCard
      song={song}
      rightContent={rightContent}
      onClickExtraAction={onClickExtra}
      variant={variant}
    />
  );
};

export { SongCard };
