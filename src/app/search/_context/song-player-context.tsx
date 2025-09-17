"use client";

import { createContext, useContext, useRef, useState } from "react";
import type youtubePlayer from "youtube-player";
import { saveUserPreference } from "@/app/actions";
import type { Song, SongPlayerMode } from "@/app/search/_types";
import { trackUserSongPlayHistory } from "@/app/search/actions";

type SongPlayerContextProps = {
  currentSong: Song | null;
  youtubeId: string | null;
  setIsPlaying: (status: boolean) => void;
  isPlaying: boolean;
  setSong: (song: Song, youtubeId: string) => void;
  togglePlay: (e: React.MouseEvent) => void;
  setIsLoading: (status: boolean) => void;
  isLoading: boolean;
  setProgress: (seconds: number) => void;
  progress: number;
  setDuration: (seconds: number) => void;
  duration: number;
  playerRef: React.RefObject<ReturnType<typeof youtubePlayer> | null>;
  mode: SongPlayerMode;
  setMode: (mode: SongPlayerMode) => void;
  setIsPlayerFullScreen: (status: boolean) => void;
  isPlayerFullScreen: boolean;
};

const SongPlayerContext = createContext<SongPlayerContextProps | null>(null);

type SongPlayerProviderProps = {
  children: React.ReactNode;
  initialSong: Song | null;
  initialMode: SongPlayerMode;
};
export function SongPlayerProvider({
  children,
  initialSong,
  initialMode,
}: SongPlayerProviderProps) {
  const [currentSong, setCurrentSong] = useState<Song | null>(
    initialSong ?? null,
  );
  const [youtubeId, setYoutubeId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const [mode, setMode] = useState<SongPlayerMode>(initialMode ?? "normal");
  const [isPlayerFullScreen, setIsPlayerFullScreen] = useState(false);

  const playerRef = useRef<ReturnType<typeof youtubePlayer> | null>(null);

  const handleSetMode = async (mode: SongPlayerMode) => {
    setMode(mode);
    if (currentSong) {
      await saveUserPreference({ key: "songPlayerMode", value: mode });
    }
  };

  const handleSetIsPlaying = async (status: boolean) => {
    setIsPlaying(status);
    if (currentSong) {
      await saveUserPreference({
        key: "songPlayerIsPlaying",
        value: String(status),
      });
    }
  };
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
        setIsPlaying: handleSetIsPlaying,
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
        setMode: handleSetMode,
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
