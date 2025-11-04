"use client";

import { createContext, useContext, useRef, useState } from "react";
import type youtubePlayer from "youtube-player";
import type {
  SongPlayerMode,
  SongWithUniqueIdSchema,
} from "@/app/(app)/_types";
import { saveUserPreference } from "@/app/(app)/actions";
import { getUniqueSongId } from "@/app/(app)/utils";

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
  addRecentSong: (id: string) => void;
  shuffleQueue: SongWithUniqueIdSchema[];
  setShuffleQueue: React.Dispatch<
    React.SetStateAction<SongWithUniqueIdSchema[]>
  >;
  shuffleIndex: number;
  setShuffleIndex: React.Dispatch<React.SetStateAction<number>>;
  lastAction: "manual" | "next" | "prev" | "auto" | null;
  setLastAction: React.Dispatch<
    React.SetStateAction<"manual" | "next" | "prev" | "auto" | null>
  >;
  recentSongIds: string[];
  setRecentSongIds: React.Dispatch<React.SetStateAction<string[]>>;
};

const SongPlayerContext = createContext<SongPlayerContextProps | null>(null);

type SongPlayerProviderProps = {
  children: React.ReactNode;
  initialSong: SongWithUniqueIdSchema | null;
  initialMode: SongPlayerMode | null;
};
export function SongPlayerProvider({
  children,
  initialSong,
  initialMode,
}: SongPlayerProviderProps) {
  const [currentSong, setCurrentSong] = useState<SongWithUniqueIdSchema | null>(
    () => initialSong,
  );
  const [youtubeId, setYoutubeId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [mode, setMode] = useState<SongPlayerMode>(
    () => initialMode ?? "normal",
  );
  const [isPlayerFullScreen, setIsPlayerFullScreen] = useState(false);
  const [songs, setSongs] = useState<SongWithUniqueIdSchema[]>([]);
  const [shuffleQueue, setShuffleQueue] = useState<SongWithUniqueIdSchema[]>(
    [],
  );
  const [shuffleIndex, setShuffleIndex] = useState<number>(-1);
  const [lastAction, setLastAction] = useState<
    "manual" | "next" | "prev" | "auto" | null
  >(null);
  const [recentSongIds, setRecentSongIds] = useState<string[]>([]);

  const playerRef = useRef<ReturnType<typeof youtubePlayer>>(null);

  const handleSetMode = async (mode: SongPlayerMode) => {
    setMode(mode);
    if (currentSong) {
      await saveUserPreference({ key: "songPlayerMode", value: mode });
    }
  };

  const setSong = (song: SongWithUniqueIdSchema | null, isPlaying = true) => {
    if (!song) {
      setCurrentSong(null);
      setYoutubeId(null);
      setIsPlaying(false);
      setProgress(0);
      setDuration(0);
      return;
    }

    setCurrentSong(song);
    setYoutubeId(song.id);
    setIsPlaying(isPlaying);

    const newId = getUniqueSongId(song);
    const currentId = currentSong ? getUniqueSongId(currentSong) : null;

    if (newId !== currentId) {
      setProgress(0);
      setDuration(0);

      const valueToSave = { ...song };

      if (song.favouriteId) valueToSave.favouriteId = song.favouriteId;
      else if (song.historyId) valueToSave.historyId = song.historyId;
      else if (song.moodlistSongId)
        valueToSave.moodlistSongId = song.moodlistSongId;
      else if (song.dashboardSongId)
        valueToSave.dashboardSongId = song.dashboardSongId;
      else valueToSave.searchId = song.searchId;

      saveUserPreference({
        key: "lastPlayedSong",
        value: JSON.stringify(valueToSave),
      }).catch((error) =>
        console.warn("Error saving last played song:", error),
      );
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

  const addRecentSong = (id: string) => {
    setRecentSongIds((prev) => {
      const filtered = prev.filter((s) => s !== id);
      return [id, ...filtered].slice(0, 10);
    });
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
        shuffleQueue,
        setShuffleQueue,
        shuffleIndex,
        setShuffleIndex,
        lastAction,
        setLastAction,
        recentSongIds,
        setRecentSongIds,
        addRecentSong,
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
