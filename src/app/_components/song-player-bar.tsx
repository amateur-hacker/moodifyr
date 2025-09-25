"use client";

import { useElementSize } from "@mantine/hooks";
import { Volume, Volume1, Volume2, VolumeX } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { SongFullscreenPlayerView } from "@/app/_components/song-fullscreen-player-view";
import { SongMiniPlayerView } from "@/app/_components/song-mini-player-view";
import { useSongPlayer } from "@/app/_context/song-player-context";
import { useScrollLock } from "@/hooks/use-scroll-lock";

const SongPlayerBar = () => {
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
    isPlayerFullScreen,
    setIsPlayerFullScreen,
    songs,
  } = useSongPlayer();

  const { ref, height } = useElementSize();
  // const [isFullScreen, setIsFullScreen] = useState(false);
  const [volume, setVolume] = useState(100);
  const [prevVolume, setPrevVolume] = useState(100);

  useScrollLock(isPlayerFullScreen);

  const currentIndex = currentSong
    ? songs.findIndex((s) => s.id === currentSong.id)
    : -1;

  const handleSeek = async (val: number[]) => {
    if (!playerRef.current) return;

    try {
      setProgress(val[0]);
      await playerRef.current.seekTo(val[0], true);
    } catch (error) {
      console.error("Error seeking:", error);
    }
  };

  // const handlePrevious = (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   if (!currentSong) return;
  //   if (currentIndex > 0) {
  //     const prevSong = songs[currentIndex - 1];
  //     setSong(prevSong);
  //   }
  // };

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentSong || !playerRef.current) return;

    playerRef.current.getCurrentTime().then((currentTime: number) => {
      if (currentIndex > 0 && currentTime < 5) {
        // Go to previous song
        const prevSong = songs[currentIndex - 1];
        setSong(prevSong);
      } else {
        // Restart current song
        playerRef?.current?.seekTo(0, true);
        setProgress(0);
      }
    });
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentSong) return;
    if (currentIndex !== -1 && currentIndex < songs.length - 1) {
      const nextSong = songs[currentIndex + 1];
      setSong(nextSong);
    } else {
      setIsPlaying(false);
    }
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentSong) return;
    setSong(currentSong);
    togglePlay(e);
  };

  const toggleMode = (
    e: React.MouseEvent,
    newMode: "normal" | "shuffle" | "repeat-all" | "repeat-one",
  ) => {
    e.stopPropagation();
    setMode(mode === newMode ? "normal" : newMode);
  };

  const [showMiniProgress, setShowMiniProgress] = useState(!isPlayerFullScreen);

  const toggleFullScreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPlayerFullScreen) {
      setShowMiniProgress(false);
    }
    setIsPlayerFullScreen((prev) => !prev);
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
      animate={isPlayerFullScreen ? { height: "100%" } : { height: "auto" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onAnimationComplete={() => {
        if (!isPlayerFullScreen) {
          setShowMiniProgress(true);
        }
      }}
    >
      {isPlayerFullScreen ? (
        <SongFullscreenPlayerView
          currentSong={currentSong}
          isPlaying={isPlaying}
          isLoading={isLoading}
          handlePlay={handlePlay}
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
          isFullScreen={isPlayerFullScreen}
        />
      ) : (
        <SongMiniPlayerView
          currentSong={currentSong}
          isPlaying={isPlaying}
          isLoading={isLoading}
          handlePlay={handlePlay}
          handlePrevious={handlePrevious}
          handleNext={handleNext}
          currentIndex={currentIndex}
          songs={songs}
          progress={progress}
          duration={duration}
          toggleFullScreen={toggleFullScreen}
          showProgress={showMiniProgress}
          mode={mode}
        />
      )}
    </motion.div>
  );
};

export { SongPlayerBar };
