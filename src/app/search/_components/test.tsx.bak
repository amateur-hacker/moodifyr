"use client";

import { useElementSize } from "@mantine/hooks";
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSongPlayer } from "@/app/search/_context/song-player-context";
import { Card } from "@/components/ui/card";
import { useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

type Song = {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  duration: { timestamp: string; seconds: number };
};

type SongPlayerBarProps = {
  songs: Song[];
};

const SongPlayerBar = ({ songs }: SongPlayerBarProps) => {
  const {
    currentSong,
    isPlaying,
    isLoading,
    togglePlay,
    playerRef,
    progress,
    duration,
    setProgress,
    setSong,
    setIsPlaying,
    mode,
    setMode,
  } = useSongPlayer();

  const { ref, height } = useElementSize();

  const currentIndex = currentSong
    ? songs.findIndex((s) => s.id === currentSong.id)
    : -1;

  const formatTime = (seconds: number) => {
    if (!seconds || Number.isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeek = async (val: number[]) => {
    if (!playerRef.current) return;

    const wasPlaying = isPlaying;

    try {
      if (wasPlaying) {
        await playerRef.current.pauseVideo();
      }

      setProgress(val[0]);
      await playerRef.current.seekTo(val[0], true);

      if (wasPlaying) {
        setTimeout(async () => {
          if (playerRef.current) {
            await playerRef.current.playVideo();
          }
        }, 300);
      }
    } catch (error) {
      console.error("Error seeking:", error);
    }
  };

  const handlePrevious = () => {
    if (!currentSong) return;
    if (currentIndex > 0) {
      const prevSong = songs[currentIndex - 1];
      setSong(prevSong, prevSong.id);
    }
  };

  const handleNext = () => {
    if (!currentSong) return;
    if (currentIndex !== -1 && currentIndex < songs.length - 1) {
      const nextSong = songs[currentIndex + 1];
      setSong(nextSong, nextSong.id);
    } else {
      setIsPlaying(false);
    }
  };

  const toggleMode = (newMode: "normal" | "shuffle" | "repeat") => {
    setMode(mode === newMode ? "normal" : newMode); // toggle off if same
  };

  useEffect(() => {
    if (height > 0) {
      document.documentElement.style.setProperty(
        "--player-height",
        `${height}px`,
      );
    }
  }, [height]);

  if (!currentSong) return null;

  return (
    <Card
      ref={ref}
      className="fixed bottom-0 left-0 right-0 z-50 px-4 py-2 bg-ctp-mantle/90 backdrop-blur-md rounded-b-none border-0 border-t"
    >
      <div className="flex flex-col gap-6 justify-between items-center max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <Image
            src={currentSong.thumbnail}
            alt={currentSong.title}
            width={100}
            height={100}
            className="rounded-md"
          />
          <p className="font-medium max-w-2xl w-full line-clamp-1">
            {currentSong.title}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant={mode === "shuffle" ? "default" : "ghost"}
            size="icon"
            onClick={() => toggleMode("shuffle")}
            className="cursor-pointer size-10 rounded-full"
          >
            <Shuffle className="size-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            className="cursor-pointer size-10"
            disabled={currentIndex <= 0}
          >
            <SkipBack className="size-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={togglePlay}
            className="cursor-pointer rounded-full size-14"
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
            className="cursor-pointer size-10"
            disabled={currentIndex === songs.length - 1}
          >
            <SkipForward className="size-5" />
          </Button>

          <Button
            variant={mode === "repeat" ? "default" : "ghost"}
            size="icon"
            onClick={() => toggleMode("repeat")}
            className="cursor-pointer size-10 rounded-full"
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
            className="w-full cursor-pointer"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-1">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <Link
          href={`/song/${currentSong.id}`}
          className="text-sm underline hover:no-underline"
        >
          Full View
        </Link>
      </div>
    </Card>
  );
};

export { SongPlayerBar };
