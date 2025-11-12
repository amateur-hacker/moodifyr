"use client";

import { useElementSize } from "@mantine/hooks";
import { Volume, Volume1, Volume2, VolumeX } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { SongFullscreenPlayerView } from "@/app/(app)/_components/song-fullscreen-player-view";
import { SongMiniPlayerView } from "@/app/(app)/_components/song-mini-player-view";
import type {
  FavouriteSongSchema,
  SongWithUniqueIdSchema,
} from "@/app/(app)/_types";
import type { getUserMoodlists } from "@/app/(app)/moodlists/queries";
import { generateShuffleQueue, getSongInstanceId } from "@/app/(app)/utils";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { useSongPlayerStore } from "@/store/song-player-store";

const SongPlayerBar = ({
  favouriteSongs,
  moodlists,
}: {
  favouriteSongs: FavouriteSongSchema[] | null;
  moodlists: Awaited<ReturnType<typeof getUserMoodlists>>;
}) => {
  const currentSong = useSongPlayerStore((s) => s.currentSong);
  const isPlaying = useSongPlayerStore((s) => s.isPlaying);
  const isLoading = useSongPlayerStore((s) => s.isLoading);
  const playerRef = useSongPlayerStore((s) => s.playerRef);
  const duration = useSongPlayerStore((s) => s.duration);
  const mode = useSongPlayerStore((s) => s.mode);
  const isPlayerFullScreen = useSongPlayerStore((s) => s.isPlayerFullScreen);
  const songs = useSongPlayerStore((s) => s.songs);
  const recentSongIds = useSongPlayerStore((s) => s.recentSongIds);
  const shuffleQueue = useSongPlayerStore((s) => s.shuffleQueue);
  const shuffleIndex = useSongPlayerStore((s) => s.shuffleIndex);
  const youtubeId = useSongPlayerStore((s) => s.youtubeId);
  const togglePlay = useSongPlayerStore((s) => s.togglePlay);
  const setProgress = useSongPlayerStore((s) => s.setProgress);
  const setSong = useSongPlayerStore((s) => s.setSong);
  const setIsPlaying = useSongPlayerStore((s) => s.setIsPlaying);
  const setMode = useSongPlayerStore((s) => s.setMode);
  const setIsPlayerFullScreen = useSongPlayerStore(
    (s) => s.setIsPlayerFullScreen,
  );
  const setLastAction = useSongPlayerStore((s) => s.setLastAction);
  const addRecentSong = useSongPlayerStore((s) => s.addRecentSong);
  const setShuffleQueue = useSongPlayerStore((s) => s.setShuffleQueue);
  const setShuffleIndex = useSongPlayerStore((s) => s.setShuffleIndex);

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

    setLastAction("prev");

    playerRef.current.getCurrentTime().then((currentTime: number) => {
      const currentIndex = songs.findIndex((s) => s.id === currentSong.id);

      if (mode === "shuffle" && playerRef?.current) {
        const queue = shuffleQueue;
        let index = shuffleIndex;

        if (currentTime > 5) {
          playerRef?.current.seekTo(0, true);
          setProgress(0);
          return;
        }

        if (index > 0) {
          index--;
          setShuffleQueue(shuffleQueue);
          setShuffleIndex(index);
          addRecentSong(currentSong.id);

          const prevSong = queue[index];
          setSong(prevSong);
        } else {
          playerRef.current.seekTo(0, true);
          setProgress(0);
        }

        return;
      }

      if (currentIndex > 0 && currentTime <= 5) {
        setSong(songs[currentIndex - 1]);
      } else {
        setSong(currentSong);
        playerRef.current?.seekTo(0, true);
        setProgress(0);
      }
    });
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentSong || !playerRef.current) return;

    setLastAction("next");

    if (mode === "shuffle") {
      let queue = shuffleQueue;
      let index = shuffleIndex;
      index++;

      if (index >= queue.length) {
        queue = generateShuffleQueue(songs, null, recentSongIds);
        index = 0;
      }

      addRecentSong(currentSong.id);
      setShuffleQueue(queue);
      setShuffleIndex(index);

      const nextSong = queue[index];
      if (nextSong) setSong(nextSong);
      return;
    }

    const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
    if (currentIndex !== -1 && currentIndex < songs.length - 1) {
      setSong(songs[currentIndex + 1]);
    } else {
      if (mode === "repeat-all" && currentIndex === songs.length - 1) {
        setSong(songs[0]);
      } else {
        setIsPlaying(false);
      }
    }
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentSong) return;
    setLastAction("manual");
    if (!youtubeId) {
      setSong(currentSong);
    }
    togglePlay(e);
  };

  const toggleMode = (
    e: React.MouseEvent,
    selectedMode: "normal" | "shuffle" | "repeat-all" | "repeat-one",
  ) => {
    e.stopPropagation();
    setMode(mode === selectedMode ? "normal" : selectedMode);
  };

  // // biome-ignore lint/correctness/useExhaustiveDependencies: <_>
  // useEffect(() => {
  //   if (
  //     mode === "shuffle" &&
  //     playerRef.current?.shuffleQueueRef &&
  //     playerRef.current?.shuffleIndexRef
  //   ) {
  //     const queue = generateShuffleQueue(
  //       songs,
  //       currentSong,
  //       recentSongIdsRef.current,
  //     );
  //     playerRef.current.shuffleQueueRef.current = queue;
  //     playerRef.current.shuffleIndexRef.current = 0;
  //   }
  // }, [songs, mode]);

  const [showMiniProgress, setShowMiniProgress] = useState(!isPlayerFullScreen);

  // const toggleFullScreen = (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //
  //   if (!isPlayerFullScreen) {
  //     setShowMiniProgress(false);
  //     setIsPlayerFullScreen(true);
  //
  //     const state = window.history.state;
  //     if (!state?.fullscreen) {
  //       window.history.pushState({ fullscreen: true }, "");
  //     }
  //   } else {
  //     setIsPlayerFullScreen(false);
  //
  //     const state = window.history.state;
  //     if (state?.fullscreen) {
  //       window.history.back();
  //     }
  //   }
  // };

  const toggleFullScreen = (e: React.MouseEvent) => {
    e.stopPropagation();

    const state = window.history.state ?? {};

    if (!isPlayerFullScreen) {
      setShowMiniProgress(false);
      setIsPlayerFullScreen(true);

      if (!state.__playerFullscreen) {
        window.history.pushState(
          { ...state, __playerFullscreen: true },
          "",
          window.location.href,
        );
      }
    } else {
      setIsPlayerFullScreen(false);

      if (state.__playerFullscreen) {
        window.history.replaceState(
          { ...state, __playerFullscreen: false },
          "",
          window.location.href,
        );
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: <_>
  useEffect(() => {
    if (height > 0 && currentSong) {
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
