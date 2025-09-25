"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type youtubePlayer from "youtube-player";
import type { SongPlayerMode, SongWithUniqueId } from "@/app/_types";
import { saveUserPreference } from "@/app/actions";

type SongPlayerContextProps = {
  setCurrentSong: (song: SongWithUniqueId | null) => void;
  currentSong: SongWithUniqueId | null;
  youtubeId: string | null;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  isPlaying: boolean;
  setSong: (song: SongWithUniqueId | null, isPlaying?: boolean) => void;
  togglePlay: (e: React.MouseEvent) => void;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
  progress: number;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
  duration: number;
  playerRef: React.RefObject<ReturnType<typeof youtubePlayer> | null>;
  mode: SongPlayerMode;
  setMode: (mode: SongPlayerMode) => Promise<void>;
  setIsPlayerFullScreen: React.Dispatch<React.SetStateAction<boolean>>;
  isPlayerFullScreen: boolean;
  songs: SongWithUniqueId[];
  setSongs: React.Dispatch<React.SetStateAction<SongWithUniqueId[]>>;
  isCurrentSong: (song: SongWithUniqueId) => boolean;
};

const SongPlayerContext = createContext<SongPlayerContextProps | null>(null);

type SongPlayerProviderProps = {
  children: React.ReactNode;
  initialSong: SongWithUniqueId | null;
  initialMode: SongPlayerMode;
};

export function SongPlayerProvider({
  children,
  initialSong,
  initialMode,
}: SongPlayerProviderProps) {
  const [currentSong, setCurrentSong] = useState<SongWithUniqueId | null>(
    initialSong ?? null,
  );
  const [youtubeId, setYoutubeId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [mode, setMode] = useState<SongPlayerMode>(initialMode ?? "normal");
  const [isPlayerFullScreen, setIsPlayerFullScreen] = useState(false);
  const [songs, setSongs] = useState<SongWithUniqueId[]>([]);

  const playerRef = useRef<ReturnType<typeof youtubePlayer> | null>(null);

  const handleSetMode = async (mode: SongPlayerMode) => {
    setMode(mode);
    if (currentSong) {
      await saveUserPreference({ key: "songPlayerMode", value: mode });
    }
  };

  const getUniqueSongId = (song: SongWithUniqueId) => {
    if (song.favouriteId) return `favourite-${song.id}`;
    else if (song.historyId) return `history-${song.id}`;
    return `search-${song.id}`;
  };

  const setSong = (song: SongWithUniqueId | null, isPlaying = true) => {
    if (!song) return;
    setCurrentSong(song);
    setYoutubeId(song.id);
    setIsPlaying(isPlaying);

    const newId = getUniqueSongId(song);
    const currentId = currentSong ? getUniqueSongId(currentSong) : null;

    if (newId !== currentId) {
      const valueToSave = { ...song };

      if (song.favouriteId) valueToSave.favouriteId = song.id;
      else if (song.historyId) valueToSave.historyId = song.id;
      else valueToSave.searchId = song.id;

      saveUserPreference({
        key: "lastPlayedSong",
        value: valueToSave,
      });
    }
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

  const isCurrentSong = (song: SongWithUniqueId) => {
    if (!currentSong) return false;
    return getUniqueSongId(currentSong) === getUniqueSongId(song);
  };

  return (
    <SongPlayerContext.Provider
      value={{
        setCurrentSong,
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
        setMode: handleSetMode,
        setIsPlayerFullScreen,
        isPlayerFullScreen,
        songs,
        setSongs,
        isCurrentSong,
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
