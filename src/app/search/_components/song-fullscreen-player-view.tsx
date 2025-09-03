import {
  ChevronDown,
  EllipsisVertical,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
} from "lucide-react";
import Image from "next/image";
import type { Song } from "@/app/search/_types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/utils/cn";

type SongPlayerMode = "normal" | "shuffle" | "repeat";
type SongFullscreenPlayerViewProps = {
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
  handleSeek: (val: number[]) => void;
  mode: SongPlayerMode;
  toggleMode: (e: React.MouseEvent, newMode: SongPlayerMode) => void;
  isFullScreen: boolean;
  volume: number;
  getVolumeIcon: (volume: number) => React.ReactElement;
  handleVolumeChange: (val: number[]) => void;
  toggleVolumeMute: (e: React.MouseEvent) => void;
};
const SongFullscreenPlayerView = ({
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
  handleSeek,
  mode,
  toggleMode,
  toggleFullScreen,
  isFullScreen,
}: SongFullscreenPlayerViewProps) => {
  const formatTime = (seconds: number) => {
    if (!seconds || Number.isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card
      className={cn(
        "p-4 bg-background/90 backdrop-blur-md border-0 border-t h-full rounded-none justify-center",
        `${isFullScreen ? "rounded-none border-0" : "rounded-b-none"}`,
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleFullScreen}
        className="cursor-pointer absolute top-4 left-4"
      >
        <ChevronDown className="size-5" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="cursor-pointer absolute top-4 right-4"
            aria-label="Open dropdown menu"
            // onClick={(e) => e.stopPropagation()}
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
          <DropdownMenuItem>Option 1</DropdownMenuItem>
          <DropdownMenuItem>Option 2</DropdownMenuItem>
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
          >
            <Shuffle className="size-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            disabled={currentIndex <= 0}
            className="cursor-pointer size-10"
          >
            <SkipBack className="size-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={togglePlay}
            className="rounded-full size-14 cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="size-7 animate-spin rounded-full border-2 border-white border-b-transparent" />
            ) : isPlaying ? (
              <Pause className="size-7" />
            ) : (
              <Play className="size-7" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            disabled={currentIndex === songs.length - 1}
            className="cursor-pointer size-10"
          >
            <SkipForward className="size-5" />
          </Button>

          <Button
            variant={mode === "repeat" ? "default" : "ghost"}
            size="icon"
            onClick={(e) => toggleMode(e, "repeat")}
            className="cursor-pointer size-10"
          >
            <Repeat className="size-5" />
          </Button>
        </div>

        <div className="w-full">
          <Slider
            value={[progress]}
            max={duration}
            step={1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-1">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export { SongFullscreenPlayerView };
