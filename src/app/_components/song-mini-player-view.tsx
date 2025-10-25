"use client";

import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import type { SongSchema } from "@/app/_types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type SongMiniPlayerViewProps = {
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
  showProgress: boolean;
  mode: string;
};
const SongMiniPlayerView = ({
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
  toggleFullScreen,
  showProgress,
  mode,
}: SongMiniPlayerViewProps) => {
  const progressPercent =
    duration > 0 ? Math.min((progress / duration) * 100, 100) : 0;

  return (
    <Card
      className="p-4 bg-background/90 backdrop-blur-md border-0 border-t h-full rounded-none relative flex-row justify-between cursor-pointer"
      title="Open Fullscreen View"
      onClick={toggleFullScreen}
    >
      <motion.div
        className={cn("absolute top-0 left-0 w-full h-1 bg-primary")}
        animate={{
          width: showProgress ? `${progressPercent}%` : 0,
          opacity: showProgress ? 1 : 0,
        }}
        initial={{ width: 0, opacity: 0 }}
        transition={{ type: "tween", ease: "linear", duration: 0.25 }}
      />

      <div className="flex items-center flex-1">
        <div className="flex items-center gap-3">
          <Image
            src={currentSong.thumbnail}
            alt={currentSong.title}
            width={50}
            height={50}
            className="rounded-sm object-cover"
          />
          <p className="font-medium max-w-md mx-auto line-clamp-1">
            {currentSong.title.normalize("NFC")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevious}
          // disabled={currentIndex <= 0}
          className="size-8 cursor-pointer"
          title="Play Backward"
        >
          <SkipBack className="size-4" aria-hidden />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={handlePlay}
          className="rounded-full size-10 cursor-pointer"
          disabled={isLoading}
          title={!isPlaying ? "Play" : "Pause"}
        >
          {isLoading ? (
            <Spinner className="size-7" />
          ) : isPlaying ? (
            <Pause className="size-5" aria-hidden />
          ) : (
            <Play className="size-5" aria-hidden />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNext}
          disabled={
            (mode === "normal" && currentIndex >= songs.length - 1) ||
            songs.length <= 1
          }
          className="size-8 cursor-pointer"
          title="Play Forward"
        >
          <SkipForward className="size-4" aria-hidden />
        </Button>
      </div>
    </Card>
  );
};

export { SongMiniPlayerView };
