"use client";

import { Pause, Play } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useEffect, useState } from "react";
import { isMobile, isTablet } from "react-device-detect";
import type { Prettify, SongWithUniqueIdSchema } from "@/app/(app)/_types";
import { generateShuffleQueue } from "@/app/(app)/utils";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { useSongPlayerStore } from "@/store/song-player-store";
import { shallow, useShallow } from "zustand/shallow";

type CommonSongCardProps = {
  song: SongWithUniqueIdSchema;
  rightContent?: React.ReactNode;
  onClickExtraAction?: (e: React.MouseEvent) => void;
};
type Variant = "search" | "history" | "moodlist" | "favourite" | "dashboard";
type VariantSpecificProps = Prettify<
  | { variant: Exclude<Variant, "dashboard"> }
  | { variant: "dashboard"; timesPlayed: number }
>;
type BaseSongCardProps = CommonSongCardProps & VariantSpecificProps;
const BaseSongCard = (props: BaseSongCardProps) => {
  const {
    song,
    rightContent,
    onClickExtraAction: onClickExtra,
    variant,
  } = props;

  const timesPlayed = variant === "dashboard" ? props.timesPlayed : undefined;
  // const isPlaying = useSongPlayerStore((s) => s.isPlaying);
  // const isLoading = useSongPlayerStore((s) => s.isLoading);
  // const globalIsPlaying = useSongPlayerStore((s) => s.isPlaying);
  // const isLoading = useSongPlayerStore((s) => s.isLoading);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const mode = useSongPlayerStore((s) => s.mode);
  const songs = useSongPlayerStore((s) => s.songs);
  const recentSongIds = useSongPlayerStore((s) => s.recentSongIds);
  const setSong = useSongPlayerStore((s) => s.setSong);
  const togglePlay = useSongPlayerStore((s) => s.togglePlay);
  const setIsPlayerFullScreen = useSongPlayerStore(
    (s) => s.setIsPlayerFullScreen,
  );
  const isCurrentSong = useSongPlayerStore((s) => s.isCurrentSong);
  const setLastAction = useSongPlayerStore((s) => s.setLastAction);
  const addRecentSong = useSongPlayerStore((s) => s.addRecentSong);
  const setShuffleIndex = useSongPlayerStore((s) => s.setShuffleIndex);
  const setShuffleQueue = useSongPlayerStore((s) => s.setShuffleQueue);

  const [isClient, setIsClient] = useState(false);

  // const isCurrent = isCurrentSong(song);
  const [isCurrent, setIsCurrent] = useState(() => isCurrentSong(song));

  useEffect(() => {
    setIsClient(true);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <_>
  useEffect(() => {
    const unsubCurrent = useSongPlayerStore.subscribe(
      (state) => state.currentSong,
      (newSong) => {
        setIsCurrent(newSong ? newSong.id === song.id : false);
      },
    );

    const unsubPlaying = useSongPlayerStore.subscribe(
      (state) => state.isPlaying,
      (newVal) => {
        if (useSongPlayerStore.getState().isCurrentSong(song))
          setIsPlaying(newVal);
      },
    );

    const unsubLoading = useSongPlayerStore.subscribe(
      (state) => state.isLoading,
      (newVal) => {
        if (useSongPlayerStore.getState().isCurrentSong(song))
          setIsLoading(newVal);
      },
    );

    return () => {
      unsubCurrent();
      unsubPlaying();
      unsubLoading();
    };
  }, [song.id]);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    onClickExtra?.(e);

    if (!song.id) return;

    setLastAction("manual");

    const shouldStartNewSong = !isCurrent;
    const shouldOpenFullscreen = shouldStartNewSong || !isPlaying;

    if (shouldOpenFullscreen) {
      setIsPlayerFullScreen(true);

      const state = window.history.state;
      if (!state?.fullscreen) {
        window.history.pushState({ fullscreen: true }, "");
      }
    }

    if (shouldStartNewSong) {
      setSong(song, true);
      setIsPlaying(true);
      if (mode === "shuffle") {
        addRecentSong(song.id);
        const newQueue = generateShuffleQueue(songs, song, recentSongIds);
        setShuffleQueue(newQueue);
        setShuffleIndex(0);
      }
    } else {
      setIsPlaying(!isPlaying);
      togglePlay(e);
    }
  };

  return (
    <Card className="flex flex-row items-center gap-3 sm:gap-5 p-0 border-0 shadow-none rounded-none group bg-transparent">
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "relative w-[120px] h-[60px] sm:w-[150px] sm:h-[75px] aspect-[2/1.2] cursor-pointer rounded-md text-neutral-300",
          isCurrent && "shadow-2xl",
        )}
        title={!isPlaying ? "Play" : "Pause"}
      >
        <Image
          src={song.thumbnail}
          alt={song.title}
          fill
          className="rounded-md object-cover transition-all duration-200 ease-out group-hover-always:group-hover:brightness-[0.8]"
          loading="lazy"
          blurDataURL={song.thumbnail}
          placeholder="blur"
        />
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-md transition-all duration-200",
            isCurrent
              ? "bg-black/40 group-hover-always:group-hover:bg-black/50 opacity-100"
              : `${
                  isClient && (isMobile || isTablet)
                    ? "opacity-100"
                    : "opacity-0 group-hover-always:group-hover:opacity-100"
                } bg-black/40`,
          )}
        >
          {isCurrent ? (
            isLoading ? (
              <Spinner className="size-9" />
            ) : isPlaying ? (
              <Pause size={36} aria-hidden />
            ) : (
              <Play size={36} aria-hidden />
            )
          ) : (
            <Play size={36} aria-hidden />
          )}
        </div>
      </button>

      <div className="flex flex-col justify-center gap-1 overflow-hidden">
        <Typography variant="body-small" className="line-clamp-1 max-w-xl">
          {song.title.normalize("NFC")}
        </Typography>
        <Typography variant="small" className="text-muted-foreground">
          {variant !== "dashboard"
            ? song.duration.timestamp
            : `${timesPlayed} Plays`}
        </Typography>
      </div>

      {rightContent && (
        <div className="ml-auto flex items-center gap-2">{rightContent}</div>
      )}
    </Card>
  );
};

export { BaseSongCard, type Variant };
