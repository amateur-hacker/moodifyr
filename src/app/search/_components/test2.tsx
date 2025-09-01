"use client";

import { motion } from "motion/react";
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Maximize2,
  Minimize2,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import Image from "next/image";
import { useElementSize } from "@mantine/hooks";
import { useSongPlayer } from "@/app/search/_context/song-player-context";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { useScrollLock } from "@/hooks/use-scroll-lock";

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(100);
  const [prevVolume, setPrevVolume] = useState(100);

  useScrollLock(isFullscreen);

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
    setMode(mode === newMode ? "normal" : newMode);
  };

  const toggleFullScreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  const handleVolumeChange = (val: number[]) => {
    const newVolume = val[0];
    setVolume(newVolume);

    if (newVolume > 0) {
      setPrevVolume(newVolume);
    }

    if (playerRef.current) {
      playerRef.current.setVolume(newVolume);
    }
  };

  const toggleVolumeMute = () => {
    if (volume === 0) {
      setVolume(prevVolume || 100);
      if (playerRef.current) playerRef.current.setVolume(prevVolume || 100);
    } else {
      setPrevVolume(volume);
      setVolume(0);
      if (playerRef.current) playerRef.current.setVolume(0);
    }
  };

  const getVolumeIcon = (volume: number) => {
    if (volume === 0) return <VolumeX className="size-5" />;
    if (volume > 0 && volume <= 30) return <Volume className="size-5" />;
    if (volume > 30 && volume <= 70) return <Volume1 className="size-5" />;
    return <Volume2 className="size-5" />;
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
    <motion.div
      ref={ref}
      className="fixed bottom-0 left-0 right-0 z-50 h-10"
      initial={false}
      animate={
        isFullscreen
          ? { height: "100%", borderRadius: 0 }
          : { height: "auto", borderRadius: "0.25rem" }
      }
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card
        className={cn(
          "px-4 py-2 bg-ctp-mantle/90 backdrop-blur-md border-0 border-t h-full rounded-none",
          `${isFullscreen ? "rounded-none border-0" : "rounded-b-none"}`,
        )}
      >
        <div className="flex justify-end p-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullScreen}
            className="cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize2 className="size-5" />
            ) : (
              <Maximize2 className="size-5" />
            )}
          </Button>
        </div>
        <div
          className={cn(
            "flex gap-6 items-center m-auto w-full shrink-0",

            `${isFullscreen ? "flex-col max-w-md" : "2xl:flex-row flex-col"}`,
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3 flex-1 justify-center",
              `${isFullscreen ? "flex-col" : "2xl:flex-row flex-col"}`,
            )}
          >
            <Image
              src={currentSong.thumbnail}
              alt={currentSong.title}
              width={isFullscreen ? 150 : 100}
              height={isFullscreen ? 75 : 50}
              className="rounded-md"
            />
            <p className="font-medium max-w-md mx-auto line-clamp-1">
              {currentSong.title}
            </p>
          </div>

          <div className="flex flex-col gap-6 justify-between items-center max-w-6xl mx-auto w-full">
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

            <div className="max-w-2xl w-full">
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
          </div>

          {/* <div className="flex-1 invisible"></div> */}

          {!isFullscreen && (
            <div className="hidden 2xl:flex items-center gap-2 flex-1 justify-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleVolumeMute}
                className="cursor-pointer"
              >
                {getVolumeIcon(volume)}
              </Button>
              <Slider
                value={[volume]}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="w-28 cursor-pointer"
              />
              <span className="text-sm w-10 text-right">{volume}%</span>
            </div>
          )}
          {/* {isFullscreen ? ( */}
          {/*   <div className="flex-1 invisible"></div> */}
          {/* ) : ( */}
          {/*   <div className="flex items-center gap-2 flex-1 justify-end"> */}
          {/*     <Button */}
          {/*       variant="ghost" */}
          {/*       size="icon" */}
          {/*       onClick={toggleVolumeMute} */}
          {/*       className="cursor-pointer" */}
          {/*     > */}
          {/*       {getVolumeIcon(volume)} */}
          {/*     </Button> */}
          {/*     <Slider */}
          {/*       value={[volume]} */}
          {/*       max={100} */}
          {/*       step={1} */}
          {/*       onValueChange={handleVolumeChange} */}
          {/*       className="w-28 cursor-pointer" */}
          {/*     /> */}
          {/*     <span className="text-sm w-10 text-right">{volume}%</span> */}
          {/*   </div> */}
          {/* )} */}
        </div>
      </Card>
    </motion.div>
  );
};

export { SongPlayerBar };
