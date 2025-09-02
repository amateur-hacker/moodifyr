"use client";

import { createContext, useContext, useRef, useState } from "react";
import type youtubePlayer from "youtube-player";
import type { SongPlayerMode } from "@/app/search/_types";

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

  const setSong = (song: Song, id: string) => {
    setCurrentSong(song);
    setYoutubeId(id);
    setIsPlaying(true);
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
