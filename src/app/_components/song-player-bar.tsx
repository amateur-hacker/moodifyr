"use client";

import { useElementSize } from "@mantine/hooks";
import { Volume, Volume1, Volume2, VolumeX } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { SongFullscreenPlayerView } from "@/app/_components/song-fullscreen-player-view";
import { SongMiniPlayerView } from "@/app/_components/song-mini-player-view";
import { useSongPlayer } from "@/app/_context/song-player-context";
import type { FavouriteSongSchema, SongWithUniqueIdSchema } from "@/app/_types";
import type { getUserMoodlists } from "@/app/moodlists/queries";
import { generateShuffleQueue, getSongInstanceId } from "@/app/utils";
import { useScrollLock } from "@/hooks/use-scroll-lock";

const SongPlayerBar = ({
  favouriteSongs,
  moodlists,
}: {
  favouriteSongs: FavouriteSongSchema[] | null;
  moodlists: Awaited<ReturnType<typeof getUserMoodlists>>;
}) => {
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
    lastActionRef,
    recentSongIdsRef,
  } = useSongPlayer();

  const { ref, height } = useElementSize();
  const [volume, setVolume] = useState(100);
  const [prevVolume, setPrevVolume] = useState(100);

  useScrollLock(isPlayerFullScreen);

  const currentIndex = currentSong
    ? songs.findIndex(
        (s) => getSongInstanceId(s) === getSongInstanceId(currentSong),
      )
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

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentSong || !playerRef.current) return;

    playerRef.current.getCurrentTime().then((currentTime: number) => {
      const currentIndex = songs.findIndex((s) => s.id === currentSong.id);

      if (
        mode === "shuffle" &&
        playerRef.current?.shuffleQueueRef &&
        playerRef.current?.shuffleIndexRef
      ) {
        const queue = playerRef.current.shuffleQueueRef.current;
        let index = playerRef.current.shuffleIndexRef.current;

        if (currentTime > 5) {
          playerRef.current.seekTo(0, true);
          setProgress(0);
          return;
        }

        if (index > 0) {
          index--;
          playerRef.current.shuffleQueueRef.current = queue;
          playerRef.current.shuffleIndexRef.current = index;
          recentSongIdsRef.current.unshift(currentSong.id);

          const prevSong = queue[index];
          setSong(prevSong);
        }

        return;
      }

      if (currentIndex > 0 && currentTime < 5) {
        setSong(songs[currentIndex - 1]);
      } else {
        playerRef.current?.seekTo(0, true);
        setProgress(0);
      }
    });
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentSong || !playerRef.current) return;

    lastActionRef.current = "next";

    if (
      mode === "shuffle" &&
      playerRef.current.shuffleQueueRef &&
      playerRef.current.shuffleIndexRef
    ) {
      let queue = playerRef.current.shuffleQueueRef.current;
      let index = playerRef.current.shuffleIndexRef.current;

      index++;

      if (index >= queue.length) {
        recentSongIdsRef.current.unshift(currentSong.id);

        queue = generateShuffleQueue(
          songs,
          currentSong,
          recentSongIdsRef.current,
        );
        index = 0;
      }

      playerRef.current.shuffleQueueRef.current = queue;
      playerRef.current.shuffleIndexRef.current = index;

      const nextSong = queue[index];
      if (nextSong) setSong(nextSong);
      return;
    }

    const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
    if (currentIndex !== -1 && currentIndex < songs.length - 1) {
      setSong(songs[currentIndex + 1]);
    } else if (mode === "repeat-all" && songs.length > 0) {
      setSong(songs[0]);
    } else {
      setIsPlaying(false);
    }
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentSong) return;
    lastActionRef.current = "manual";
    setSong(currentSong);
    togglePlay(e);
  };

  const toggleMode = (
    e: React.MouseEvent,
    selectedMode: "normal" | "shuffle" | "repeat-all" | "repeat-one",
  ) => {
    e.stopPropagation();
    setMode(mode === selectedMode ? "normal" : selectedMode);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <_>
  useEffect(() => {
    if (
      mode === "shuffle" &&
      playerRef.current?.shuffleQueueRef &&
      playerRef.current?.shuffleIndexRef
    ) {
      const queue = generateShuffleQueue(
        songs,
        currentSong,
        recentSongIdsRef.current,
      );
      playerRef.current.shuffleQueueRef.current = queue;
      playerRef.current.shuffleIndexRef.current = 0;
    }
  }, [songs, mode]);

  const [showMiniProgress, setShowMiniProgress] = useState(!isPlayerFullScreen);

  const toggleFullScreen = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isPlayerFullScreen) {
      setShowMiniProgress(false);
      setIsPlayerFullScreen(true);

      const state = window.history.state;
      if (!state?.fullscreen) {
        window.history.pushState({ fullscreen: true }, "");
      }
    } else {
      setIsPlayerFullScreen(false);

      const state = window.history.state;
      if (state?.fullscreen) {
        window.history.back();
      }
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <_>
  useEffect(() => {
    const handlePopState = (_event: PopStateEvent) => {
      if (isPlayerFullScreen) {
        // Close fullscreen instead of navigating away
        setIsPlayerFullScreen(false);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isPlayerFullScreen]);

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

  const isSongFavourite = (song: SongWithUniqueIdSchema) => {
    return favouriteSongs?.some((fav) => fav.id === song.id) ?? false;
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
      className="fixed bottom-0 left-0 right-0 z-50 will-change-transform will-change-height"
      initial={false}
      animate={isPlayerFullScreen ? { height: "100%" } : { height: "75px" }}
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
          isAlreadyFavourite={isSongFavourite(currentSong)}
          moodlists={moodlists}
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
