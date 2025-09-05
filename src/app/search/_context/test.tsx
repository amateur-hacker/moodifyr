"use client";

import { useElementSize } from "@mantine/hooks";
import { Volume, Volume1, Volume2, VolumeX } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { getAIRecommendedSongNames, searchSong } from "@/app/search/_actions";
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

  const [recommendedQueue, setRecommendedQueue] = useState<string[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [songMemory, setSongMemory] = useState<Map<string, Song>>(new Map());
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  useScrollLock(isFullScreen);

  // const currentIndex = currentSong
  //   ? songs.findIndex((s) => s.id === currentSong.id)
  //   : -1;

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

  const handleNext = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentSong) return;

    // Move in AI-recommended queue
    if (queueIndex + 1 < recommendedQueue.length) {
      const nextTitle = recommendedQueue[queueIndex + 1];

      // Check memory first
      let nextSong = songMemory.get(nextTitle);
      if (!nextSong) {
        const res = await searchSong({ query: nextTitle });
        if (res?.success && res.songs.length) {
          nextSong = res.songs[0];
          setSongMemory((prev) =>
            new Map(prev).set(nextTitle, nextSong as Song),
          );
        }
      }

      if (nextSong) {
        setSong(nextSong, nextSong.id);
        setQueueIndex(queueIndex + 1);
        setCurrentIndex(currentIndex + 1);
      }
      return;
    }

    // Fetch new AI recommendations
    const newRecommendations = await getAIRecommendedSongNames({
      query: currentSong.title,
    });
    if (newRecommendations?.length) {
      setRecommendedQueue(newRecommendations);
      setQueueIndex(0);

      let firstSong = songMemory.get(newRecommendations[0]);
      if (!firstSong) {
        const res = await searchSong({ query: newRecommendations[0] });
        if (res?.success && res.songs.length) {
          firstSong = res.songs[0];
          setSongMemory((prev) =>
            new Map(prev).set(newRecommendations[0], firstSong as Song),
          );
        }
      }

      if (firstSong) setSong(firstSong, firstSong.id);
    } else {
      setIsPlaying(false);
    }
  };

  const handlePrevious = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentSong) return;

    if (queueIndex > 0) {
      const prevTitle = recommendedQueue[queueIndex - 1];

      let prevSong = songMemory.get(prevTitle);
      if (!prevSong) {
        const res = await searchSong({ query: prevTitle });
        if (res?.success && res.songs.length) {
          prevSong = res.songs[0];
          setSongMemory((prev) =>
            new Map(prev).set(prevTitle, prevSong as Song),
          );
        }
      }

      if (prevSong) {
        setSong(prevSong, prevSong.id);
        setQueueIndex(queueIndex - 1);
        setCurrentIndex(currentIndex - 1);
      }
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

  useEffect(() => {
    if (!currentSong) return;

    const memorySongs = Array.from(songMemory.values());
    const index = memorySongs.findIndex((s) => s.id === currentSong.id);
    setCurrentIndex(index);
  }, [currentSong, songMemory]);

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
          songs={Array.from(songMemory.values())}
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
          songs={Array.from(songMemory.values())}
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

first use normal array object of id, title instead of map use better state name for that. then instead of set it in this component make this globally available.

"use client";

import { createContext, useContext, useRef, useState } from "react";
import type youtubePlayer from "youtube-player";
import type { SongPlayerMode } from "@/app/search/_types";
import { trackSongPlayHistory } from "../_actions";

type Song = {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  duration: { timestamp: string; seconds: number };
};

type SongPlayerContextType = {
  currentSong: Song | null;
  youtubeId: string | null;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  isPlaying: boolean;
  setSong: (song: Song, youtubeId: string) => void;
  togglePlay: (e: React.MouseEvent) => void;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
  progress: number;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
  duration: number;
  playerRef: React.RefObject<ReturnType<typeof youtubePlayer> | null>;
  mode: SongPlayerMode;
  setMode: React.Dispatch<
    React.SetStateAction<"normal" | "shuffle" | "repeat">
  >;
};

const SongPlayerContext = createContext<SongPlayerContextType | null>(null);

export function SongPlayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [youtubeId, setYoutubeId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [mode, setMode] = useState<"normal" | "shuffle" | "repeat">("normal");

  const playerRef = useRef<ReturnType<typeof youtubePlayer> | null>(null);

  const setSong = async (song: Song, id: string) => {
    setCurrentSong(song);
    setYoutubeId(id);
    setIsPlaying(true);

    await trackSongPlayHistory({ song });
  };

  const togglePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!playerRef.current) return;

    try {
      if (isPlaying) {
        await playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        await playerRef.current.playVideo();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error toggling play:", error);
    }
  };

  return (
    <SongPlayerContext.Provider
      value={{
        currentSong,
        youtubeId,
        setIsPlaying,
        isPlaying,
        setSong,
        togglePlay,
        isLoading,
        setIsLoading,
        playerRef,
        duration,
        setDuration,
        progress,
        setProgress,
        mode,
        setMode,
      }}
    >
      {children}
    </SongPlayerContext.Provider>
  );
}

export const useSongPlayer = () => {
  const ctx = useContext(SongPlayerContext);
  if (!ctx)
    throw new Error("useSongPlayer must be used inside SongPlayerProvider");
  return ctx;
};

use context api
