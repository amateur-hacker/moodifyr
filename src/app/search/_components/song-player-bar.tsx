"use client";

import { useElementSize } from "@mantine/hooks";
import { Volume, Volume1, Volume2, VolumeX } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { SongFullscreenPlayerView } from "@/app/search/_components/song-fullscreen-player-view";
import { SongMiniPlayerView } from "@/app/search/_components/song-mini-player-view";
import { useSongPlayer } from "@/app/search/_context/song-player-context";
import type { Song } from "@/app/search/_types";
import { useScrollLock } from "@/hooks/use-scroll-lock";

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

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentSong) return;
    if (currentIndex > 0) {
      const prevSong = songs[currentIndex - 1];
      setSong(prevSong, prevSong.id);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
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
    e: React.MouseEvent,
    newMode: "normal" | "shuffle" | "repeat",
  ) => {
    e.stopPropagation();
    setMode(mode === newMode ? "normal" : newMode);
  };

  const [showMiniProgress, setShowMiniProgress] = useState(!isFullScreen);

  const toggleFullScreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isFullScreen) {
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

  const toggleVolumeMute = (e: React.MouseEvent) => {
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
      animate={isFullScreen ? { height: "100%" } : { height: "auto" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onAnimationComplete={() => {
        if (!isFullScreen) {
          setShowMiniProgress(true);
        }
      }}
    >
      {isFullScreen ? (
        <SongFullscreenPlayerView
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
        <SongMiniPlayerView
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
        />
      )}
    </motion.div>
  );
};

export { SongPlayerBar };
