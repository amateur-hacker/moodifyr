"use client";

import { useRef, useCallback } from "react";
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

const MiniPlayerView = ({
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
  handleSeek,
}: any) => {
  const progressPercent =
    duration > 0 ? Math.min((progress / duration) * 100, 100) : 0;

  const barRef = useRef<HTMLDivElement>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const calculateTime = useCallback(
    (clientX: number) => {
      if (!barRef.current) return 0;
      const rect = barRef.current.getBoundingClientRect();
      const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
      return (x / rect.width) * duration;
    },
    [duration],
  );

  const handleMouseMove = (e: React.MouseEvent) => {
    setHoverTime(calculateTime(e.clientX));
    // if (dragging) {
    //   handleSeek([calculateTime(e.clientX)]);
    // }
  };

  const handleMouseLeave = () => {
    if (!dragging) setHoverTime(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDragging(true);
    handleSeek([calculateTime(e.clientX)]);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDragging(false);
    handleSeek([calculateTime(e.clientX)]);
    setHoverTime(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    setHoverTime(calculateTime(e.touches[0].clientX));
    if (dragging) handleSeek([calculateTime(e.touches[0].clientX)]);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setDragging(true);
    handleSeek([calculateTime(e.touches[0].clientX)]);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    setDragging(false);
    setHoverTime(null);
  };

  return (
    <Card
      className="p-4 bg-ctp-mantle/90 backdrop-blur-md border-0 border-t h-full rounded-none relative flex-row justify-between group"
      onClick={toggleFullScreen}
    >
      <motion.div
        className="absolute top-0 left-0 w-full h-1 bg-primary"
        animate={{
          width: showProgress ? `${progressPercent}%` : 0,
          opacity: showProgress ? 1 : 0,
        }}
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

      {/* <div className="flex-1 flex justify-end"> */}
      {/*   <Button variant="ghost" size="icon" onClick={toggleFullScreen}> */}
      {/*     <Maximize2 className="size-5" /> */}
      {/*   </Button> */}
      {/* </div> */}

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            disabled={currentIndex <= 0}
          >
            <SkipBack className="size-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={togglePlay}
            className="rounded-full size-10"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="size-5 animate-spin rounded-full border-2 border-white border-b-transparent" />
            ) : isPlaying ? (
              <Pause className="size-6" />
            ) : (
              <Play className="size-6" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            disabled={currentIndex === songs.length - 1}
          >
            <SkipForward className="size-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

const FullscreenPlayerView = ({
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
  volume,
  getVolumeIcon,
  handleVolumeChange,
  toggleVolumeMute,
  toggleFullScreen,
  isFullScreen,
}: any) => {
  const formatTime = (seconds: number) => {
    if (!seconds || Number.isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card
      className={cn(
        "px-4 py-2 bg-ctp-mantle/90 backdrop-blur-md border-0 border-t h-full rounded-none",
        `${isFullScreen ? "rounded-none border-0" : "rounded-b-none"}`,
      )}
    >
      <div className="flex justify-end p-1">
        <Button variant="ghost" size="icon" onClick={toggleFullScreen}>
          <Minimize2 className="size-5" />
        </Button>
      </div>

      <div className="flex flex-col items-center gap-6 max-w-2xl mx-auto">
        <div className="flex flex-col items-center gap-3">
          <Image
            src={currentSong.thumbnail}
            alt={currentSong.title}
            width={150}
            height={150}
            className="rounded-md"
          />
          <p className="font-medium text-center">{currentSong.title}</p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant={mode === "shuffle" ? "default" : "ghost"}
            size="icon"
            onClick={(e) => toggleMode(e, "shuffle")}
            className="rounded-full"
          >
            <Shuffle className="size-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            disabled={currentIndex <= 0}
          >
            <SkipBack className="size-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={togglePlay}
            className="rounded-full size-14"
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
          >
            <SkipForward className="size-5" />
          </Button>

          <Button
            variant={mode === "repeat" ? "default" : "ghost"}
            size="icon"
            onClick={(e) => toggleMode(e, "repeat")}
            className="rounded-full"
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
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-1">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleVolumeMute}>
            {getVolumeIcon(volume)}
          </Button>
          <Slider
            value={[volume]}
            max={100}
            step={1}
            onValueChange={handleVolumeChange}
            className="w-28"
          />
          <span className="text-sm w-10 text-right">{volume}%</span>
        </div>
      </div>
    </Card>
  );
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
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [volume, setVolume] = useState(100);
  const [prevVolume, setPrevVolume] = useState(100);

  useScrollLock(isFullScreen);

  const currentIndex = currentSong
    ? songs.findIndex((s) => s.id === currentSong.id)
    : -1;

  const handleSeek = async (val: number[]) => {
    if (!playerRef.current) return;
    const wasPlaying = isPlaying;

    try {
      if (wasPlaying) await playerRef.current.pauseVideo();

      setProgress(val[0]);
      await playerRef.current.seekTo(val[0], true);

      if (wasPlaying) {
        setTimeout(async () => {
          if (playerRef.current) await playerRef.current.playVideo();
        }, 300);
      }
    } catch (error) {
      console.error("Error seeking:", error);
    }
  };

  const handlePrevious = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!currentSong) return;
    if (currentIndex > 0) {
      const prevSong = songs[currentIndex - 1];
      setSong(prevSong, prevSong.id);
    }
  };

  const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!currentSong) return;
    if (currentIndex !== -1 && currentIndex < songs.length - 1) {
      const nextSong = songs[currentIndex + 1];
      setSong(nextSong, nextSong.id);
    } else {
      setIsPlaying(false);
    }
  };

  const toggleMode = (
    e: React.MouseEvent<HTMLButtonElement>,
    newMode: "normal" | "shuffle" | "repeat",
  ) => {
    e.stopPropagation();
    setMode(mode === newMode ? "normal" : newMode);
  };

  const [showMiniProgress, setShowMiniProgress] = useState(!isFullScreen);

  const toggleFullScreen = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isFullScreen) {
      setShowMiniProgress(false);
    }
    setIsFullScreen((prev) => !prev);
  };

  const handleVolumeChange = (val: number[]) => {
    const newVolume = val[0];
    setVolume(newVolume);
    if (newVolume > 0) setPrevVolume(newVolume);
    if (playerRef.current) playerRef.current.setVolume(newVolume);
  };

  const toggleVolumeMute = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
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
      className="fixed bottom-0 left-0 right-0 z-50"
      initial={false}
      animate={
        isFullScreen
          ? { height: "100%", borderRadius: 0 }
          : { height: "auto", borderRadius: "0.25rem" }
      }
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onAnimationComplete={() => {
        if (!isFullScreen) setShowMiniProgress(true); // 👈 only enable after collapse finished
      }}
    >
      {isFullScreen ? (
        <FullscreenPlayerView
          currentSong={currentSong}
          isPlaying={isPlaying}
          isLoading={isLoading}
          togglePlay={togglePlay}
          handlePrevious={handlePrevious}
          handleNext={handleNext}
          currentIndex={currentIndex}
          songs={songs}
          progress={progress}
          duration={duration}
          handleSeek={handleSeek}
          mode={mode}
          toggleMode={toggleMode}
          volume={volume}
          getVolumeIcon={getVolumeIcon}
          handleVolumeChange={handleVolumeChange}
          toggleVolumeMute={toggleVolumeMute}
          toggleFullScreen={toggleFullScreen}
          isFullScreen={isFullScreen}
        />
      ) : (
        <MiniPlayerView
          currentSong={currentSong}
          isPlaying={isPlaying}
          isLoading={isLoading}
          togglePlay={togglePlay}
          handlePrevious={handlePrevious}
          handleNext={handleNext}
          currentIndex={currentIndex}
          songs={songs}
          progress={progress}
          duration={duration}
          toggleFullScreen={toggleFullScreen}
          showProgress={showMiniProgress}
          isFullScreen={isFullScreen}
          handleSeek={handleSeek}
        />
      )}
    </motion.div>
  );
};

export { SongPlayerBar };
