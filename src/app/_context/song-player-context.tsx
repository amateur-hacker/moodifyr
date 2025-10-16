"use client";

import { createContext, useContext, useRef, useState } from "react";
import type youtubePlayer from "youtube-player";
import type { SongPlayerMode, SongWithUniqueIdSchema } from "@/app/_types";
import { saveUserPreference } from "@/app/actions";

type SongPlayerContextProps = {
  setCurrentSong: (song: SongWithUniqueIdSchema | null) => void;
  currentSong: SongWithUniqueIdSchema | null;
  youtubeId: string | null;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  isPlaying: boolean;
  setSong: (song: SongWithUniqueIdSchema | null, isPlaying?: boolean) => void;
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
  songs: SongWithUniqueIdSchema[];
  setSongs: React.Dispatch<React.SetStateAction<SongWithUniqueIdSchema[]>>;
  isCurrentSong: (song: SongWithUniqueIdSchema) => boolean;
  lastActionRef: React.RefObject<"manual" | "next" | "prev" | "auto" | null>;
};

const SongPlayerContext = createContext<SongPlayerContextProps | null>(null);

type SongPlayerProviderProps = {
  children: React.ReactNode;
  initialSong: SongWithUniqueIdSchema | null;
  initialMode: SongPlayerMode;
};
export function SongPlayerProvider({
  children,
  initialSong,
  initialMode,
}: SongPlayerProviderProps) {
  const [currentSong, setCurrentSong] = useState<SongWithUniqueIdSchema | null>(
    initialSong ?? null,
  );
  const [youtubeId, setYoutubeId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [mode, setMode] = useState<SongPlayerMode>(initialMode ?? "normal");
  const [isPlayerFullScreen, setIsPlayerFullScreen] = useState(false);
  const [songs, setSongs] = useState<SongWithUniqueIdSchema[]>([]);
  const lastActionRef = useRef<"manual" | "next" | "prev" | "auto" | null>(
    null,
  );

  const playerRef = useRef<ReturnType<typeof youtubePlayer> | null>(null);

  const handleSetMode = async (mode: SongPlayerMode) => {
    setMode(mode);
    if (currentSong) {
      await saveUserPreference({ key: "songPlayerMode", value: mode });
    }
  };

  const getUniqueSongId = (song: SongWithUniqueIdSchema) => {
    if (song.favouriteId) return `favourite-${song.favouriteId}`;
    else if (song.historyId) return `history-${song.historyId}`;
    else if (song.searchId) return `search-${song.searchId}`;
    else if (song.moodlistSongId) return `moodlist-${song.moodlistSongId}`;
    return `song-${song.id}`;
  };

  const setSong = (song: SongWithUniqueIdSchema | null, isPlaying = true) => {
    if (!song) return;
    setCurrentSong(song);
    setYoutubeId(song.id);
    setIsPlaying(isPlaying);

    const newId = getUniqueSongId(song);
    const currentId = currentSong ? getUniqueSongId(currentSong) : null;

    if (newId !== currentId) {
      const valueToSave = { ...song };

      if (song.favouriteId) valueToSave.favouriteId = song.favouriteId;
      else if (song.historyId) valueToSave.historyId = song.historyId;
      else valueToSave.searchId = song.searchId;

      saveUserPreference({
        key: "lastPlayedSong",
        value: JSON.stringify(valueToSave),
      }).catch((err) => console.warn("Failed to save last played song:", err));
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

  const isCurrentSong = (song: SongWithUniqueIdSchema) => {
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
        lastActionRef,
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
