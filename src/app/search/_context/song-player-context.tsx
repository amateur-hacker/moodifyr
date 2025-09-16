"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type youtubePlayer from "youtube-player";
import type { Song } from "@/app/search/_types";
import { trackUserSongPlayHistory } from "@/app/search/actions";

type SongPlayerMode = "normal" | "shuffle" | "repeat-all" | "repeat-one";

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
  setMode: React.Dispatch<React.SetStateAction<SongPlayerMode>>;
  setIsPlayerFullScreen: React.Dispatch<React.SetStateAction<boolean>>;
  isPlayerFullScreen: boolean;
};

const SongPlayerContext = createContext<SongPlayerContextType | null>(null);

type SongPlayerProviderProps = {
  children: React.ReactNode;
  initialSong: Song | null;
};
export function SongPlayerProvider({
  children,
  initialSong,
}: SongPlayerProviderProps) {
  const [currentSong, setCurrentSong] = useState<Song | null>(
    initialSong ?? null,
  );
  const [youtubeId, setYoutubeId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const [mode, setMode] = useState<SongPlayerMode>("normal");
  const [isPlayerFullScreen, setIsPlayerFullScreen] = useState(false);

  const playerRef = useRef<ReturnType<typeof youtubePlayer> | null>(null);

  // Sync mode from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem("songPlayerMode") as SongPlayerMode;
    if (savedMode) setMode(savedMode);

    // const savedFullScreen = localStorage.getItem("songPlayerFullScreen");
    // if (savedFullScreen === "true") setIsPlayerFullScreen(true);
  }, []);

  // Persist mode changes
  useEffect(() => {
    localStorage.setItem("songPlayerMode", mode);
  }, [mode]);

  // Persist fullscreen changes
  // useEffect(() => {
  //   localStorage.setItem("songPlayerFullScreen", isPlayerFullScreen.toString());
  // }, [isPlayerFullScreen]);

  const setSong = async (song: Song, id: string) => {
    setCurrentSong(song);
    setYoutubeId(id);
    setIsPlaying(true);
    await trackUserSongPlayHistory({ song });
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
        setIsPlayerFullScreen,
        isPlayerFullScreen,
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

export type { SongPlayerMode };
