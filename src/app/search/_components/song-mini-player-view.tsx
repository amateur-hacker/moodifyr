import { motion } from "motion/react";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { Song } from "@/app/search/_types";

type SongMiniPlayerViewProps = {
  currentSong: Song;
  isPlaying: boolean;
  isLoading: boolean;
  togglePlay: (e: React.MouseEvent) => void;
  handlePrevious: (e: React.MouseEvent) => void;
  handleNext: (e: React.MouseEvent) => void;
  currentIndex: number;
  songs: Song[];
  progress: number;
  duration: number;
  toggleFullScreen: (e: React.MouseEvent) => void;
  showProgress: boolean;
};
const SongMiniPlayerView = ({
  currentSong,
  isPlaying,
  isLoading,
  togglePlay,
  handlePrevious,
  handleNext,
  currentIndex,
  songs,
  progress,
  duration,
  toggleFullScreen,
  showProgress,
}: SongMiniPlayerViewProps) => {
  const progressPercent =
    duration > 0 ? Math.min((progress / duration) * 100, 100) : 0;

  return (
    <Card
      className="p-4 bg-background/90 backdrop-blur-md border-0 border-t h-full rounded-none relative flex-row justify-between"
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
            className="rounded-md"
          />
          <p className="font-medium max-w-md mx-auto line-clamp-1">
            {currentSong.title}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            disabled={currentIndex <= 0}
            className="size-8 cursor-pointer"
          >
            <SkipBack className="size-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={togglePlay}
            className="rounded-full size-10 cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="size-5 animate-spin rounded-full border-2 border-white border-b-transparent" />
            ) : isPlaying ? (
              <Pause className="size-5" />
            ) : (
              <Play className="size-5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            disabled={currentIndex === songs.length - 1}
            className="size-8 cursor-pointer"
          >
            <SkipForward className="size-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export { SongMiniPlayerView };
